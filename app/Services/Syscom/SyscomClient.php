<?php

namespace App\Services\Syscom;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class SyscomClient
{
    private const TOKEN_CACHE_KEY = 'syscom_token';

    private const TOKEN_TTL = 350 * 24 * 60;

    private const MAX_RETRIES = 3;

    private string $baseUrl;

    private string $clientId;

    private string $clientSecret;

    public function __construct()
    {
        $this->baseUrl = config('services.syscom.base_url', '');
        $this->clientId = config('services.syscom.client_id', '');
        $this->clientSecret = config('services.syscom.client_secret', '');
    }

    public function getAccessToken(): string
    {
        return Cache::remember(
            self::TOKEN_CACHE_KEY,
            self::TOKEN_TTL,
            fn () => $this->fetchAccessToken(),
        );
    }

    private function fetchAccessToken(): string
    {
        $response = Http::timeout(30)
            ->asForm()
            ->post($this->baseUrl.'/oauth/token', [
                'grant_type' => 'client_credentials',
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

        $response->throw();

        return $response->json('access_token');
    }

    private function request(string $method, string $endpoint, array $query = []): array
    {
        $token = $this->getAccessToken();
        $url = $this->baseUrl.$endpoint;

        $retries = 0;
        while ($retries < self::MAX_RETRIES) {
            try {
                $response = $this->makeRequest($method, $url, $query, $token);

                return $response->json();
            } catch (\Exception $e) {
                $retries = $this->handleRequestException($e, $retries, $token, $method, $url, $query);
            }
        }

        throw $e;
    }

    private function makeRequest(string $method, string $url, array $query, string $token): Response
    {
        return Http::withToken($token)
            ->timeout(30)
            ->{strtolower($method)}($url, $query);
    }

    private function handleRequestException(
        \Exception $e,
        int $retries,
        string $token,
        string $method,
        string $url,
        array $query,
    ): int {
        if ($e instanceof RequestException) {
            if ($e->response?->status() === 401) {
                Cache::forget(self::TOKEN_CACHE_KEY);
                $token = $this->getAccessToken();

                return $retries;
            }

            if ($e->response?->status() === 429) {
                $retryAfter = $e->response?->header('Retry-After');
                $sleepSeconds = $retryAfter ?? 1;
                sleep((int) $sleepSeconds);

                return $retries + 1;
            }
        }

        throw $e;
    }

    public function getCategories(): array
    {
        return $this->request('GET', '/categorias');
    }

    public function getBrands(int $page = 1): array
    {
        return $this->request('GET', '/marcas', ['page' => $page]);
    }

    public function getProducts(array $filters = [], int $page = 1): array
    {
        $params = array_merge($filters, ['page' => $page]);

        return $this->request('GET', '/productos', $params);
    }

    public function getProductDetail(string $id): array
    {
        return $this->request('GET', "/productos/{$id}");
    }
}
