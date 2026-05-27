<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmails = array_filter(
            array_map('trim', explode(',', env('ADMIN_EMAILS', '')))
        );

        foreach ($adminEmails as $email) {
            User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => 'Admin',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
