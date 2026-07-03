<?php

use App\Services\HtmlSanitizer;

describe('HtmlSanitizer', function () {
    it('returns null for null input', function () {
        expect(HtmlSanitizer::sanitize(null))->toBeNull();
    });

    it('returns null for empty string', function () {
        expect(HtmlSanitizer::sanitize(''))->toBeNull();
    });

    it('returns null for whitespace-only string', function () {
        expect(HtmlSanitizer::sanitize("  \t \n  "))->toBeNull();
    });

    it('passes through plain text unchanged', function () {
        $text = 'This is plain text with no HTML.';
        expect(HtmlSanitizer::sanitize($text))->toBe($text);
    });

    it('preserves allowed HTML tags', function () {
        $html = '<p>Hello <b>world</b> from <i>HTML</i>.</p>'
            .'<ul><li>Item 1</li><li>Item <strong>2</strong></li></ul>'
            .'<h3>Heading</h3>'
            .'<hr>'
            .'<br>';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->toContain('<p>')
            ->toContain('<b>')
            ->toContain('<i>')
            ->toContain('<ul>')
            ->toContain('<li>')
            ->toContain('<strong>')
            ->toContain('<h3>')
            ->toContain('<hr')
            ->toContain('<br');
    });

    it('preserves link tags with href attribute', function () {
        $html = '<a href="https://example.com">Click here</a>';

        expect(HtmlSanitizer::sanitize($html))->toBe($html);
    });

    it('strips script tags completely', function () {
        $html = '<p>Text</p><script>alert("xss")</script><p>More</p>';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->not->toContain('<script>')
            ->not->toContain('</script>')
            ->toContain('<p>Text</p>')
            ->toContain('<p>More</p>');
    });

    it('strips iframe tags', function () {
        $html = '<iframe src="evil.com"></iframe>';

        expect(HtmlSanitizer::sanitize($html))->toBeNull();
    });

    it('strips style tags', function () {
        $html = '<style>body { color: red; }</style>';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->toBeNull();
    });

    it('preserves text content inside block elements', function () {
        $html = '<p>Good</p><div>Styled text</div><p>Also good</p>';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->toContain('<p>Good</p>')
            ->toContain('<div>Styled text</div>')
            ->toContain('<p>Also good</p>');
    });

    it('allows img elements with src, alt, and class attributes', function () {
        $html = '<img src="https://example.com/photo.jpg" alt="A photo" class="inline">';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->toContain('src="https://example.com/photo.jpg"')
            ->toContain('alt="A photo"');
    });

    it('strips onclick from img tags', function () {
        $html = '<img src="https://example.com/photo.jpg" onclick="alert(1)">';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->not->toContain('onclick')
            ->toContain('src="https://example.com/photo.jpg"');
    });

    it('strips onclick event handlers', function () {
        $html = '<p onclick="alert(1)">Clickable</p>';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->not->toContain('onclick')
            ->toContain('<p>Clickable</p>');
    });

    it('strips onerror event handlers', function () {
        $html = '<p onerror="alert(1)">Safe</p>';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->not->toContain('onerror')
            ->toContain('<p>Safe</p>');
    });

    it('strips javascript: protocol', function () {
        $html = '<a href="javascript:alert(1)">Click</a>';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->not->toContain('javascript:');
    });

    it('preserves em and u tags', function () {
        $html = '<em>emphasis</em> and <u>underline</u>';

        expect(HtmlSanitizer::sanitize($html))->toBe($html);
    });

    it('preserves span tags', function () {
        $html = '<p><span class="highlight">Text</span></p>';

        $sanitized = HtmlSanitizer::sanitize($html);

        expect($sanitized)->toContain('<span')
            ->toContain('<p>');
    });
});
