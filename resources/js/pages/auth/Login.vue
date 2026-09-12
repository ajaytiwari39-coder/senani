<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { useForm } from '@inertiajs/vue3';
import { ref } from 'vue';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldAlert, Sparkles, CheckCircle2 } from '@lucide/vue';
import { request } from '@/routes/password';

defineOptions({
    layout: {
        title: 'Sign In to Admin Portal',
        description: 'Authorized personnel only. Sessions are audited and logged.',
    },
});

defineProps<{
    status?: string;
    canResetPassword?: boolean;
}>();

const form = useForm({
    email: '',
    password: '',
    remember: true,
});

const showPassword = ref(false);

const fillAdminCredentials = () => {
    form.email = 'admin@senani.com';
    form.password = 'Admin@12345';
};

const submit = () => {
    form.post('/login', {
        onFinish: () => form.reset('password'),
    });
};
</script>

<template>
    <Head title="Admin Login - Senani ERP" />

    <!-- Status alert -->
    <div v-if="status" class="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-medium text-emerald-400 flex items-center justify-center gap-2">
        <CheckCircle2 class="h-4 w-4 shrink-0" />
        {{ status }}
    </div>

    <!-- General Error Banner -->
    <div v-if="form.errors.email || form.errors.password" class="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
        <ShieldAlert class="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
            <span class="font-bold block">Authentication Failed</span>
            {{ form.errors.email || form.errors.password }}
        </div>
    </div>

    <!-- 1-Click Quick Fill Helper -->
    <div class="mb-5 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-amber-300">
        <div class="flex items-center gap-1.5">
            <Sparkles class="h-3.5 w-3.5 text-amber-400" />
            <span class="text-[11px]">Quick Admin Access</span>
        </div>
        <button
            type="button"
            @click="fillAdminCredentials"
            class="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition"
        >
            Fill Admin Credentials
        </button>
    </div>

    <form @submit.prevent="submit" class="space-y-4">
        <!-- Email Field -->
        <div>
            <label for="email" class="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrator Email
            </label>
            <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail class="h-4 w-4" />
                </div>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    autofocus
                    autocomplete="username"
                    placeholder="admin@senani.com"
                    class="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                    :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500': form.errors.email }"
                />
            </div>
        </div>

        <!-- Password Field -->
        <div>
            <div class="flex items-center justify-between mb-1.5">
                <label for="password" class="block text-xs font-semibold text-slate-300">
                    Security Password
                </label>
                <a
                    v-if="canResetPassword"
                    :href="request()"
                    class="text-[11px] text-amber-400 hover:text-amber-300 hover:underline transition"
                >
                    Forgot Password?
                </a>
            </div>
            <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock class="h-4 w-4" />
                </div>
                <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    autocomplete="current-password"
                    placeholder="••••••••••••"
                    class="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                    :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500': form.errors.password }"
                />
                <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                    <EyeOff v-if="showPassword" class="h-4 w-4" />
                    <Eye v-else class="h-4 w-4" />
                </button>
            </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                    type="checkbox"
                    v-model="form.remember"
                    class="h-4 w-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                />
                Remember this terminal for 30 days
            </label>
        </div>

        <!-- Submit Button -->
        <button
            type="submit"
            :disabled="form.processing"
            class="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <svg
                v-if="form.processing"
                class="h-4 w-4 animate-spin text-slate-950"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <LogIn v-else class="h-4 w-4 stroke-[2.5]" />
            <span>{{ form.processing ? 'Verifying Credentials...' : 'Authenticate & Enter' }}</span>
        </button>
    </form>
</template>
