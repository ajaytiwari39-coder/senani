<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Reception Front Desk
        User::updateOrCreate(
            ['email' => 'reception@senani.com'],
            [
                'name' => 'Reception Front Desk',
                'password' => bcrypt('Reception@123'),
                'role' => 'reception',
            ]
        );

        // 2. Banquet Operations Manager
        User::updateOrCreate(
            ['email' => 'manager@senani.com'],
            [
                'name' => 'Banquet Operations Manager',
                'password' => bcrypt('Manager@123'),
                'role' => 'manager',
            ]
        );

        // 3. Managing Director (MD Sir)
        User::updateOrCreate(
            ['email' => 'md@senani.com'],
            [
                'name' => 'Managing Director (MD Sir)',
                'password' => bcrypt('MD@123'),
                'role' => 'md',
            ]
        );

        // 4. Super Administrator
        User::updateOrCreate(
            ['email' => 'admin@senani.com'],
            [
                'name' => 'Super Administrator',
                'password' => bcrypt('Admin@123'),
                'role' => 'superadmin',
            ]
        );
    }
}
