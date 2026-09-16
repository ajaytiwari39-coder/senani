#!/usr/bin/env python3
import os
import sys
import subprocess
import paramiko

SERVER_IP = '91.108.107.125'
SERVER_PORT = 65002
SERVER_USER = 'u797251166'
SERVER_PASS = 'jBhT)eGU=&KTTB6'
DOMAIN = 'yellow-kingfisher-542421.hostingersite.com'
APP_ROOT = f'/home/{SERVER_USER}/domains/{DOMAIN}/senani'
PUBLIC_HTML = f'/home/{SERVER_USER}/domains/{DOMAIN}/public_html'
LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))

def run_local(cmd):
    print(f'==> Local: {cmd}')
    res = subprocess.run(cmd, shell=True, cwd=LOCAL_DIR)
    if res.returncode != 0:
        print(f'Error running local command: {cmd}')
        sys.exit(res.returncode)

def main():
    print('🚀 Step 1: Building frontend assets locally...')
    run_local('npm run build')

    print('🚀 Step 2: Pushing Git changes to origin main...')
    subprocess.run('git add -A && git commit -m "deploy: update live build assets" || true', shell=True, cwd=LOCAL_DIR)
    run_local('git push origin main')

    print(f'🚀 Step 3: Connecting to Hostinger live server ({SERVER_IP})...')
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER_IP, port=SERVER_PORT, username=SERVER_USER, password=SERVER_PASS, timeout=30)

    def exec_remote(command):
        print(f'==> Remote: {command}')
        stdin, stdout, stderr = client.exec_command(command)
        out = stdout.read().decode('utf-8').strip()
        err = stderr.read().decode('utf-8').strip()
        if out: print(out)
        if err: print(err)

    print('🚀 Step 4: Pulling latest git commits on live server...')
    exec_remote(f'cd {APP_ROOT} && git pull origin main')

    print('🚀 Step 5: Uploading compiled Vite build assets & hotel images...')
    sftp = client.open_sftp()
    
    def sync_folder(local_folder, rel_target):
        for root, dirs, files in os.walk(local_folder):
            rel = os.path.relpath(root, local_folder)
            remote_dest1 = os.path.join(APP_ROOT, 'public', rel_target, '' if rel == '.' else rel)
            remote_dest2 = os.path.join(PUBLIC_HTML, rel_target, '' if rel == '.' else rel)
            for d in [remote_dest1, remote_dest2]:
                parts = d.split('/')
                cur = ''
                for part in parts:
                    if not part: continue
                    cur += '/' + part
                    try: sftp.mkdir(cur)
                    except: pass
            for f in files:
                lp = os.path.join(root, f)
                p1 = os.path.join(remote_dest1, f)
                p2 = os.path.join(remote_dest2, f)
                try:
                    sftp.put(lp, p1)
                    sftp.put(lp, p2)
                except Exception as e:
                    print(f"Notice uploading {f}: {e}")

    sync_folder(os.path.join(LOCAL_DIR, 'public', 'build'), 'build')
    sync_folder(os.path.join(LOCAL_DIR, 'public', 'images'), 'images')
    sftp.close()

    print('🚀 Step 6: Running migrations, seeders & voucher reset on live server with PHP 8.4...')
    exec_remote(f'cd {APP_ROOT} && /opt/alt/php84/usr/bin/php artisan migrate --force')
    exec_remote(f'cd {APP_ROOT} && /opt/alt/php84/usr/bin/php artisan db:seed --force')
    exec_remote(f'cd {APP_ROOT} && /opt/alt/php84/usr/bin/php artisan banquet:reset-vouchers')

    print('🚀 Step 7: Clearing remote Laravel caches with PHP 8.4...')
    exec_remote(f'cd {APP_ROOT} && /opt/alt/php84/usr/bin/php artisan optimize:clear')

    client.close()
    print('✅ Deployment Complete! Live at https://' + DOMAIN)

if __name__ == '__main__':
    main()
