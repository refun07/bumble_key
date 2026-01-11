import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import {
    ChevronLeftIcon,
    PencilIcon,
    TrashIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

interface Assignment {
    id: number;
    state: string;
    pickup_code: string | null;
    drop_off_code: string | null;
    nfc_fob_id?: number;
    guest?: {
        name: string;
    };
    cell?: {
        hive?: {
            name: string;
            address: string;
            operating_hours?: any;
        }
    };
    created_at: string;
}

interface Key {
    id: number;
    label: string;
    status: string;
    package_type: string;
    description: string | null;
    key_type: string;
    property: {
        title: string;
        address: string;
    };
    current_assignment: Assignment | null;
    assignments: Assignment[];
}

const HostKeyDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [key, setKey] = useState<Key | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchKeyDetails();
    }, [id]);

    const fetchKeyDetails = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/hosts/keys/${id}`);
            setKey(response.data.data);
        } catch (error) {
            console.error('Failed to fetch key details', error);
        } finally {
            setIsLoading(false);
        }
    };



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

    const currentHive = key.current_assignment?.cell?.hive;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link to="/host/keys" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">Key Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Key Info */}
                <div className="bg-white rounded-xl border-2 border-[#3B82F6] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-gray-100 flex justify-between items-start">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Key Name</h3>
                            <p className="text-2xl font-bold text-gray-900">{key.label}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <PencilIcon className="h-5 w-5 text-gray-400" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <TrashIcon className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div className="p-10 space-y-8 flex-1">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">BumbleHive Address</h4>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                {currentHive?.address || '21-22 Embankment Pl, London WC2N 6NN, UK'}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Opening Hours</h4>
                            <p className="text-sm text-gray-500 font-medium">
                                Everyday : Open 24 Hours
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fob ID</h4>
                            <p className="text-sm text-gray-500 font-medium">
                                FOB101022
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subscription</h4>
                            <p className="text-sm text-gray-500 font-medium capitalize">
                                Monthly Package
                            </p>
                        </div>
                    </div>

                    <div className="p-10 bg-white border-t border-gray-100 flex gap-4">
                        <Button
                            variant="primary"
                            className="flex-1 py-4 bg-black text-white hover:bg-gray-800 rounded-lg font-bold"
                            onClick={() => navigate(`/host/keys/${key.id}/collection`)}
                        >
                            Get Collection Code
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 py-4 border-black text-black hover:bg-gray-50 rounded-lg font-bold"
                        >
                            View Codes
                        </Button>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">History</h3>
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 scrollbar-hide border-r-4 border-[#450A0A]/10">
                        {key.assignments.map((assignment, index) => (
                            <div
                                key={assignment.id}
                                className={`p-6 rounded-xl border transition-all ${index === 0
                                    ? 'bg-black border-black text-white shadow-lg'
                                    : 'bg-white border-gray-100 text-gray-900 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${index === 0 ? 'text-white' : 'text-gray-900'}`}>
                                            03.01.2025 21:42
                                        </span>
                                    </div>
                                    {index === 0 && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                                            CURRENT STATE
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs font-medium ${index === 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                                    Key Dropped off at <span className="font-bold">Melbourne-Ezymart Carlton</span>
                                </p>
                            </div>
                        ))}
                        {key.assignments.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-3xl border border-gray-50">
                                <KeyIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No history yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostKeyDetails;
