<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');

        if (! $email) {
            $this->command?->warn('ADMIN_EMAIL not set — skipping admin user creation.');

            return;
        }

        $password = env('ADMIN_INITIAL_PASSWORD', 'password');

        if (app()->environment('production') && $password === 'password') {
            Log::warning('ADMIN_INITIAL_PASSWORD not set in production. Using insecure default.');
        }

        User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'Admin',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ],
        );
    }
}
