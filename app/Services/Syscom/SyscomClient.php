<?php

namespace App\Services\Syscom;

use App\Exceptions\Syscom\SyscomApiException;
use App\Exceptions\Syscom\SyscomAuthException;
use App\Exceptions\Syscom\SyscomRequestException;
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
        try {
            $response = Http::timeout(30)
                ->asForm()
                ->post($this->baseUrl.'/oauth/token', [
                    'grant_type' => 'client_credentials',
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                ]);

            $response->throw();
        } catch (RequestException $e) {
            throw SyscomAuthException::tokenExpired();
        }

        return $response->json('access_token');
    }

    private function request(string $method, string $endpoint, array $query = [], int $timeout = 30): array
    {
        $token = $this->getAccessToken();
        $url = $this->baseUrl.$endpoint;

        $retries = 0;
        $lastException = null;
        while ($retries < self::MAX_RETRIES) {
            try {
                $response = $this->makeRequest($method, $url, $query, $token, $timeout);

                return $response->json();
            } catch (SyscomApiException $e) {
                throw $e;
            } catch (\Exception $e) {
                $lastException = $e;
                $retries = $this->handleRequestException($e, $retries, $token, $method, $url, $query);
            }
        }

        if ($lastException instanceof SyscomApiException) {
            throw $lastException;
        }

        throw SyscomApiException::fromRequest($url, $lastException);
    }

    private function makeRequest(string $method, string $url, array $query, string $token, int $timeout = 30): Response
    {
        $response = Http::withToken($token)
            ->timeout($timeout)
            ->{strtolower($method)}($url, $query);

        $response->throw();

        return $response;
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

                try {
                    $token = $this->getAccessToken();
                } catch (SyscomApiException) {
                    throw SyscomAuthException::tokenExpired();
                }

                return $retries;
            }

            if ($e->response?->status() === 429) {
                $retryAfter = (int) ($e->response?->header('Retry-After') ?? 1);
                sleep($retryAfter);

                return $retries + 1;
            }

            $status = $e->response?->status() ?? 0;
            throw SyscomRequestException::fromStatus($url, $status, $e);
        }

        throw $e;
    }

    public function getCategories(): array
    {
        return $this->request('GET', '/api/v1/categorias');
    }

    public function getBrands(int $page = 1): array
    {
        return $this->request('GET', '/api/v1/marcas', ['pagina' => $page]);
    }

    public function getProducts(array $filters = [], int $page = 1): array
    {
        $params = array_merge($filters, ['pagina' => $page]);

        return $this->request('GET', '/api/v1/productos', $params);
    }

    public function getProductDetail(string $id): array
    {
        return $this->request('GET', "/api/v1/productos/{$id}", timeout: 60);
    }
}
