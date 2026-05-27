<?php

use App\Models\Brand;
use App\Models\Product;

beforeEach(function () {
    $this->withoutVite();
});

it('renders products index with paginated active products', function () {
    $brand = Brand::factory()->create();
    Product::factory()->count(15)->create(['is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->count(3)->create(['is_active' => false, 'brand_id' => $brand->id]);

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
    $brand = Brand::factory()->create();
    Product::factory()->count(5)->create(['is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->count(5)->create(['is_active' => false, 'brand_id' => $brand->id]);

    $response = $this->get('/products');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/index')
            ->where('products.total', 5)
        );
});

it('renders product show page with brand', function () {
    $brand = Brand::factory()->create();
    $product = Product::factory()->create(['brand_id' => $brand->id]);

    $response = $this->get("/products/{$product->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/[id]/show')
            ->has('product')
            ->where('product.id', $product->id)
            ->where('product.name', $product->name)
            ->has('product.brand')
            ->where('product.brand.id', $brand->id)
        );
});

it('returns 404 for nonexistent product', function () {
    $response = $this->get('/products/99999');

    $response->assertNotFound();
});
