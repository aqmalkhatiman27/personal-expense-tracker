<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\PaymentMethod;
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
        $this->call(PaymentMethodSeeder::class);

        $paymentMethods = PaymentMethod::all();

        $primaryUser = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
        ]);

        $secondaryUser = User::factory()->create([
            'name' => 'Second Demo User',
            'email' => 'second@example.com',
        ]);

        $primaryCategories = $primaryUser->categories()->createMany([
            ['name' => 'Food'],
            ['name' => 'Groceries'],
            ['name' => 'Transport'],
            ['name' => 'Utilities'],
            ['name' => 'Shopping'],
        ]);

        $secondaryCategories = $secondaryUser->categories()->createMany([
            ['name' => 'Food'],
            ['name' => 'Transport'],
            ['name' => 'Entertainment'],
        ]);

        Expense::factory()
            ->count(35)
            ->for($primaryUser)
            ->state(fn () => [
                'category_id' => $primaryCategories->random()->id,
                'payment_method_id' => $paymentMethods->random()->id,
            ])
            ->create();

        Expense::factory()
            ->count(6)
            ->for($secondaryUser)
            ->state(fn () => [
                'category_id' => $secondaryCategories->random()->id,
                'payment_method_id' => $paymentMethods->random()->id,
            ])
            ->create();
    }
}
