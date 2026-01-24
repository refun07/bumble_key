import { useEffect, useState } from 'react';
import { useTheme } from '../../store/theme';
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
        };
        transactions?: Array<{
            id: number;
            amount: string;
            currency: string;
            status: 'pending' | 'completed' | 'failed' | 'refunded';
        }>;
    };
}

interface Hive {
    id: number;
    name: string;
    location_name?: string;
    address?: string;
}

const HostKeyList = () => {
    const { isDarkMode } = useTheme();
    const [keys, setKeys] = useState<Key[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [hiveFilter, setHiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalKeys, setTotalKeys] = useState(0);

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'created', label: 'Created' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'deposited', label: 'Deposited' },
        { value: 'available', label: 'Available' },
        { value: 'picked_up', label: 'Picked Up' },
        { value: 'returned', label: 'Returned' },
        { value: 'closed', label: 'Closed' },
        { value: 'dispute', label: 'Dispute' }
    ];

    const fetchData = async (page = currentPage) => {
        setIsLoading(true);
        try {
            const [keysResponse, hivesResponse] = await Promise.all([
                api.get('/hosts/keys', {
                    params: {
                        page,
                        search: search || undefined,
                        status: statusFilter !== 'all' ? statusFilter : undefined,
                        hive_id: hiveFilter !== 'all' ? hiveFilter : undefined
                    }
                }),
                api.get('/hives/public')
            ]);
            setKeys(keysResponse.data.data);
            setCurrentPage(keysResponse.data.current_page || 1);
            setLastPage(keysResponse.data.last_page || 1);
            setTotalKeys(keysResponse.data.total || 0);
            const hiveList = hivesResponse.data.data || hivesResponse.data || [];
            setHives(hiveList);
        } catch (error) {
            console.error('Failed to fetch keys or hives', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
            fetchData(1);
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, statusFilter, hiveFilter]);

    const formatStatus = (status: string) =>
        status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

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

    const getTransactionBadgeClass = (status: string) => {
        if (status === 'completed') return 'bg-green-100 text-green-700';
        if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
        if (status === 'failed') return 'bg-red-100 text-red-700';
        if (status === 'refunded') return 'bg-gray-200 text-gray-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="space-y-8">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full overflow-x-hidden">
  
  <div className="flex-1 flex flex-wrap items-center gap-4 min-w-0">
    
    {/* Search */}
    <div className="relative w-full lg:w-72 min-w-0">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search key with ID or name"
        className={`w-full min-w-0 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all shadow-sm text-sm 
          ${isDarkMode 
            ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' 
            : 'bg-white border-gray-100 text-gray-900 placeholder-gray-400'
          }`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* Status */}
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs font-bold text-secondary uppercase tracking-wider whitespace-nowrap">
        Status
      </span>
      <select
        className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all shadow-sm text-sm font-medium 
          w-full lg:min-w-[140px]
          ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-100 text-gray-900'}
        `}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    {/* BumbleHive */}
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs font-bold text-secondary uppercase tracking-wider whitespace-nowrap">
        BumbleHive
      </span>
      <select
        className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all shadow-sm text-sm font-medium 
          w-full lg:min-w-[200px]
          ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-100 text-gray-900'}
        `}
        value={hiveFilter}
        onChange={(e) => setHiveFilter(e.target.value)}
      >
        <option value="all">All BumbleHives</option>
        {hives.map(hive => (
          <option key={hive.id} value={hive.id}>
            {hive.name}{hive.location_name ? ` - ${hive.location_name}` : ''}
          </option>
        ))}
      </select>
    </div>

    <Button
      onClick={() => {
        setSearch('');
        setStatusFilter('all');
        setHiveFilter('all');
        setCurrentPage(1);
      }}
      className="px-6 py-3 whitespace-nowrap"
    >
      Reset Filters
    </Button>
  </div>

  <Link to="/host/keys/new">
    <Button variant="bumble" className="px-8 py-3 whitespace-nowrap">
      Add New Key
    </Button>
  </Link>
</div>


            <div className="space-y-3">
                {isLoading ? (
                    <TableShimmer rows={6} cols={5} />
                ) : (
                    <>
                        {keys.map((key) => (
                            <Link
                                key={key.id}
                                to={`/host/keys/${key.id}`}
                                className={`block p-5 rounded-xl border shadow-sm transition-all group ${isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-bumble-yellow/30' : 'bg-white border-gray-50 hover:border-bumble-yellow/50'}`}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                                    <div className="md:col-span-2 font-bold text-primary text-sm">{key.label}</div>

                                    <div className="md:col-span-2 text-sm text-secondary">
                                        {formatStatus(key.status)}
                                    </div>

                                    <div className="md:col-span-2 text-sm text-primary font-medium">
                                        {getStatusDisplay(key)}
                                    </div>

                                    <div className="md:col-span-3 text-sm text-secondary">
                                        <div className="flex flex-wrap gap-2">
                                            {key.current_assignment?.transactions?.length ? (
                                                key.current_assignment.transactions.map((transaction) => (
                                                    <span
                                                        key={transaction.id}
                                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getTransactionBadgeClass(transaction.status)}`}
                                                    >
                                                        {transaction.status}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                                    No payments
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 text-sm text-secondary truncate">
                                        {key.current_assignment?.cell?.hive?.address || key.property?.address || '21-22 Embankment Pl, London WC2N 6NN, UK'}
                                    </div>

                                    <div className="md:col-span-1 flex justify-end">
                                        <div className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'group-hover:bg-zinc-800' : 'group-hover:bg-gray-50'}`}>
                                            <PencilIcon className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {keys.length === 0 && (
                            <div className={`rounded-3xl border p-20 text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                                    <ArrowPathIcon className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">No keys found</h3>
                                <p className="text-secondary max-w-xs mx-auto mb-8">
                                    We couldn't find any keys matching your search or filters.
                                </p>
                                <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {lastPage > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-secondary">
                        Showing page {currentPage} of {lastPage} ({totalKeys} total)
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <Button
                           
                            className="px-4 py-2"
                            onClick={() => fetchData(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: lastPage }, (_, index) => {
                            const page = index + 1;
                            const isActive = page === currentPage;
                            return (
                                <Button
                                    key={page}
                                   
                                    className="px-4 py-2"
                                    onClick={() => fetchData(page)}
                                    disabled={isActive}
                                >
                                    {page}
                                </Button>
                            );
                        })}
                        <Button
                            
                            className="px-4 py-2"
                            onClick={() => fetchData(currentPage + 1)}
                            disabled={currentPage === lastPage}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HostKeyList;
