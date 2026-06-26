<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $adminEmail = config('app.admin_email');

        if ($adminEmail === null && app()->isProduction()) {
            abort(500, 'ADMIN_EMAIL is not configured.');
        }

        if (! $request->user() || $request->user()->email !== $adminEmail) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
