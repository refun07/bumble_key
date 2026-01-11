<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Integration;
use App\Models\ExternalListing;
use App\Models\ExternalBooking;
use App\Models\Key;
use App\Models\KeyAssignment;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AirbnbController extends Controller
{
    public function connect()
    {
        // Mock OAuth redirect
        return response()->json([
            'auth_url' => 'https://www.airbnb.com/oauth2/auth?client_id=mock_client_id&redirect_uri=' . urlencode(route('airbnb.callback'))
        ]);
    }

    public function callback(Request $request)
    {
        $host = Auth::user();

        // Mock token storage
        $integration = Integration::updateOrCreate(
            ['host_id' => $host->id, 'platform' => 'airbnb'],
            [
                'external_id' => 'airbnb_user_' . $host->id,
                'access_token' => 'mock_access_token_' . bin2hex(random_bytes(16)),
                'refresh_token' => 'mock_refresh_token_' . bin2hex(random_bytes(16)),
                'expires_at' => Carbon::now()->addDays(30),
                'status' => 'connected'
            ]
        );

        return response()->json([
            'message' => 'Airbnb connected successfully',
            'data' => $integration
        ]);
    }

    public function syncListings()
    {
        $host = Auth::user();
        $integration = Integration::where('host_id', $host->id)->where('platform', 'airbnb')->firstOrFail();

        // Mock fetching listings from Airbnb
        $mockListings = [
            [
                'external_id' => 'airbnb_listing_101',
                'name' => 'Cozy Apartment in Melbourne CBD',
                'address' => '123 Flinders St, Melbourne VIC 3000, Australia'
            ],
            [
                'external_id' => 'airbnb_listing_102',
                'name' => 'Modern Studio near Beach',
                'address' => '45 Beach Rd, St Kilda VIC 3182, Australia'
            ]
        ];

        $syncedListings = [];
        foreach ($mockListings as $listingData) {
            $listing = ExternalListing::updateOrCreate(
                ['integration_id' => $integration->id, 'external_id' => $listingData['external_id']],
                [
                    'name' => $listingData['name'],
                    'address' => $listingData['address'],
                    'raw_data' => $listingData
                ]
            );
            $syncedListings[] = $listing;
        }

        return response()->json([
            'message' => 'Listings synced successfully',
            'data' => $syncedListings
        ]);
    }

    public function syncBookings()
    {
        $host = Auth::user();
        $integration = Integration::where('host_id', $host->id)->where('platform', 'airbnb')->firstOrFail();
        $listings = $integration->externalListings;

        $syncedBookings = [];
        foreach ($listings as $listing) {
            // Mock fetching bookings for this listing
            $mockBookings = [
                [
                    'external_id' => 'airbnb_booking_' . bin2hex(random_bytes(4)),
                    'guest_name' => 'John Doe',
                    'check_in' => Carbon::now()->addDays(2)->setHour(14)->setMinute(0),
                    'check_out' => Carbon::now()->addDays(5)->setHour(10)->setMinute(0),
                    'status' => 'confirmed'
                ]
            ];

            foreach ($mockBookings as $bookingData) {
                $booking = ExternalBooking::updateOrCreate(
                    ['external_listing_id' => $listing->id, 'external_id' => $bookingData['external_id']],
                    [
                        'guest_name' => $bookingData['guest_name'],
                        'check_in' => $bookingData['check_in'],
                        'check_out' => $bookingData['check_out'],
                        'status' => $bookingData['status'],
                        'raw_data' => $bookingData
                    ]
                );

                // Automate Key Assignment if listing is mapped to a key
                if ($listing->key_id && !$booking->key_assignment_id) {
                    $assignment = KeyAssignment::create([
                        'key_id' => $listing->key_id,
                        'guest_name' => $booking->guest_name,
                        'check_in' => $booking->check_in,
                        'check_out' => $booking->check_out,
                        'status' => 'active'
                    ]);
                    $booking->update(['key_assignment_id' => $assignment->id]);
                }

                $syncedBookings[] = $booking;
            }
        }

        return response()->json([
            'message' => 'Bookings synced successfully',
            'data' => $syncedBookings
        ]);
    }

    public function mapListing(Request $request, $id)
    {
        $listing = ExternalListing::findOrFail($id);
        $request->validate([
            'key_id' => 'required|exists:keys,id'
        ]);

        $listing->update([
            'key_id' => $request->key_id,
            'property_id' => Key::find($request->key_id)->property_id
        ]);

        return response()->json([
            'message' => 'Listing mapped successfully',
            'data' => $listing
        ]);
    }

    public function getIntegration()
    {
        $host = Auth::user();
        $integration = Integration::with(['externalListings.externalBookings'])
            ->where('host_id', $host->id)
            ->where('platform', 'airbnb')
            ->first();

        return response()->json([
            'data' => $integration
        ]);
    }
}
