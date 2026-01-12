<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

use App\Services\AuditLogger;

class AuthController extends Controller
{
    /**
     * Register a new user.
     * Returns both access_token and refresh_token in response body.
     */
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'business_name' => $request->business_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
        ]);

        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ], 201);
    }

    /**
     * Login user.
     * Returns both access_token and refresh_token in response body (no cookies).
     */
    public function login(LoginRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        AuditLogger::log('User logged in', $user);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ]);
    }

    /**
     * Refresh access token.
     * Accepts refresh token via Authorization: Bearer {refresh_token} header.
     * Returns new access_token, refresh_token (rotated), and user data.
     */
    public function refresh(Request $request)
    {
        // Get token from Authorization header
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return response()->json(['message' => 'Refresh token missing'], 401);
        }

        // Find the token in the database
        $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);

        if (!$tokenModel || $tokenModel->name !== 'refresh_token') {
            return response()->json(['message' => 'Invalid refresh token'], 401);
        }

        // Check expiration
        if ($tokenModel->expires_at && $tokenModel->expires_at->isPast()) {
            $tokenModel->delete();
            return response()->json(['message' => 'Refresh token expired'], 401);
        }

        $user = $tokenModel->tokenable;

        // Revoke the old refresh token (rotation)
        $tokenModel->delete();

        // Issue new tokens
        $newAccessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $newRefreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken,
        ]);
    }

    /**
     * Logout user.
     * Revokes all tokens for the authenticated user.
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            AuditLogger::log('User logged out', $user);
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
