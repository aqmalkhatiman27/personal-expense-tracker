<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_me_logout_and_revocation(): void
    {
        $user = User::factory()->create(['email' => 'auth-test@example.com']);

        $login = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $login->assertOk()->assertJsonStructure(['token']);
        $token = $login->json('token');
        $headers = ['Authorization' => 'Bearer '.$token];

        $this->getJson('/api/me', $headers)
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);

        $this->postJson('/api/logout', [], $headers)->assertNoContent();
        Auth::forgetGuards();
        $this->getJson('/api/me', $headers)->assertUnauthorized();
    }

    public function test_invalid_credentials_and_missing_token_are_rejected(): void
    {
        User::factory()->create(['email' => 'auth-test@example.com']);

        $this->postJson('/api/login', [
            'email' => 'auth-test@example.com',
            'password' => 'incorrect-password',
        ])->assertUnauthorized();

        $this->getJson('/api/me')->assertUnauthorized();
        $this->getJson('/api/expenses')->assertUnauthorized();
    }
}
