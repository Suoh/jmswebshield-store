<?php

namespace App\Exceptions\Syscom;

class SyscomRateLimitException extends SyscomApiException
{
    public function __construct(public readonly ?int $retryAfter = null, ?\Throwable $previous = null)
    {
        $message = $retryAfter
            ? "SYSCOM API rate limit exceeded. Retry after {$retryAfter} seconds."
            : 'SYSCOM API rate limit exceeded.';

        parent::__construct($message, 0, $previous);
    }
}
