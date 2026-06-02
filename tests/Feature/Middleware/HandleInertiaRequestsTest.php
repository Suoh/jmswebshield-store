<?php

namespace Tests\Feature\Middleware;

use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
});

describe('HandleInertiaRequests auth.isAdmin prop', function () {
    it('shares isAdmin true when user email matches ADMIN_EMAIL', function () {
        $admin = User::factory()->create(['email' => 'admin@test.com']);

        config(['app.admin_email' => 'admin@test.com']);

        $response = $this->actingAs($admin)->get('/products');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('auth.isAdmin', true)
            );
    });

    it('shares isAdmin false when user email does not match ADMIN_EMAIL', function () {
        $user = User::factory()->create(['email' => 'user@test.com']);

        config(['app.admin_email' => 'admin@test.com']);

        $response = $this->actingAs($user)->get('/products');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('auth.isAdmin', false)
            );
    });

    it('shares isAdmin false when user is guest', function () {
        $response = $this->get('/products');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('auth.isAdmin', false)
            );
    });
});

describe('HandleInertiaRequests whatsappNumber prop', function () {
    it('shares whatsappNumber from services.whatsapp.number config', function () {
        config(['services.whatsapp.number' => '5491123456789']);

        $response = $this->get('/products');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('whatsappNumber', '5491123456789')
            );
    });

    it('shares whatsappNumber as null when config is not set', function () {
        config(['services.whatsapp.number' => null]);

        $response = $this->get('/products');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('whatsappNumber', null)
            );
    });
});
