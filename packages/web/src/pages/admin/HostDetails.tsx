import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
    ChevronRightIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

interface Key {
    id: number;
    label: string;
    package_type: string;
    status: string;
    assignments: Assignment[];
}

interface Assignment {
    id: number;
    transactions: Transaction[];
}

interface Transaction {
    id: number;
    amount: string;
    currency: string;
    status: string;
    payment_gateway: string | null;
}

interface Host {
    id: number;
    name: string;
    business_name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    keys_count: number;
    keys: Key[];
}

const HostDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [host, setHost] = useState<Host | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const formatPackageType = (packageType: string) =>
        packageType
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const statusStyles: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        assigned: 'bg-blue-50 text-blue-700 border-blue-100',
        created: 'bg-amber-50 text-amber-700 border-amber-100',
        inactive: 'bg-gray-100 text-gray-600 border-gray-200'
    };

    const getStatusClasses = (status: string) =>
        statusStyles[status?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';

    useEffect(() => {
        const fetchHostDetails = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/admin/hosts/${id}`);
                setHost(response.data.data);
                
            } catch (error) {
                console.error('Failed to fetch host details', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHostDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
            </div>
        );
    }

    if (!host) {
        return <div className="text-center py-12 text-gray-500 font-medium">Host not found</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/admin/hosts" className="hover:text-bumble-black transition-colors">Hosts</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-gray-900 font-bold">Host Details</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Host Info Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Host Name</h3>
                            <p className="text-2xl font-bold text-gray-900">{host.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold text-gray-900">{host.keys_count.toString().padStart(2, '0')}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Keys</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <BuildingOfficeIcon className="h-4 w-4" />
                                    Business Name
                                </h4>
                                <p className="text-gray-900 font-medium">{host.business_name || 'Host Business 1'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4" />
                                    Address
                                </h4>
                                <p className="text-gray-900 font-medium leading-relaxed">
                                    {host.address || '21-22 Embankment Pl, London WC2N 6NN, UK'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4" />
                                    Phone
                                </h4>
                                <p className="text-gray-900 font-medium">{host.phone || '01762229229'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <EnvelopeIcon className="h-4 w-4" />
                                    Email ID
                                </h4>
                                <p className="text-gray-900 font-medium">{host.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscribed Packages Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="p-8 border-b border-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Subscribed Packages</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[600px] scrollbar-hide">
                        {host.keys.map((key) => (
                            <Link
                                key={key.id}
                                to={`/admin/hosts/${host.id}/keys/${key.id}`}
                                className="block p-6 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-bumble-yellow/30 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-bold text-gray-900 group-hover:text-bumble-yellow transition-colors">{key.label}</p>
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusClasses(key.status)}`}
                                            >
                                                {key.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 mt-1">
                                            Package <span className="text-gray-900 font-bold">{formatPackageType(key.package_type)}</span>
                                        </p>
                                    </div>
                                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-bumble-black transition-colors" />
                                </div>
                                <div className="mt-4 space-y-3">
                                    {key.assignments?.length ? (
                                        key.assignments.map((assignment) => (
                                            <div key={assignment.id} className="space-y-2">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                                                    Assignment #{assignment.id}
                                                </p>
                                                {assignment.transactions?.length ? (
                                                    <div className="space-y-2">
                                                        {assignment.transactions.map((transaction) => (
                                                            <div
                                                                key={transaction.id}
                                                                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/80 px-3 py-2 text-xs"
                                                            >
                                                                <div>
                                                                    <p className="font-semibold text-gray-800">
                                                                        {transaction.currency} {transaction.amount}
                                                                    </p>
                                                                    <p className="text-[11px] text-gray-400">
                                                                        Payment gateway: {transaction.payment_gateway || 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${getStatusClasses(transaction.status)}`}
                                                                >
                                                                    {transaction.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400">No transactions yet</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400">No assignments yet</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                        {host.keys.length === 0 && (
                            <div className="text-center py-12">
                                <KeyIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No keys registered</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostDetails;
