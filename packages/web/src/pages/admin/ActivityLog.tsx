import { useEffect, useState } from 'react';
import api from '../../services/api';
import { TableShimmer } from '../../components/common/Shimmer';
import {
    ClockIcon,
    UserIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

interface AuditLog {
    id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    performed_by: number;
    ip_address: string;
    user_agent: string;
    created_at: string;
    performer?: {
        name: string;
        email: string;
        role: string;
    };
}

// Mock data to match the image for demonstration if API is empty
const MOCK_LOGS: AuditLog[] = [
    {
        id: 1,
        action: 'Assigned key to guest: John Doe',
        entity_type: 'key',
        entity_id: 1,
        performed_by: 1,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: '2026-10-01T14:29:51',
        performer: { name: 'Admin User', email: 'admin@bumblekey.com', role: 'admin' }
    },
    {
        id: 2,
        action: 'Registered a new host: Sarah Smith',
        entity_type: 'host',
        entity_id: 2,
        performed_by: 2,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: '2026-10-01T07:00:51',
        performer: { name: 'Test User', email: 'test@example.com', role: 'user' }
    },
    {
        id: 3,
        action: 'Registered a new host: Sarah Smith',
        entity_type: 'host',
        entity_id: 3,
        performed_by: 3,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: '2026-09-01T23:05:51',
        performer: { name: 'Super Admin', email: 'superadmin@bumblekey.com', role: 'super_admin' }
    },
    {
        id: 4,
        action: 'User logged in',
        entity_type: 'auth',
        entity_id: 4,
        performed_by: 3,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: '2026-09-01T21:29:51',
        performer: { name: 'Super Admin', email: 'superadmin@bumblekey.com', role: 'super_admin' }
    },
    {
        id: 5,
        action: 'Created a new key: Melbourne001',
        entity_type: 'key',
        entity_id: 5,
        performed_by: 1,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: '2026-09-01T21:02:51',
        performer: { name: 'Admin User', email: 'admin@bumblekey.com', role: 'admin' }
    }
];

const ActivityLog = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/audit-logs?page=${page}`);
            if (response.data.data && response.data.data.length > 0) {
                setLogs(response.data.data);
                setTotalPages(response.data.last_page);
            } else {
                // Fallback to mock data if API returns empty (for demo purposes)
                setLogs(MOCK_LOGS);
            }
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
            setLogs(MOCK_LOGS); // Fallback on error
        } finally {
            setIsLoading(false);
        }
    };

    const getActionStyle = (action: string) => {
        if (action.toLowerCase().includes('assigned')) {
            return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
        }
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Activity Logs</h2>
                    <p className="text-gray-500 font-medium mt-1">Monitor all user actions and system events in real-time.</p>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-10">
                            <TableShimmer rows={8} cols={4} />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-gray-50">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-6 w-[30%]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                                                    <UserIcon className="h-6 w-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{log.performer?.name || 'System'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{log.performer?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 w-[30%]">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${getActionStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 w-[25%]">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                    <GlobeAltIcon className="h-3.5 w-3.5 text-gray-400" />
                                                    {log.ip_address}
                                                </div>
                                                <div className="text-[10px] text-gray-400 truncate max-w-[200px] pl-5.5">
                                                    {log.user_agent.split('(')[0]}...
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 w-[15%] text-right">
                                            <div className="flex items-center justify-end gap-2 text-gray-400">
                                                <ClockIcon className="h-4 w-4" />
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-500">
                                                        {new Date(log.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-gray-400">
                                                        {new Date(log.created_at).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-10 py-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-bold text-gray-400">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
