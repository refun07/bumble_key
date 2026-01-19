import { useEffect, useState } from 'react';
import { useTheme } from '../../store/theme';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import { format } from 'date-fns';
import {
    ChevronLeftIcon,
    PencilIcon,
    TrashIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

interface NfcFob {
    id: number;
    fob_name: string;
    fob_uid: string;
}

interface Assignment {
    id: number;
    state: string;
    pickup_code: string | null;
    drop_off_code: string | null;
    nfc_fob_id?: number;
    nfc_fob?: NfcFob;
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
    dropped_at: string | null;
    picked_up_at: string | null;
    returned_at: string | null;
    closed_at: string | null;
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
    const { isDarkMode } = useTheme();
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
    const isKeyInUse = key.current_assignment?.state === 'picked_up' || key.current_assignment?.state === 'in_use';

    const handleDelete = async () => {
        if (isKeyInUse) {
            window.alert('Key is currently in use and cannot be deleted.');
            return;
        }

        const confirmed = window.confirm('Are you sure you want to delete this key? This action cannot be undone.');
        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/hosts/keys/${key.id}`);
            navigate('/host/keys');
        } catch (error) {
            console.error('Failed to delete key', error);
            window.alert('Failed to delete key.');
        }
    };

    // Helper to format operating hours
    const formatOperatingHours = (hours: any) => {
        if (!hours) return 'Everyday : Open 24 Hours';
        // This is a placeholder, adjust based on actual structure
        return 'Everyday : Open 24 Hours';
    };

    // Helper to format package type
    const formatPackageType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ') + ' Package';
    };

    // Build timeline events from assignments
    const timelineEvents = key.assignments.flatMap(assignment => {
        const events = [];
        const hiveName = assignment.cell?.hive?.name || 'BumbleHive';

        if (assignment.dropped_at) {
            events.push({
                id: `${assignment.id}-dropped`,
                date: new Date(assignment.dropped_at),
                text: `Key Dropped off at ${hiveName}`,
                type: 'dropped'
            });
        }
        if (assignment.picked_up_at) {
            events.push({
                id: `${assignment.id}-picked`,
                date: new Date(assignment.picked_up_at),
                text: `Key Picked up from ${hiveName}`,
                type: 'picked'
            });
        }
        if (assignment.returned_at) {
            events.push({
                id: `${assignment.id}-returned`,
                date: new Date(assignment.returned_at),
                text: `Key Returned to ${hiveName}`,
                type: 'returned'
            });
        }

        // Fallback for demo/initial states if no timestamps yet but state is set
        if (events.length === 0 && assignment.created_at) {
            events.push({
                id: `${assignment.id}-created`,
                date: new Date(assignment.created_at),
                text: `Assignment created for ${hiveName}`,
                type: 'created'
            });
        }

        return events;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link to="/host/keys" className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <ChevronLeftIcon className="h-6 w-6 text-secondary" />
                </Link>
                <h2 className="text-2xl font-bold text-primary">Key Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Key Info */}
                <div className={`rounded-xl border-2 shadow-sm overflow-hidden flex flex-col ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-[#3B82F6]'}`}>
                    <div className="p-10 border-b border-default flex justify-between items-start">
                        <div>
                            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Key Name</h3>
                            <p className="text-2xl font-bold text-primary">{key.label}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                onClick={() => navigate(`/host/keys/${key.id}/edit`)}
                            >
                                <PencilIcon className="h-5 w-5 text-secondary" />
                            </button>
                            <button
                                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                onClick={handleDelete}
                                disabled={isKeyInUse}
                                title={isKeyInUse ? 'Key is in use' : 'Delete key'}
                            >
                                <TrashIcon className={`h-5 w-5 ${isKeyInUse ? 'text-gray-300' : 'text-secondary'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="p-10 space-y-8 flex-1">
                        <div>
                            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">BumbleHive Address</h4>
                            <p className="text-sm text-secondary font-medium leading-relaxed">
                                {currentHive?.address || 'No location assigned'}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Opening Hours</h4>
                            <p className="text-sm text-secondary font-medium">
                                {formatOperatingHours(currentHive?.operating_hours)}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Fob ID</h4>
                            <p className="text-sm text-secondary font-medium">
                                {key.current_assignment?.nfc_fob?.fob_name || key.current_assignment?.nfc_fob?.fob_uid || 'Not assigned'}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Subscription</h4>
                            <p className="text-sm text-secondary font-medium capitalize">
                                {formatPackageType(key.package_type)}
                            </p>
                        </div>
                    </div>

                    <div className="p-10 bg-primary border-t border-default flex gap-4">
                        <Button
                            variant="primary"
                            className="flex-1 py-4"
                            onClick={() => navigate(`/host/keys/${key.id}/collection`)}
                        >
                            Get Collection Code
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 py-4"
                            onClick={() => navigate(`/host/keys/${key.id}/codes`)}
                        >
                            View Codes
                        </Button>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="relative">
                    <h3 className="text-xl font-bold text-primary mb-6">History</h3>
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 scrollbar-hide border-r-4 border-default">
                        {timelineEvents.map((event, index) => (
                            <div
                                key={event.id}
                                className={`p-6 rounded-xl border transition-all ${index === 0
                                    ? 'bg-bumble-black border-bumble-black text-white shadow-lg'
                                    : 'bg-primary border-default text-primary shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${index === 0 ? 'text-white' : 'text-primary'}`}>
                                            {format(event.date, 'dd.MM.yyyy HH:mm')}
                                        </span>
                                    </div>
                                    {index === 0 && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                                            CURRENT STATE
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs font-medium ${index === 0 ? 'text-zinc-300' : 'text-secondary'}`}>
                                    {event.text.split(' at ').map((part, i) => i === 1 ? <span key={i} className="font-bold">{part}</span> : part).reduce((prev, curr) => [prev, ' at ', curr] as any)}
                                </p>
                            </div>
                        ))}
                        {timelineEvents.length === 0 && (
                            <div className="text-center py-12 bg-primary rounded-3xl border border-default">
                                <KeyIcon className="h-12 w-12 text-secondary opacity-20 mx-auto mb-3" />
                                <p className="text-secondary font-medium">No history yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostKeyDetails;
