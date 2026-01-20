<?php

use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

Route::get('/link-storage', function () {
    $target = storage_path('app/public');
    $link = public_path('storage');

    if (File::exists($link)) {
        return Response::json([
            'message' => 'Storage link already exists',
        ]);
    }

    File::link($target, $link);

    return Response::json([
        'message' => 'Storage linked successfully',
    ]);
});


Route::get('/', function () {
    return response()->json([
        'status' => 'BumbleKey API is running',
        'version' => '1.0.0',
        'documentation' => '/docs' // Placeholder
    ]);
});
