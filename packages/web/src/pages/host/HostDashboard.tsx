import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import {
    KeyIcon,
    UserGroupIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface Stats {
    total_keys: number;
    active_assignments: number;
    pending_drops: number;
    total_earnings: number;
}

const HostDashboard = () => {
    const [stats, setStats] = useState<Stats>({
        total_keys: 0,
        active_assignments: 0,
        pending_drops: 0,
        total_earnings: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real app, we'd have a specific dashboard endpoint
                // For now, let's fetch keys and derive some stats
                const response = await api.get('/hosts/keys');
                const keys = response.data.data;

                setStats({
                    total_keys: keys.length,
                    active_assignments: keys.filter((k: any) => k.current_assignment?.state === 'picked_up').length,
                    pending_drops: keys.filter((k: any) => k.current_assignment?.state === 'pending_drop').length,
                    total_earnings: 1250.50 // Placeholder
                });

                // Simulate recent activity from assignments
                const activities = keys
                    .flatMap((k: any) => k.assignments.map((a: any) => ({
                        id: a.id,
                        key_label: k.label,
                        state: a.state,
                        date: a.created_at,
                        guest_name: a.guest?.name || 'Guest'
                    })))
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5);

                setRecentActivity(activities);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-500">Welcome back! Here's what's happening with your keys.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Keys', value: stats.total_keys, icon: KeyIcon, color: 'bg-blue-500' },
                    { label: 'Active Pickups', value: stats.active_assignments, icon: UserGroupIcon, color: 'bg-green-500' },
                    { label: 'Pending Drops', value: stats.pending_drops, icon: ArrowPathIcon, color: 'bg-orange-500' },
                    { label: 'Total Earnings', value: `$${stats.total_earnings}`, icon: CheckCircleIcon, color: 'bg-bumble-yellow' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                        <Link to="/host/keys" className="text-sm font-bold text-bumble-yellow hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-100 rounded-xl">
                                        <ClockIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            {activity.guest_name} <span className="font-medium text-gray-500">
                                                {activity.state === 'picked_up' ? 'picked up' : 'is assigned to'}
                                            </span> {activity.key_label}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(activity.date).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${activity.state === 'picked_up' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                    {activity.state.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <div className="p-12 text-center text-gray-400 font-medium">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link to="/host/keys/new" className="block">
                            <Button variant="bumble" className="w-full py-4 rounded-2xl font-bold shadow-md flex items-center justify-center gap-2">
                                <PlusIcon className="h-5 w-5 stroke-[3]" />
                                Register New Key
                            </Button>
                        </Link>
                        <Link to="/host/properties/new" className="block">
                            <Button variant="outline" className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                <HomeIcon className="h-5 w-5" />
                                Add Property
                            </Button>
                        </Link>
                    </div>
                    <div className="pt-6 border-t border-gray-50">
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                            Need help? Check our <Link to="/help" className="text-bumble-yellow hover:underline">Help Center</Link> or contact support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

export default HostDashboard;
