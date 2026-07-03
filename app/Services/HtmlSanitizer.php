<?php

namespace App\Services;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer as SymfonySanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

class HtmlSanitizer
{
    private static ?SymfonySanitizer $instance = null;

    public static function sanitize(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        $sanitized = self::getSanitizer()->sanitize($html);

        if ($sanitized === null || trim($sanitized) === '') {
            return null;
        }

        return $sanitized;
    }

    private static function getSanitizer(): SymfonySanitizer
    {
        if (self::$instance === null) {
            $config = (new HtmlSanitizerConfig)
                ->allowSafeElements()
                ->allowElement('img', ['src', 'alt', 'class'])
                ->dropAttribute('on*', '*')
                ->dropAttribute('style', '*')
                ->blockElement('script')
                ->blockElement('style')
                ->blockElement('iframe')
                ->blockElement('object')
                ->blockElement('embed')
                ->allowLinkSchemes(['https', 'http', 'mailto', 'tel'])
                ->allowMediaSchemes(['https'])
                ->forceHttpsUrls(false);

            self::$instance = new SymfonySanitizer($config);
        }

        return self::$instance;
    }
}
