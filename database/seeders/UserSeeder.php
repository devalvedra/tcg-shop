<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed the application with demo administrator and customer accounts.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['phone' => '09171234567'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'role' => User::ROLE_ADMIN,
                'email' => 'admin@example.com',
                'password' => 'password',
            ],
        );

        User::updateOrCreate(
            ['phone' => '09170000001'],
            [
                'name' => 'Customer User',
                'role' => User::ROLE_CUSTOMER,
                'email' => 'customer@example.com',
                'password' => User::DEFAULT_CUSTOMER_PASSWORD,
            ],
        );
    }
}
