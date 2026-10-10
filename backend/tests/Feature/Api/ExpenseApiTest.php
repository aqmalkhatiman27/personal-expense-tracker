<?php

namespace Tests\Feature\Api;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExpenseApiTest extends TestCase
{
    use RefreshDatabase;

    private function validExpenseData(int $categoryId, int $paymentMethodId): array
    {
        return [
            'description' => 'Test grocery purchase',
            'amount' => '25.50',
            'expense_date' => now()->toDateString(),
            'category_id' => $categoryId,
            'payment_method_id' => $paymentMethodId,
            'note' => 'Feature test',
        ];
    }

    public function test_authenticated_user_can_perform_full_expense_crud(): void
    {
        $user = User::factory()->create();
        $category = $user->categories()->create(['name' => 'Groceries']);
        $method = PaymentMethod::create(['name' => 'Cash']);
        Sanctum::actingAs($user);

        $created = $this->postJson('/api/expenses', $this->validExpenseData($category->id, $method->id));
        $created->assertCreated()->assertJsonPath('data.user_id', $user->id);
        $id = $created->json('data.id');

        $this->getJson('/api/expenses')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/expenses/'.$id)
            ->assertOk()
            ->assertJsonPath('data.id', $id);

        $updated = $this->validExpenseData($category->id, $method->id);
        $updated['description'] = 'Updated groceries';

        $this->putJson('/api/expenses/'.$id, $updated)
            ->assertOk()
            ->assertJsonPath('data.description', 'Updated groceries');

        $this->assertDatabaseHas('expenses', [
            'id' => $id,
            'user_id' => $user->id,
            'description' => 'Updated groceries',
        ]);

        $this->deleteJson('/api/expenses/'.$id)->assertNoContent();
        $this->assertDatabaseMissing('expenses', ['id' => $id]);
        $this->getJson('/api/expenses/'.$id)->assertNotFound();
    }

    public function test_other_users_cannot_read_modify_or_delete_an_expense(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $ownerCategory = $owner->categories()->create(['name' => 'Food']);
        $otherCategory = $other->categories()->create(['name' => 'Food']);
        $method = PaymentMethod::create(['name' => 'Cash']);
        $expense = $owner->expenses()->create($this->validExpenseData($ownerCategory->id, $method->id));

        Sanctum::actingAs($other);

        $this->getJson('/api/expenses')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/expenses/'.$expense->id)->assertNotFound();
        $this->putJson('/api/expenses/'.$expense->id, $this->validExpenseData($otherCategory->id, $method->id))
            ->assertNotFound();
        $this->deleteJson('/api/expenses/'.$expense->id)->assertNotFound();

        $this->postJson('/api/expenses', $this->validExpenseData($ownerCategory->id, $method->id))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category_id');

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'user_id' => $owner->id,
        ]);
    }

    public function test_invalid_expense_fields_are_rejected(): void
    {
        $user = User::factory()->create();
        $category = $user->categories()->create(['name' => 'Food']);
        $method = PaymentMethod::create(['name' => 'Cash']);
        Sanctum::actingAs($user);

        $invalid = $this->validExpenseData($category->id, $method->id);
        $invalid['amount'] = '-2.99';
        $invalid['expense_date'] = now()->addDay()->toDateString();
        $invalid['payment_method_id'] = 99999;

        $this->postJson('/api/expenses', $invalid)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['amount', 'expense_date', 'payment_method_id']);
    }
}
