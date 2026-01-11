import { useState } from 'react';
import { GiftIcon, ArrowUpRightIcon, ArrowDownLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

interface PointTransaction {
    id: number;
    type: 'earned' | 'redeemed';
    amount: number;
    description: string;
    date: string;
}

const BumbleHivePoints = () => {
    const [points] = useState(2450);
    const [transactions] = useState<PointTransaction[]>([
        { id: 1, type: 'earned', amount: 500, description: 'Key Pickup - Melbourne001', date: '2025-01-10T14:30:00Z' },
        { id: 2, type: 'earned', amount: 500, description: 'Key Pickup - Melbourne002', date: '2025-01-09T11:20:00Z' },
        { id: 3, type: 'redeemed', amount: 1000, description: 'Subscription Discount - Monthly Plan', date: '2025-01-05T09:00:00Z' },
        { id: 4, type: 'earned', amount: 500, description: 'Key Pickup - Melbourne001', date: '2025-01-04T16:45:00Z' },
        { id: 5, type: 'earned', amount: 1000, description: 'Referral Bonus - New Host Signup', date: '2025-01-01T10:00:00Z' },
    ]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">BumbleHive Points</h2>
                    <p className="text-gray-500">Earn points for every key pickup and redeem them for rewards.</p>
                </div>
                <Button variant="bumble" className="px-8 py-3">
                    Redeem Points
                </Button>
            </div>

            {/* Points Summary Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-bumble-yellow/10 rounded-2xl">
                        <GiftIcon className="h-10 w-10 text-bumble-yellow" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Points Balance</p>
                        <p className="text-5xl font-bold text-gray-900">{points.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none bg-green-50 px-6 py-4 rounded-2xl border border-green-100">
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Earned this month</p>
                        <p className="text-xl font-bold text-green-700">+1,500</p>
                    </div>
                    <div className="flex-1 md:flex-none bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Redeemed this month</p>
                        <p className="text-xl font-bold text-blue-700">1,000</p>
                    </div>
                </div>
            </div>

            {/* Points History */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Points History</h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${transaction.type === 'earned' ? 'bg-green-50' : 'bg-blue-50'}`}>
                                    {transaction.type === 'earned' ? (
                                        <ArrowUpRightIcon className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <ArrowDownLeftIcon className="h-5 w-5 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{transaction.description}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <ClockIcon className="h-3 w-3 text-gray-400" />
                                        <p className="text-xs text-gray-400">
                                            {new Date(transaction.date).toLocaleDateString()} {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={`text-sm font-bold ${transaction.type === 'earned' ? 'text-green-600' : 'text-blue-600'}`}>
                                {transaction.type === 'earned' ? '+' : '-'}{transaction.amount.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BumbleHivePoints;
