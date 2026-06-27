<?php

namespace App\Exceptions\Syscom;

class SyscomRequestException extends SyscomApiException
{
    public static function fromStatus(string $endpoint, int $status, ?\Throwable $previous = null): self
    {
        return new self("SYSCOM API request to {$endpoint} returned status {$status}.", 0, $previous);
    }
}
