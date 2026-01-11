import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
    ChevronRightIcon,
    MapPinIcon,
    ClockIcon,
    SignalIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';

interface Transaction {
    id: number;
    amount: number;
    status: string;
    created_at: string;
}

interface Key {
    id: number;
    label: string;
    package_type: string;
    current_assignment?: {
        cell?: {
            hive?: {
                name: string;
                address: string;
                operating_hours: string;
            }
        };
        nfc_fob?: {
            fob_uid: string;
        }
    };
    assignments: {
        transactions: Transaction[];
    }[];
}

const HostKeyDetails = () => {
    const { id, keyId } = useParams<{ id: string; keyId: string }>();
    const [key, setKey] = useState<Key | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchKeyDetails = async () => {
            setIsLoading(true);
            try {
                // We can use the same host show endpoint or a specific key one
                // For now, let's assume we fetch the host and find the key
                const response = await api.get(`/admin/hosts/${id}`);
                const hostData = response.data.data;
                const foundKey = hostData.keys.find((k: any) => k.id === parseInt(keyId!));
                setKey(foundKey);
            } catch (error) {
                console.error('Failed to fetch key details', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchKeyDetails();
    }, [id, keyId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
            </div>
        );
    }

    if (!key) {
        return <div className="text-center py-12 text-gray-500 font-medium">Key not found</div>;
    }

    const hive = key.current_assignment?.cell?.hive;
    const fob = key.current_assignment?.nfc_fob;

    // Flatten transactions from all assignments
    const transactions = key.assignments.flatMap(a => a.transactions).sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/admin/hosts" className="hover:text-bumble-black transition-colors">Hosts</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <Link to={`/admin/hosts/${id}`} className="hover:text-bumble-black transition-colors">Host Details</Link>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-gray-900 font-bold">{key.label}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Key Details Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Key Name</h3>
                        <p className="text-2xl font-bold text-gray-900">{key.label}</p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4" />
                                    BumbleHive Address
                                </h4>
                                <p className="text-gray-900 font-medium">
                                    {hive?.address || '21-22 Embankment Pl, London WC2N 6NN, UK'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4" />
                                    Opening Hours
                                </h4>
                                <p className="text-gray-900 font-medium">
                                    {hive?.operating_hours || 'Everyday : Open 24 Hours'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <SignalIcon className="h-4 w-4" />
                                    Fob ID
                                </h4>
                                <p className="text-gray-900 font-medium">{fob?.fob_uid || 'FOB101022'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CreditCardIcon className="h-4 w-4" />
                                    Subscription
                                </h4>
                                <p className="text-gray-900 font-medium">
                                    {key.package_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Package
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="p-8 border-b border-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[600px] scrollbar-hide">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="p-6 rounded-2xl border border-gray-50 bg-gray-50/30"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {new Date(tx.created_at).toLocaleDateString()} - {new Date(new Date(tx.created_at).setMonth(new Date(tx.created_at).getMonth() + 1)).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
                                            Payment Status <span className={`font-bold ${tx.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.status === 'completed' ? 'PAID' : 'FAILED'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="text-center py-12">
                                <CreditCardIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No payment history</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostKeyDetails;
