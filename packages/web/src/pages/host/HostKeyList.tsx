import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import {
    MagnifyingGlassIcon,
    PencilIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { TableShimmer } from '../../components/common/Shimmer';

interface Key {
    id: number;
    label: string;
    status: string;
    package_type: string;
    property?: {
        address: string;
    };
    current_assignment?: {
        state: string;
        cell?: {
            hive?: {
                name: string;
                address: string;
            }
        }
    };
}

const HostKeyList = () => {
    const [keys, setKeys] = useState<Key[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/hosts/keys');
            setKeys(response.data.data);
        } catch (error) {
            console.error('Failed to fetch keys', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredKeys = keys.filter(key => {
        const matchesSearch = key.label.toLowerCase().includes(search.toLowerCase()) ||
            key.property?.address.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusDisplay = (key: Key) => {
        const state = key.current_assignment?.state;
        switch (state) {
            case 'pending_drop': return 'BumbleHive Drop Pending';
            case 'dropped': return 'In BumbleHive';
            case 'available': return 'In BumbleHive';
            case 'picked_up': return 'In use';
            case 'in_use': return 'In use';
            default: return 'Inactive';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                <TableShimmer rows={6} cols={5} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 flex flex-wrap items-center gap-4">
                    <div className="relative w-full lg:w-72">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search key with ID or name"
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all shadow-sm text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider whitespace-nowrap">Status</span>
                        <select
                            className="px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all shadow-sm text-sm font-medium min-w-[140px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider whitespace-nowrap">BumbleHive</span>
                        <select className="px-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all shadow-sm text-sm font-medium min-w-[200px]">
                            <option>Melbourne - Ezymart Carlton...</option>
                        </select>
                    </div>

                    <button
                        onClick={() => { setSearch(''); setStatusFilter('all'); }}
                        className="px-6 py-3 border border-gray-900 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                        Reset Filters
                    </button>
                </div>

                <Link to="/host/keys/new">
                    <Button variant="bumble" className="px-8 py-3 whitespace-nowrap">
                        Add New Key
                    </Button>
                </Link>
            </div>

            <div className="space-y-3">
                {filteredKeys.map((key) => (
                    <Link
                        key={key.id}
                        to={`/host/keys/${key.id}`}
                        className="block bg-white p-5 rounded-xl border border-gray-50 shadow-sm hover:border-bumble-yellow/50 transition-all group"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                            <div className="md:col-span-2 font-bold text-gray-900 text-sm">{key.label}</div>

                            <div className="md:col-span-2 text-sm text-gray-500">
                                {key.status === 'active' ? 'Active' : 'Inactive'}
                            </div>

                            <div className="md:col-span-3 text-sm text-gray-900 font-medium">
                                {getStatusDisplay(key)}
                            </div>

                            <div className="md:col-span-4 text-sm text-gray-500 truncate">
                                {key.current_assignment?.cell?.hive?.address || key.property?.address || '21-22 Embankment Pl, London WC2N 6NN, UK'}
                            </div>

                            <div className="md:col-span-1 flex justify-end">
                                <div className="p-2 rounded-lg group-hover:bg-gray-50 transition-colors">
                                    <PencilIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-900" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredKeys.length === 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ArrowPathIcon className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No keys found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">
                            We couldn't find any keys matching your search or filters.
                        </p>
                        <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostKeyList;
