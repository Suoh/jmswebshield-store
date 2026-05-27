<?php

use App\Models\Marca;
use App\Models\Product;

beforeEach(function () {
    $this->withoutVite();
});

it('renders products index with paginated active products', function () {
    $marca = Marca::factory()->create();
    Product::factory()->count(15)->create(['is_active' => true, 'marca_id' => $marca->id]);
    Product::factory()->count(3)->create(['is_active' => false, 'marca_id' => $marca->id]);

    $response = $this->get('/products');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/index')
            ->has('products.data', 12)
            ->has('products.links')
            ->where('products.total', 15)
        );
});

it('only shows active products on index', function () {
    $marca = Marca::factory()->create();
    Product::factory()->count(5)->create(['is_active' => true, 'marca_id' => $marca->id]);
    Product::factory()->count(5)->create(['is_active' => false, 'marca_id' => $marca->id]);

    $response = $this->get('/products');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/index')
            ->where('products.total', 5)
        );
});

it('renders product show page with marca', function () {
    $marca = Marca::factory()->create();
    $product = Product::factory()->create(['marca_id' => $marca->id]);

    $response = $this->get("/products/{$product->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/[id]/show')
            ->has('product')
            ->where('product.id', $product->id)
            ->where('product.name', $product->name)
            ->has('product.marca')
            ->where('product.marca.id', $marca->id)
        );
});

it('returns 404 for nonexistent product', function () {
    $response = $this->get('/products/99999');

    $response->assertNotFound();
});
