<?php

namespace Tests\Feature\Api;

use App\Models\PaymentMethod;
use App\Models\User;
use Database\Seeders\PaymentMethodSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReferenceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_are_scoped_and_names_are_unique_per_user(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $user->categories()->create(['name' => 'Food']);
        $otherCategory = $other->categories()->create(['name' => 'Travel']);
        Sanctum::actingAs($user);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->postJson('/api/categories', ['name' => 'Food'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');

        $this->postJson('/api/categories', ['name' => 'Travel'])
            ->assertCreated()
            ->assertJsonPath('data.user_id', $user->id);

        $this->deleteJson('/api/categories/'.$otherCategory->id)->assertNotFound();
    }

    public function test_used_category_cannot_be_deleted_but_unused_category_can(): void
    {
        $user = User::factory()->create();
        $used = $user->categories()->create(['name' => 'Food']);
        $unused = $user->categories()->create(['name' => 'Travel']);
        $method = PaymentMethod::create(['name' => 'Cash']);
        $user->expenses()->create([
            'description' => 'Lunch',
            'amount' => '10.00',
            'expense_date' => now()->toDateString(),
            'category_id' => $used->id,
            'payment_method_id' => $method->id,
        ]);
        Sanctum::actingAs($user);

        $this->deleteJson('/api/categories/'.$used->id)->assertStatus(409);
        $this->assertDatabaseHas('categories', ['id' => $used->id]);

        $this->deleteJson('/api/categories/'.$unused->id)->assertNoContent();
        $this->assertDatabaseMissing('categories', ['id' => $unused->id]);
    }

    public function test_authenticated_users_can_list_shared_payment_methods(): void
    {
        $this->seed(PaymentMethodSeeder::class);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/payment-methods')
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonPath('data.0.name', 'Cash');
    }
}
