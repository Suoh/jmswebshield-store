<?php

namespace App\Exceptions\Syscom;

use RuntimeException;

class SyscomApiException extends RuntimeException
{
    public static function fromRequest(string $endpoint, ?\Throwable $previous = null): self
    {
        return new self("SYSCOM API request to {$endpoint} failed.", 0, $previous);
    }
}
