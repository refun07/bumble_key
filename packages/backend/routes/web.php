<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'BumbleKey API is running',
        'version' => '1.0.0',
        'documentation' => '/docs' // Placeholder
    ]);
});
