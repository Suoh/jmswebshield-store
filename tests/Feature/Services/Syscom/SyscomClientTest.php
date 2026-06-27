<?php

namespace Tests\Feature\Services\Syscom;

use App\Exceptions\Syscom\SyscomApiException;
use App\Exceptions\Syscom\SyscomAuthException;
use App\Exceptions\Syscom\SyscomRateLimitException;
use App\Exceptions\Syscom\SyscomRequestException;
use App\Services\Syscom\SyscomClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->withoutVite();
    Cache::flush();
});

describe('SyscomClient', function () {
    describe('getAccessToken', function () {
        it('fetches token from SYSCOM OAuth endpoint', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::response([
                    'access_token' => 'test_token_123',
                    'token_type' => 'Bearer',
                    'expires_in' => 31536000,
                ], 200),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'test_client_id']);
            config(['services.syscom.client_secret' => 'test_client_secret']);

            $client = new SyscomClient;
            $token = $client->getAccessToken();

            expect($token)->toBe('test_token_123');

            Http::assertSentCount(1);
        });

        it('caches token in Cache with 350 day TTL', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::response([
                    'access_token' => 'cached_token_abc',
                    'token_type' => 'Bearer',
                    'expires_in' => 31536000,
                ], 200),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'client']);
            config(['services.syscom.client_secret' => 'secret']);

            $client = new SyscomClient;
            $token1 = $client->getAccessToken();
            $token2 = $client->getAccessToken();

            expect($token1)->toBe('cached_token_abc');
            expect($token2)->toBe('cached_token_abc');
            Http::assertSentCount(1);
        });

        it('refreshes token on 401 response', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::sequence()
                    ->push(['access_token' => 'expired_token'], 200)
                    ->push(['access_token' => 'new_refreshed_token'], 200),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'client']);
            config(['services.syscom.client_secret' => 'secret']);

            $client = new SyscomClient;

            $token1 = $client->getAccessToken();
            expect($token1)->toBe('expired_token');

            Cache::forget('syscom_token');

            $token2 = $client->getAccessToken();
            expect($token2)->toBe('new_refreshed_token');
        });
    });

    describe('getCategories', function () {
        it('returns array of categories from SYSCOM API', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::response([
                    'access_token' => 'valid_token',
                    'token_type' => 'Bearer',
                    'expires_in' => 31536000,
                ], 200),
                'syscom-api.example.com/api/v1/categorias' => Http::response([
                    ['id' => '1', 'nombre' => 'Routers'],
                    ['id' => '2', 'nombre' => 'Switches'],
                ], 200),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'client']);
            config(['services.syscom.client_secret' => 'secret']);

            $client = new SyscomClient;
            $categories = $client->getCategories();

            expect($categories)->toBeArray()
                ->toHaveCount(2)
                ->and($categories[0])->toHaveKey('id', '1')
                ->and($categories[0])->toHaveKey('nombre', 'Routers');
        });
    });

    describe('getBrands', function () {
        it('returns brands array from SYSCOM API', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::response([
                    'access_token' => 'token',
                    'token_type' => 'Bearer',
                    'expires_in' => 31536000,
                ], 200),
                'syscom-api.example.com/api/v1/marcas*' => Http::response([
                    ['id' => 'tp-link', 'nombre' => 'TP-Link'],
                    ['id' => 'netgear', 'nombre' => 'Netgear'],
                ], 200),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'client']);
            config(['services.syscom.client_secret' => 'secret']);

            $client = new SyscomClient;
            $result = $client->getBrands(1);

            expect($result)->toBeArray()
                ->toHaveCount(2)
                ->and($result[0])->toHaveKey('id', 'tp-link')
                ->and($result[0])->toHaveKey('nombre', 'TP-Link');
        });
    });

    describe('getProducts', function () {
        it('passes filters as query parameters', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::response([
                    'access_token' => 'token',
                    'token_type' => 'Bearer',
                    'expires_in' => 31536000,
                ], 200),
                'syscom-api.example.com/api/v1/productos*' => Http::response([
                    'cantidad' => 0,
                    'pagina' => 1,
                    'paginas' => 1,
                    'productos' => [],
                ], 200),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'client']);
            config(['services.syscom.client_secret' => 'secret']);

            $client = new SyscomClient;
            $result = $client->getProducts(['categoria' => '5', 'marca' => 'tp-link'], 1);

            expect($result)->toHaveKey('productos');

            Http::assertSent(function ($request) {
                return str_contains($request->url(), 'categoria=5')
                    && str_contains($request->url(), 'marca=tp-link')
                    && str_contains($request->url(), 'pagina=1');
            });
        });
    });

    describe('getProductDetail', function () {
        it('returns full product detail for given id', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::response([
                    'access_token' => 'token',
                    'token_type' => 'Bearer',
                    'expires_in' => 31536000,
                ], 200),
                'syscom-api.example.com/api/v1/productos/12345' => Http::response([
                    'id' => '12345',
                    'nombre' => 'Router RBK852',
                    'descripcion_corta' => 'Sistema WiFi mesh',
                    'stock' => 25,
                    'precios' => [
                        'precio_lista' => 15000.00,
                        'precio_descuento' => 13500.00,
                    ],
                ], 200),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'client']);
            config(['services.syscom.client_secret' => 'secret']);

            $client = new SyscomClient;
            $product = $client->getProductDetail('12345');

            expect($product)->toHaveKey('id', '12345')
                ->toHaveKey('nombre', 'Router RBK852')
                ->toHaveKey('stock', 25);
        });
    });

    describe('custom exceptions', function () {
        it('throws SyscomAuthException when token endpoint fails', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::response(['error' => 'invalid'], 401),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'client']);
            config(['services.syscom.client_secret' => 'secret']);

            $client = new SyscomClient;

            expect(fn () => $client->getAccessToken())
                ->toThrow(SyscomAuthException::class);
        });

        it('throws SyscomRequestException on non-401/429 API errors', function () {
            Http::fake([
                'syscom-api.example.com/oauth/token' => Http::response(['access_token' => 'token'], 200),
                'syscom-api.example.com/api/v1/categorias' => Http::response(['error' => 'server'], 500),
            ]);

            config(['services.syscom.base_url' => 'https://syscom-api.example.com']);
            config(['services.syscom.client_id' => 'client']);
            config(['services.syscom.client_secret' => 'secret']);

            $client = new SyscomClient;

            expect(fn () => $client->getCategories())
                ->toThrow(SyscomRequestException::class);
        });

        it('all SYSCOM exceptions are catchable as SyscomApiException', function () {
            $auth = new SyscomAuthException('auth failed');
            $rate = new SyscomRateLimitException(retryAfter: 5);
            $req = new SyscomRequestException('req failed');

            expect($auth)->toBeInstanceOf(SyscomApiException::class);
            expect($rate)->toBeInstanceOf(SyscomApiException::class);
            expect($req)->toBeInstanceOf(SyscomApiException::class);
        });
    });
});
