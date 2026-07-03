<?php

namespace App\Services;

class HtmlSanitizer
{
    private const ALLOWED_TAGS = '<b><i><strong><em><u><p><br><ul><ol><li><a><h3><h4><span><hr>';

    private const STRIP_PATTERNS = [
        '/\s+on\w+\s*=\s*(["\'])[^"\']*\1/iu',
        '/\s+on\w+\s*=\s*[^\s>]+/iu',
        '/href\s*=\s*(["\'])javascript:[^"\']*\1/iu',
        '/href\s*=\s*javascript:[^\s>]+/iu',
        '/\s+style\s*=\s*(["\'])[^"\']*\1/iu',
        '/\s+style\s*=\s*[^\s>]+/iu',
    ];

    public static function sanitize(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        $sanitized = strip_tags($html, self::ALLOWED_TAGS);

        foreach (self::STRIP_PATTERNS as $pattern) {
            $sanitized = preg_replace($pattern, '', $sanitized);
        }

        return trim($sanitized) !== '' ? $sanitized : null;
    }
}
