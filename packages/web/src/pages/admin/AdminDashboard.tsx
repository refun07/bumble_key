import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CubeIcon,
    SignalIcon,
    UserGroupIcon,
    UsersIcon,
    KeyIcon,
    CurrencyDollarIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../store/theme';
import Button from '../../components/common/Button';
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
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

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
        <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl lg:text-3xl font-bold text-primary tracking-tight">Admin Dashboard Overview</h2>
                    <p className="text-sm lg:text-base text-secondary font-medium">Real-time system performance and management metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="warning" className="flex-1 sm:flex-none">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button
                        variant="secondary"
                        className="flex-1 sm:flex-none"
                        onClick={() => navigate('/admin/partners')}
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Partner
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
                {stats.map((stat, idx) => (
                    <div
                        key={stat.label}
                        className="bg-primary p-5 lg:p-6 rounded-3xl lg:rounded-[32px] border border-default shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full justify-between"
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
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-2xl lg:text-3xl font-bold text-primary tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Revenue Chart */}
                <div className="bg-primary p-6 lg:p-10 rounded-3xl lg:rounded-[40px] border border-default shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 lg:mb-10">
                        <h3 className="text-lg lg:text-xl font-bold text-primary tracking-tight">Revenue Growth</h3>
                        <div className="relative w-full sm:w-auto">
                            <select className={`appearance-none w-full sm:w-auto text-xs font-bold rounded-2xl px-5 py-2.5 pr-10 focus:ring-4 focus:ring-bumble-yellow/10 focus:border-bumble-yellow transition-all cursor-pointer outline-none shadow-sm ${isDarkMode ? 'text-white bg-zinc-800 border-zinc-700' : 'text-gray-700 bg-white border-bumble-yellow'}`}>
                                <option>Last 30 Days</option>
                                <option>Last 7 Days</option>
                                <option>Last 12 Months</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className={`h-4 w-4 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] lg:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#27272A' : '#F3F4F6'} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: isDarkMode ? '#71717A' : '#9CA3AF', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: isDarkMode ? '#71717A' : '#9CA3AF', fontWeight: 600 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? '#1F1F1F' : '#fff',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontWeight: 'bold', color: isDarkMode ? '#fff' : '#111827', fontSize: '14px' }}
                                    labelStyle={{ color: isDarkMode ? '#71717A' : '#9CA3AF', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}
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
                <div className="bg-primary p-6 lg:p-10 rounded-3xl lg:rounded-[40px] border border-default shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 lg:mb-10">
                        <h3 className="text-lg lg:text-xl font-bold text-primary tracking-tight">Key Activity</h3>
                        <div className="flex gap-4 lg:gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-bumble-yellow"></div>
                                <span className="text-[10px] lg:text-xs font-bold text-secondary">Pickups</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'}`}></div>
                                <span className="text-[10px] lg:text-xs font-bold text-secondary">Drops</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] lg:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: isDarkMode ? '#27272A' : '#F9FAFB', radius: 8 }}
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? '#1F1F1F' : '#fff',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                                        padding: '12px 16px'
                                    }}
                                />
                                <Bar dataKey="pickups" fill="#FACC15" radius={[4, 4, 4, 4]} barSize={12} animationDuration={1500} />
                                <Bar dataKey="drops" fill={isDarkMode ? '#3F3F46' : '#E5E7EB'} radius={[4, 4, 4, 4]} barSize={12} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-10">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-primary rounded-3xl lg:rounded-[40px] border border-default shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-500">
                    <div className="p-6 lg:p-10 border-b border-default flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/30">
                        <h3 className="text-lg lg:text-xl font-bold text-primary tracking-tight">Recent System Activity</h3>
                        <button className="text-xs lg:text-sm font-bold text-bumble-yellow hover:text-yellow-600 transition-colors">View All Logs</button>
                    </div>
                    <div className="divide-y border-default">
                        {[
                            { id: 1, type: 'host', user: 'Sarah Jenkins', action: 'registered as a new host', time: '2 mins ago', icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { id: 2, type: 'partner', user: 'Coffee House Central', action: 'joined as a Hive Partner', time: '15 mins ago', icon: UserGroupIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { id: 3, type: 'box', user: 'Box #4502', action: 'went offline in Melbourne', time: '45 mins ago', icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-50' },
                            { id: 4, type: 'key', user: 'Key #882', action: 'was picked up by Guest', time: '1 hour ago', icon: KeyIcon, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                            { id: 5, type: 'revenue', user: 'System', action: 'processed $1,250 in payouts', time: '3 hours ago', icon: CurrencyDollarIcon, color: 'text-teal-600', bg: 'bg-teal-50' },
                        ].map((item) => (
                            <div key={item.id} className="p-5 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-all duration-300 cursor-pointer group">
                                <div className="flex items-center gap-4 lg:gap-5">
                                    <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-full ${item.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300`}>
                                        <item.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${item.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-primary leading-tight">
                                            <span className="font-bold">{item.user}</span> <span className="font-medium text-secondary">{item.action}</span>
                                        </p>
                                        <p className="text-[10px] lg:text-xs text-secondary mt-1 font-medium">{item.time}</p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 hidden sm:block ${isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'}`}>
                                    <svg className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-primary p-6 lg:p-10 rounded-3xl lg:rounded-[40px] border border-default shadow-sm space-y-8 lg:space-y-10 hover:shadow-md transition-shadow duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg lg:text-xl font-bold text-primary tracking-tight">System Health</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <div className="space-y-6 lg:space-y-8">
                        {[
                            { label: 'BumbleHive Network', status: 'Operational', health: 98, color: 'bg-[#10B981]' },
                            { label: 'Payment Gateway', status: 'Operational', health: 100, color: 'bg-[#10B981]' },
                            { label: 'NFC Service', status: 'Degraded', health: 85, color: 'bg-[#F97316]' },
                            { label: 'API Server', status: 'Operational', health: 99, color: 'bg-[#10B981]' },
                        ].map((service) => (
                            <div key={service.label} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs lg:text-sm font-bold text-secondary tracking-tight">{service.label}</span>
                                    <span className={`text-[9px] lg:text-[10px] font-bold px-3 lg:px-5 py-1 lg:py-1.5 rounded-full ${service.color} text-white tracking-wide min-w-[80px] lg:min-w-[100px] text-center`}>
                                        {service.status}
                                    </span>
                                </div>
                                <div className={`h-2 lg:h-2.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                                    <div
                                        className={`h-full ${service.color} transition-all duration-[2000ms] ease-out`}
                                        style={{ width: `${service.health}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 lg:pt-8">
                        <div className={`rounded-2xl lg:rounded-[32px] p-5 lg:p-8 flex items-center gap-4 lg:gap-6 border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-[#F9FAFB] border-gray-50'}`}>
                            <div className={`h-12 w-12 lg:h-16 lg:w-16 rounded-full flex items-center justify-center shadow-sm border shrink-0 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-50'}`}>
                                <CheckCircleIcon className="h-6 w-6 lg:h-8 lg:w-8 text-[#10B981]" />
                            </div>
                            <div>
                                <p className="text-base lg:text-lg font-bold text-primary">All Systems Go</p>
                                <p className="text-xs lg:text-sm text-secondary font-medium mt-0.5">Last check: 1 min ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
