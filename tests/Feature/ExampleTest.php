<?php

test('home redirects to products', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect('/products');
});
