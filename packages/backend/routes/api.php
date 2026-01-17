<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::get('/hives/public', [\App\Http\Controllers\Api\PublicHiveController::class, 'index']);
Route::get('/pricing', [\App\Http\Controllers\Api\Admin\SettingController::class, 'pricing']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Host Routes
    Route::apiResource('hosts/properties', \App\Http\Controllers\Api\HostPropertyController::class);
    Route::apiResource('hosts/keys', \App\Http\Controllers\Api\KeyController::class);

    // Public/Shared Routes
    Route::get('hives', [\App\Http\Controllers\Api\HiveController::class, 'index']);
    Route::get('hives/{id}', [\App\Http\Controllers\Api\HiveController::class, 'show']);

    // Guest / Magic Link Routes (Signed)
    Route::get('/guest/pickup/{assignment}', [\App\Http\Controllers\Api\GuestController::class, 'showPickupDetails'])->name('guest.magic-link');

    // Host Routes (Authenticated)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/hosts/assignments/{assignment}/magic-link', [\App\Http\Controllers\Api\GuestController::class, 'generateMagicLink']);
        Route::post('/hosts/assignments/{assignment}/guest', [\App\Http\Controllers\Api\GuestController::class, 'assignGuestName']);

        // Airbnb Integration Routes
        Route::get('/hosts/airbnb/connect', [\App\Http\Controllers\Api\AirbnbController::class, 'connect']);
        Route::get('/hosts/airbnb/callback', [\App\Http\Controllers\Api\AirbnbController::class, 'callback'])->name('airbnb.callback');
        Route::get('/hosts/airbnb/sync-listings', [\App\Http\Controllers\Api\AirbnbController::class, 'syncListings']);
        Route::get('/hosts/airbnb/sync-bookings', [\App\Http\Controllers\Api\AirbnbController::class, 'syncBookings']);
        Route::post('/hosts/airbnb/listings/{id}/map', [\App\Http\Controllers\Api\AirbnbController::class, 'mapListing']);
        Route::get('/hosts/airbnb/integration', [\App\Http\Controllers\Api\AirbnbController::class, 'getIntegration']);
    });

    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::apiResource('hosts', \App\Http\Controllers\Api\Admin\HostController::class);
        Route::apiResource('partners', \App\Http\Controllers\Api\Admin\PartnerController::class);
        Route::apiResource('hives', \App\Http\Controllers\Api\HiveController::class);
        Route::get('hives/list/all', [\App\Http\Controllers\Api\HiveController::class,'hiveList']);
        Route::apiResource('nfc-fobs', \App\Http\Controllers\Api\Admin\NfcFobController::class);
        Route::get('audit-logs', [\App\Http\Controllers\Api\Admin\AuditLogController::class, 'index']);
        Route::get('search', [\App\Http\Controllers\Api\Admin\SearchController::class, 'index']);

        // Transactions
        Route::get('transactions', [\App\Http\Controllers\Api\Admin\TransactionController::class, 'index']);
        Route::get('transactions/stats', [\App\Http\Controllers\Api\Admin\TransactionController::class, 'stats']);

        // Reports
        Route::get('reports', [\App\Http\Controllers\Api\Admin\ReportController::class, 'index']);

        // Settings
        Route::get('settings', [\App\Http\Controllers\Api\Admin\SettingController::class, 'index']);
        Route::post('settings', [\App\Http\Controllers\Api\Admin\SettingController::class, 'update']);
        Route::post('settings/pricing', [\App\Http\Controllers\Api\Admin\SettingController::class, 'updatePricing']);
    });
});
