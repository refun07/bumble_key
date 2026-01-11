<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\KeyAssignment;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays(30);

        // 1. Revenue Data (Last 30 Days)
        $revenueData = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(amount) as value')
        )
            ->where('type', 'host_fee')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => Carbon::parse($item->date)->format('M d'),
                    'value' => (float) $item->value,
                ];
            });

        // 2. Key Activity (Pickups vs Drops - Last 30 Days)
        // Note: This is an approximation based on assignment state changes if we had a history table.
        // For now, we'll mock the distribution based on current assignments for demonstration,
        // or use created_at of assignments as "drops" and updated_at as "pickups" if state is picked_up.

        $activityData = KeyAssignment::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as drops'),
            DB::raw('SUM(CASE WHEN state = "picked_up" THEN 1 ELSE 0 END) as pickups')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => Carbon::parse($item->date)->format('D'),
                    'pickups' => (int) $item->pickups,
                    'drops' => (int) $item->drops,
                ];
            });

        // 3. User Growth (Last 6 Months)
        $growthStartDate = Carbon::now()->subMonths(6);
        $userGrowth = User::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('SUM(CASE WHEN role = "host" THEN 1 ELSE 0 END) as hosts'),
            DB::raw('SUM(CASE WHEN role = "partner" THEN 1 ELSE 0 END) as partners')
        )
            ->whereBetween('created_at', [$growthStartDate, $endDate])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => Carbon::createFromFormat('Y-m', $item->month)->format('M'),
                    'hosts' => (int) $item->hosts,
                    'partners' => (int) $item->partners,
                ];
            });

        // 4. Summary Stats
        $stats = [
            'total_revenue' => Transaction::where('type', 'host_fee')->where('status', 'completed')->sum('amount'),
            'active_keys' => KeyAssignment::whereIn('state', ['dropped', 'available', 'picked_up'])->count(),
            'total_users' => User::count(),
            'growth_rate' => 12, // Mock calculation for now
        ];

        return response()->json([
            'revenue' => $revenueData,
            'activity' => $activityData,
            'growth' => $userGrowth,
            'stats' => $stats,
        ]);
    }
}
