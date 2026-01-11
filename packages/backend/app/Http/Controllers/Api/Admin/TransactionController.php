<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = Transaction::with(['user:id,name,email,role'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('payment_gateway_ref', 'like', "%{$search}%");
            })
            ->when($request->type, function ($query, $type) {
                if ($type !== 'all') {
                    $query->where('type', $type);
                }
            })
            ->when($request->status, function ($query, $status) {
                if ($status !== 'all') {
                    $query->where('status', $status);
                }
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(15);

        return response()->json($transactions);
    }

    public function stats(Request $request)
    {
        $query = Transaction::query();

        // Apply date filters if present
        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $stats = [
            'total_revenue' => (clone $query)->where('type', 'host_fee')->where('status', 'completed')->sum('amount'),
            'pending_payouts' => (clone $query)->where('type', 'partner_payout')->where('status', 'pending')->sum('amount'),
            'completed_payouts' => (clone $query)->where('type', 'partner_payout')->where('status', 'completed')->sum('amount'),
            'net_income' => (clone $query)->where('type', 'host_fee')->where('status', 'completed')->sum('amount') -
                (clone $query)->where('type', 'partner_payout')->where('status', 'completed')->sum('amount'),
        ];

        return response()->json($stats);
    }
}
