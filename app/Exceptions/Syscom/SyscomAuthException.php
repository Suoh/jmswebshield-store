<?php

namespace App\Exceptions\Syscom;

class SyscomAuthException extends SyscomApiException
{
    public static function tokenExpired(): self
    {
        return new self('SYSCOM authentication failed: token expired or invalid.');
    }
}
