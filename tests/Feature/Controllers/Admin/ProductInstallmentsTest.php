<?php

use App\Models\Product;
use App\Models\User;

beforeEach(fn () => actingAsAdmin());

it('defaults new products to no installments', function () {
    $this->actingAs($this->admin)->post('/admin/products', ['name' => 'Default MSI', 'price' => 100])->assertRedirect();
    $product = Product::where('name', 'Default MSI')->firstOrFail();
    expect($product->msi_3_months)->toBeFalse()->and($product->msi_6_months)->toBeFalse();
});

it('creates and edits each installment configuration', function (bool $three, bool $six) {
    $payload = ['name' => 'MSI', 'price' => 900, 'msi_3_months' => $three, 'msi_6_months' => $six];
    $this->actingAs($this->admin)->post('/admin/products', $payload)->assertRedirect();
    $product = Product::where('name', 'MSI')->firstOrFail();
    expect($product->msi_3_months)->toBe($three)->and($product->msi_6_months)->toBe($six);
    $this->actingAs($this->admin)->put("/admin/products/{$product->id}", array_merge($payload, ['msi_3_months' => ! $three, 'msi_6_months' => ! $six]))->assertRedirect();
    expect($product->fresh()->msi_3_months)->toBe(! $three)->and($product->fresh()->msi_6_months)->toBe(! $six);
})->with([[false, false], [true, false], [false, true], [true, true]]);

it('replaces installments only on selected products', function (bool $three, bool $six) {
    $selected = Product::factory()->count(2)->create(['msi_3_months' => ! $three, 'msi_6_months' => ! $six]);
    $other = Product::factory()->create(['msi_3_months' => ! $three, 'msi_6_months' => ! $six]);
    $this->actingAs($this->admin)->from('/admin/products?search=MSI')->patch('/admin/products/installments', [
        'product_ids' => $selected->modelKeys(), 'msi_3_months' => $three, 'msi_6_months' => $six,
    ])->assertRedirect('/admin/products?search=MSI')->assertSessionHas('success');
    foreach ($selected as $product) {
        expect($product->fresh()->msi_3_months)->toBe($three)->and($product->fresh()->msi_6_months)->toBe($six);
    }
    expect($other->fresh()->msi_3_months)->toBe(! $three)->and($other->fresh()->msi_6_months)->toBe(! $six);
})->with([[false, false], [true, false], [false, true], [true, true]]);

it('rejects an invalid batch without modifying any product', function (string $kind) {
    $product = Product::factory()->create();
    $deleted = Product::factory()->create();
    $deleted->delete();
    $payload = ['product_ids' => [$product->id], 'msi_3_months' => true, 'msi_6_months' => true];
    match ($kind) {
        'deleted' => $payload['product_ids'][] = $deleted->id,
        'missing' => $payload['product_ids'][] = 999999,
        'duplicate' => $payload['product_ids'][] = $product->id,
        'empty' => $payload['product_ids'] = [],
        'boolean' => $payload['msi_3_months'] = 'invalid',
        'required' => $payload = ['product_ids' => [$product->id]],
    };
    $this->actingAs($this->admin)->patch('/admin/products/installments', $payload)->assertSessionHasErrors();
    expect($product->fresh()->msi_3_months)->toBeFalse()->and($product->fresh()->msi_6_months)->toBeFalse();
})->with(['deleted', 'missing', 'duplicate', 'empty', 'boolean', 'required']);

it('requires administrative access to update installments', function () {
    $payload = ['product_ids' => [Product::factory()->create()->id], 'msi_3_months' => true, 'msi_6_months' => false];
    $this->patch('/admin/products/installments', $payload)->assertRedirect('/login');
    $this->actingAs(User::factory()->create())->patch('/admin/products/installments', $payload)->assertForbidden();
});

it('rejects invalid individual installment values', function () {
    $this->actingAs($this->admin)->post('/admin/products', [
        'name' => 'Invalid', 'price' => 100, 'msi_3_months' => 'invalid', 'msi_6_months' => [],
    ])->assertSessionHasErrors(['msi_3_months', 'msi_6_months']);
});
