<?php

use App\Exceptions\Syscom\SyscomApiException;
use App\Exceptions\Syscom\SyscomAuthException;
use App\Exceptions\Syscom\SyscomRateLimitException;
use App\Exceptions\Syscom\SyscomRequestException;

it('SyscomApiException is the base exception for all SYSCOM errors', function () {
    $exception = SyscomApiException::fromRequest('https://api.syscom.mx/test');

    expect($exception)->toBeInstanceOf(SyscomApiException::class)
        ->and($exception->getMessage())->toContain('https://api.syscom.mx/test');
});

it('SyscomAuthException extends SyscomApiException for token failures', function () {
    $exception = SyscomAuthException::tokenExpired();

    expect($exception)->toBeInstanceOf(SyscomApiException::class)
        ->and($exception->getMessage())->toContain('token expired');
});

it('SyscomRateLimitException carries retry-after seconds', function () {
    $exception = new SyscomRateLimitException(retryAfter: 30);

    expect($exception)->toBeInstanceOf(SyscomApiException::class)
        ->and($exception->retryAfter)->toBe(30)
        ->and($exception->getMessage())->toContain('30 seconds');

    $noRetry = new SyscomRateLimitException;
    expect($noRetry->retryAfter)->toBeNull()
        ->and($noRetry->getMessage())->toContain('rate limit');
});

it('SyscomRequestException captures endpoint and status code', function () {
    $exception = SyscomRequestException::fromStatus('https://api.syscom.mx/products', 500);

    expect($exception)->toBeInstanceOf(SyscomApiException::class)
        ->and($exception->getMessage())->toContain('500')
        ->and($exception->getMessage())->toContain('https://api.syscom.mx/products');
});

it('controllers can catch any SYSCOM error as SyscomApiException', function () {
    $auth = new SyscomAuthException('token expired');
    $rate = new SyscomRateLimitException(retryAfter: 5);
    $request = new SyscomRequestException('http failure');

    expect($auth)->toBeInstanceOf(SyscomApiException::class);
    expect($rate)->toBeInstanceOf(SyscomApiException::class);
    expect($request)->toBeInstanceOf(SyscomApiException::class);
});
