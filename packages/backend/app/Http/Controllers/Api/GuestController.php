<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KeyAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GuestController extends Controller
{
    // Host generates a magic link for a key assignment
    public function generateMagicLink(Request $request, $assignmentId)
    {
        $assignment = KeyAssignment::where('host_id', $request->user()->id)
            ->findOrFail($assignmentId);

        // Generate a unique token for the magic link
        // In a real app, store this in a separate table or column with expiry
        // For now, we'll use the pickup_code as the "secret" or generate a signed URL
        // Let's assume we use a signed URL for simplicity and security

        // If guest name is provided, update or create guest user
        if ($request->guest_name) {
            // Logic to find or create guest user could go here
            // For now, just store the name in metadata or similar if we had a column
            // Or update the guest_id if we create a shadow user
        }

        // Ensure pickup code exists
        if (!$assignment->pickup_code) {
            $assignment->update(['pickup_code' => rand(100000, 999999)]);
        }

        // Create a signed URL that expires in e.g. 7 days
        $url = \URL::signedRoute('guest.magic-link', ['assignment' => $assignment->id], now()->addDays(7));

        // In a real decoupled frontend, this would be a frontend URL with a token
        // e.g. https://app.bumblekey.com/guest/pickup/{token}
        // Let's simulate that by returning a frontend URL structure
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173') . '/guest/pickup/' . $assignment->id . '?signature=' . explode('signature=', $url)[1];

        return response()->json([
            'magic_link' => $frontendUrl,
            'pickup_code' => $assignment->pickup_code,
            'expires_at' => now()->addDays(7),
        ]);
    }

    // Public endpoint for the guest to view pickup details (protected by signature)
    public function showPickupDetails(Request $request, $assignmentId)
    {
        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'Invalid or expired link'], 403);
        }

        $assignment = KeyAssignment::with(['key.property', 'cell.hive', 'host'])
            ->findOrFail($assignmentId);

        return response()->json([
            'data' => [
                'pickup_code' => $assignment->pickup_code,
                'hive' => $assignment->cell->hive,
                'key_label' => $assignment->key->label,
                'host_name' => $assignment->host->name,
                'instructions' => $assignment->key->property->instructions,
                'status' => $assignment->state,
            ]
        ]);
    }

    // Host assigns a guest name to an assignment
    public function assignGuestName(Request $request, $assignmentId)
    {
        $assignment = KeyAssignment::where('host_id', $request->user()->id)
            ->findOrFail($assignmentId);

        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
        ]);

        // Create a guest user if not exists (simplified logic)
        // In reality, might want to check email or phone
        $guest = User::create([
            'name' => $validated['guest_name'],
            'email' => Str::slug($validated['guest_name']) . '_' . uniqid() . '@guest.bumblekey.com', // Placeholder email
            'password' => \Hash::make(Str::random(16)),
            'role' => 'guest',
        ]);

        $assignment->update(['guest_id' => $guest->id]);

        return response()->json([
            'message' => 'Guest assigned successfully',
            'data' => $assignment->load('guest'),
        ]);
    }
}
