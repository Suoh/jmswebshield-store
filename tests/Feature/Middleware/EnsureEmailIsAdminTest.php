<?php

namespace Tests\Feature\Middleware;

use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
});

describe('EnsureEmailIsAdmin middleware', function () {
    it('allows admin email to access admin routes', function () {
        $admin = User::factory()->create(['email' => 'admin@test.com']);

        config(['app.admin_email' => 'admin@test.com']);

        $response = $this->actingAs($admin)->get('/admin/brands');

        $response->assertOk();
    });

    it('denies non-admin email access to admin routes', function () {
        $user = User::factory()->create(['email' => 'user@test.com']);

        config(['app.admin_email' => 'admin@test.com']);

        $response = $this->actingAs($user)->get('/admin/brands');

        $response->assertForbidden();
    });

    it('redirects unauthenticated users to login', function () {
        $response = $this->get('/admin/brands');

        $response->assertRedirect('/login');
    });
});
