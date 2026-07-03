<?php

use App\Models\Brand;
use App\Models\Category;
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

it('always passes brands list to the view', function () {
    $brand = Brand::factory()->create(['name' => 'Acme Corp']);

    $response = $this->get('/products');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('brands')
            ->where('brands.0.name', 'Acme Corp')
        );
});

it('filters products by search term matching name', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['name' => 'Monitor LG 27"', 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['name' => 'Teclado Mecánico', 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['name' => 'Mouse Inalámbrico', 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?search=Monitor');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
            ->where('products.data.0.name', 'Monitor LG 27"')
        );
});

it('filters products by search term matching short_description', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['short_description' => 'Pantalla 4K HDR', 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['short_description' => 'Teclado RGB', 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?search=4K');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
            ->where('products.data.0.short_description', 'Pantalla 4K HDR')
        );
});

it('filters products by search term matching model', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['model' => 'XK-500', 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['model' => 'M-200', 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?search=XK-500');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
            ->where('products.data.0.model', 'XK-500')
        );
});

it('filters products by single brand', function () {
    $brandA = Brand::factory()->create(['name' => 'Brand A']);
    $brandB = Brand::factory()->create(['name' => 'Brand B']);
    Product::factory()->create(['brand_id' => $brandA->id, 'is_active' => true]);
    Product::factory()->create(['brand_id' => $brandA->id, 'is_active' => true]);
    Product::factory()->create(['brand_id' => $brandB->id, 'is_active' => true]);

    $response = $this->get("/products?brand[]={$brandA->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 2)
        );
});

it('filters products by multiple brands', function () {
    $brandA = Brand::factory()->create();
    $brandB = Brand::factory()->create();
    $brandC = Brand::factory()->create();
    Product::factory()->create(['brand_id' => $brandA->id, 'is_active' => true]);
    Product::factory()->create(['brand_id' => $brandB->id, 'is_active' => true]);
    Product::factory()->create(['brand_id' => $brandC->id, 'is_active' => true]);

    $response = $this->get("/products?brand[]={$brandA->id}&brand[]={$brandB->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 2)
        );
});

it('filters products by minimum price', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['price' => 100.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 500.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 1000.00, 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?price_min=500');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 2)
        );
});

it('filters products by maximum price', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['price' => 100.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 500.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 1000.00, 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?price_max=500');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 2)
        );
});

it('filters products by price range', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['price' => 100.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 500.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 1000.00, 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?price_min=200&price_max=800');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
            ->where('products.data.0.price', '500.00')
        );
});

it('filters products by in_stock', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['stock' => 0, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['stock' => 5, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['stock' => 10, 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?stock=in_stock');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 2)
        );
});

it('sorts products by price ascending', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['price' => 1000.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 100.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 500.00, 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?sort=price&order=asc');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.data.0.price', '100.00')
            ->where('products.data.1.price', '500.00')
            ->where('products.data.2.price', '1000.00')
        );
});

it('sorts products by price descending', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['price' => 100.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 1000.00, 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['price' => 500.00, 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?sort=price&order=desc');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.data.0.price', '1000.00')
            ->where('products.data.1.price', '500.00')
            ->where('products.data.2.price', '100.00')
        );
});

it('sorts products by name ascending', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['name' => 'Zebra', 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['name' => 'Apple', 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->create(['name' => 'Monitor', 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?sort=name&order=asc');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.data.0.name', 'Apple')
            ->where('products.data.1.name', 'Monitor')
            ->where('products.data.2.name', 'Zebra')
        );
});

it('sorts products by created_at descending by default', function () {
    $brand = Brand::factory()->create();
    $old = Product::factory()->create(['is_active' => true, 'brand_id' => $brand->id, 'created_at' => now()->subDays(5)]);
    $new = Product::factory()->create(['is_active' => true, 'brand_id' => $brand->id, 'created_at' => now()]);

    $response = $this->get('/products');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.data.0.id', $new->id)
        );
});

it('combines search with brand and price filters', function () {
    $brandA = Brand::factory()->create();
    $brandB = Brand::factory()->create();
    Product::factory()->create(['name' => 'Monitor', 'price' => 500.00, 'is_active' => true, 'brand_id' => $brandA->id]);
    Product::factory()->create(['name' => 'Monitor', 'price' => 1000.00, 'is_active' => true, 'brand_id' => $brandB->id]);
    Product::factory()->create(['name' => 'Teclado', 'price' => 200.00, 'is_active' => true, 'brand_id' => $brandA->id]);

    $response = $this->get("/products?search=Monitor&brand[]={$brandA->id}&price_max=600");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
            ->where('products.data.0.name', 'Monitor')
            ->where('products.data.0.price', '500.00')
        );
});

it('preserves query string in pagination links', function () {
    $brand = Brand::factory()->create();
    Product::factory()->create(['name' => 'Monitor Gamer Pro 27"', 'is_active' => true, 'brand_id' => $brand->id]);
    Product::factory()->count(24)->create(['name' => 'Monitor XYZ', 'is_active' => true, 'brand_id' => $brand->id]);

    $response = $this->get('/products?search=Monitor&sort=price&order=asc');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.current_page', 1)
            ->where('products.total', 25)
            ->where('products.per_page', 12)
        );
});

it('passes categories to the catalog index view', function () {
    $category = Category::factory()->create(['name' => 'Audio']);
    $brand = Brand::factory()->create();
    Product::factory()->create(['brand_id' => $brand->id, 'is_active' => true]);

    $response = $this->get('/products');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('categories')
            ->where('categories.0.id', $category->id)
            ->where('categories.0.name', 'Audio')
        );
});

it('filters products by single category', function () {
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();
    $brand = Brand::factory()->create();
    $productA = Product::factory()->create(['brand_id' => $brand->id, 'is_active' => true]);
    $productB = Product::factory()->create(['brand_id' => $brand->id, 'is_active' => true]);
    $productA->categories()->attach($categoryA);
    $productB->categories()->attach($categoryB);

    $response = $this->get("/products?category[]={$categoryA->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
            ->where('products.data.0.id', $productA->id)
        );
});

it('filters products by multiple categories', function () {
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();
    $categoryC = Category::factory()->create();
    $brand = Brand::factory()->create();
    $productA = Product::factory()->create(['brand_id' => $brand->id, 'is_active' => true]);
    $productB = Product::factory()->create(['brand_id' => $brand->id, 'is_active' => true]);
    $productC = Product::factory()->create(['brand_id' => $brand->id, 'is_active' => true]);
    $productA->categories()->attach($categoryA);
    $productB->categories()->attach($categoryB);
    $productC->categories()->attach($categoryC);

    $response = $this->get("/products?category[]={$categoryA->id}&category[]={$categoryB->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 2)
        );
});

it('excludes products without categories when category filter is active', function () {
    $category = Category::factory()->create();
    $brand = Brand::factory()->create();
    $productWithCat = Product::factory()->create(['brand_id' => $brand->id, 'is_active' => true]);
    $productWithoutCat = Product::factory()->create(['brand_id' => $brand->id, 'is_active' => true]);
    $productWithCat->categories()->attach($category);

    $response = $this->get("/products?category[]={$category->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
            ->where('products.data.0.id', $productWithCat->id)
        );
});

it('combines category filter with brand and price filters', function () {
    $category = Category::factory()->create();
    $brandA = Brand::factory()->create();
    $brandB = Brand::factory()->create();
    $productA = Product::factory()->create(['price' => 100.00, 'brand_id' => $brandA->id, 'is_active' => true]);
    $productB = Product::factory()->create(['price' => 500.00, 'brand_id' => $brandB->id, 'is_active' => true]);
    $productA->categories()->attach($category);
    $productB->categories()->attach($category);

    $response = $this->get("/products?category[]={$category->id}&brand[]={$brandA->id}&price_max=200");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.total', 1)
            ->where('products.data.0.id', $productA->id)
        );
});

it('loads product categories on show page', function () {
    $category = Category::factory()->create(['name' => 'Cámaras']);
    $brand = Brand::factory()->create();
    $product = Product::factory()->create(['brand_id' => $brand->id]);
    $product->categories()->attach($category);

    $response = $this->get("/products/{$product->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('product.categories')
            ->where('product.categories.0.id', $category->id)
            ->where('product.categories.0.name', 'Cámaras')
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
