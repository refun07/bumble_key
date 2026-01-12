import { useState, useEffect } from 'react';
import { useTheme } from '../../store/theme';
import api from '../../services/api';
import {
    CurrencyDollarIcon,
    ArrowPathIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
// import Input from '../../components/common/Input';

const Accounts = () => {
    const { isDarkMode } = useTheme();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        total_revenue: 0,
        pending_payouts: 0,
        completed_payouts: 0,
        net_income: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        status: 'all',
        date_from: '',
        date_to: ''
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    const fetchData = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = { ...filters, page };
            const [transactionsRes, statsRes] = await Promise.all([
                api.get('/admin/transactions', { params }),
                api.get('/admin/transactions/stats', { params })
            ]);

            setTransactions(transactionsRes.data.data);
            setPagination({
                current_page: transactionsRes.data.current_page,
                last_page: transactionsRes.data.last_page,
                total: transactionsRes.data.total
            });
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching accounts data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-primary tracking-tight">Accounts & Transactions</h2>
                    <p className="text-secondary font-medium">Manage financial records and payouts.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Export Report
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-primary p-6 rounded-3xl border border-default shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 rounded-2xl">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(stats.total_revenue)}</p>
                </div>
                <div className="bg-primary p-6 rounded-3xl border border-default shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <ArrowPathIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Pending</span>
                    </div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">Pending Payouts</p>
                    <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(stats.pending_payouts)}</p>
                </div>
                <div className="bg-primary p-6 rounded-3xl border border-default shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Paid</span>
                    </div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">Completed Payouts</p>
                    <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(stats.completed_payouts)}</p>
                </div>
                <div className="bg-primary p-6 rounded-3xl border border-default shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 rounded-2xl">
                            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Net</span>
                    </div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">Net Income</p>
                    <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(stats.net_income)}</p>
                </div>


                {/* Filters */}
                <div className="bg-primary p-6 rounded-3xl border border-default shadow-sm">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    className={`pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-bumble-yellow/20 focus:border-bumble-yellow outline-none w-64 transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">Type</label>
                            <select
                                className={`w-full rounded-xl border focus:border-bumble-yellow focus:ring-bumble-yellow transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-gray-300'}`}
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="host_fee">Host Fee</option>
                                <option value="partner_payout">Partner Payout</option>
                                <option value="guest_fee">Guest Fee</option>
                                <option value="refund">Refund</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">Status</label>
                            <select
                                className={`w-full rounded-xl border focus:border-bumble-yellow focus:ring-bumble-yellow transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-gray-300'}`}
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <Button type="submit" variant="bumble" className="w-full">
                            <FunnelIcon className="w-5 h-5 mr-2" />
                            Filter
                        </Button>
                    </form>
                </div>

                {/* Transactions Table */}
                <div className="bg-primary rounded-3xl border border-default shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'}`}>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className={`transition-colors ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                                #{tx.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-primary">{tx.user?.name || 'Unknown'}</div>
                                                <div className="text-xs text-secondary">{tx.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-700'}`}>
                                                    {tx.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                                                {formatCurrency(tx.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        tx.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={`px-6 py-4 border-t flex items-center justify-between ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                        <div className="text-sm text-secondary">
                            Showing page {pagination.current_page} of {pagination.last_page}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                disabled={pagination.current_page === 1}
                                onClick={() => fetchData(pagination.current_page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => fetchData(pagination.current_page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Accounts;
