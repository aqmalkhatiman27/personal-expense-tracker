<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = ['Cash', 'Debit Card', 'E-Wallet', 'Online Transfer'];

        foreach ($paymentMethods as $paymentMethod) {
            PaymentMethod::firstOrCreate([
                'name' => $paymentMethod,
            ]);
        }
    }
}
