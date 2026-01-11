import { useState, useEffect } from 'react';
import {
    CubeIcon,
    SignalIcon,
    UserGroupIcon,
    UsersIcon,
    KeyIcon,
    CurrencyDollarIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar
} from 'recharts';

const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
    { name: 'Jul', value: 7000 },
];

const activityData = [
    { name: 'Mon', pickups: 120, drops: 80 },
    { name: 'Tue', pickups: 150, drops: 100 },
    { name: 'Wed', pickups: 180, drops: 120 },
    { name: 'Thu', pickups: 140, drops: 90 },
    { name: 'Fri', pickups: 210, drops: 150 },
    { name: 'Sat', pickups: 250, drops: 180 },
    { name: 'Sun', pickups: 190, drops: 140 },
];

const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const stats = [
        { label: 'TOTAL BOXES', value: '124', change: '+12%', icon: CubeIcon, color: 'text-blue-500', bg: 'bg-blue-50', pillText: 'text-blue-600', pillBg: 'bg-blue-50' },
        { label: 'ACTIVE FOBS', value: '856', change: '+5%', icon: SignalIcon, color: 'text-purple-500', bg: 'bg-purple-50', pillText: 'text-purple-600', pillBg: 'bg-purple-50' },
        { label: 'HIVE PARTNERS', value: '42', change: '+2', icon: UserGroupIcon, color: 'text-green-500', bg: 'bg-green-50', pillText: 'text-green-600', pillBg: 'bg-green-50' },
        { label: 'TOTAL HOSTS', value: '1,204', change: '+18%', icon: UsersIcon, color: 'text-orange-500', bg: 'bg-orange-50', pillText: 'text-orange-600', pillBg: 'bg-orange-50' },
        { label: 'KEYS MANAGED', value: '3,450', change: '+24%', icon: KeyIcon, color: 'text-yellow-500', bg: 'bg-yellow-50', pillText: 'text-yellow-600', pillBg: 'bg-yellow-50' },
        { label: 'TOTAL REVENUE', value: '$45,230', change: '+15%', icon: CurrencyDollarIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', pillText: 'text-emerald-600', pillBg: 'bg-emerald-50' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard Overview</h2>
                <p className="text-gray-500 font-medium">Real-time system performance and management metrics.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {stats.map((stat, idx) => (
                    <div
                        key={stat.label}
                        className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full justify-between"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <span className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-full ${stat.pillText} ${stat.pillBg}`}>
                                <ArrowUpIcon className="h-3 w-3" />
                                {stat.change}
                            </span>
                        </div>
                        <div className="space-y-1 mt-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Revenue Growth</h3>
                        <div className="relative">
                            <select className="appearance-none text-xs font-bold text-gray-700 bg-white border border-bumble-yellow rounded-2xl px-5 py-2.5 pr-10 focus:ring-4 focus:ring-bumble-yellow/10 focus:border-bumble-yellow transition-all cursor-pointer outline-none shadow-sm">
                                <option>Last 30 Days</option>
                                <option>Last 7 Days</option>
                                <option>Last 12 Months</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}
                                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#FACC15"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Key Activity</h3>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-bumble-yellow"></div>
                                <span className="text-xs font-bold text-gray-500">Pickups</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                                <span className="text-xs font-bold text-gray-500">Drops</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB', radius: 8 }}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                                        padding: '12px 16px'
                                    }}
                                />
                                <Bar dataKey="pickups" fill="#FACC15" radius={[6, 6, 6, 6]} barSize={16} animationDuration={1500} />
                                <Bar dataKey="drops" fill="#E5E7EB" radius={[6, 6, 6, 6]} barSize={16} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-500">
                    <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent System Activity</h3>
                        <button className="text-sm font-bold text-bumble-yellow hover:text-yellow-600 transition-colors">View All Logs</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {[
                            { id: 1, type: 'host', user: 'Sarah Jenkins', action: 'registered as a new host', time: '2 mins ago', icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { id: 2, type: 'partner', user: 'Coffee House Central', action: 'joined as a Hive Partner', time: '15 mins ago', icon: UserGroupIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { id: 3, type: 'box', user: 'Box #4502', action: 'went offline in Melbourne', time: '45 mins ago', icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-50' },
                            { id: 4, type: 'key', user: 'Key #882', action: 'was picked up by Guest', time: '1 hour ago', icon: KeyIcon, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                            { id: 5, type: 'revenue', user: 'System', action: 'processed $1,250 in payouts', time: '3 hours ago', icon: CurrencyDollarIcon, color: 'text-teal-600', bg: 'bg-teal-50' },
                        ].map((item) => (
                            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all duration-300 cursor-pointer group">
                                <div className="flex items-center gap-5">
                                    <div className={`h-12 w-12 rounded-full ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-900">
                                            <span className="font-bold">{item.user}</span> <span className="font-medium text-gray-500">{item.action}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">{item.time}</p>
                                    </div>
                                </div>
                                <div className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10 hover:shadow-md transition-shadow duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">System Health</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <div className="space-y-8">
                        {[
                            { label: 'BumbleHive Network', status: 'Operational', health: 98, color: 'bg-[#10B981]' },
                            { label: 'Payment Gateway', status: 'Operational', health: 100, color: 'bg-[#10B981]' },
                            { label: 'NFC Service', status: 'Degraded', health: 85, color: 'bg-[#F97316]' },
                            { label: 'API Server', status: 'Operational', health: 99, color: 'bg-[#10B981]' },
                        ].map((service) => (
                            <div key={service.label} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700 tracking-tight">{service.label}</span>
                                    <span className={`text-[10px] font-bold px-5 py-1.5 rounded-full ${service.color} text-white tracking-wide min-w-[100px] text-center`}>
                                        {service.status}
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${service.color} transition-all duration-[2000ms] ease-out`}
                                        style={{ width: `${service.health}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8">
                        <div className="bg-[#F9FAFB] rounded-[32px] p-8 flex items-center gap-6 border border-gray-50">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
                                <CheckCircleIcon className="h-8 w-8 text-[#10B981]" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">All Systems Go</p>
                                <p className="text-sm text-gray-500 font-medium mt-0.5">Last check: 1 min ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
