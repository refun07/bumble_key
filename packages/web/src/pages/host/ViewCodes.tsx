import { useEffect, useState } from 'react';
import { useTheme } from '../../store/theme';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const ViewCodes = () => {
    const { isDarkMode } = useTheme();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [key, setKey] = useState<any>(null);
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

    if (!key || !key.current_assignment) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center">
                <h2 className="text-xl font-bold text-primary mb-4">No active assignment found</h2>
                <Button variant="primary" onClick={() => navigate(`/host/keys/${id}`)}>
                    Back to Key Details
                </Button>
            </div>
        );
    }

    const { current_assignment } = key;

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
            <div className="flex items-center gap-4">
                <Link to={`/host/keys/${id}`} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                    <ChevronLeftIcon className="h-6 w-6 text-secondary" />
                </Link>
                <h2 className="text-2xl font-bold text-primary">Key Codes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Drop-off Code (For Host) */}
                <div className={`rounded-3xl border shadow-sm p-10 space-y-8 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                    <div>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">For Host</h3>
                        <h4 className="text-xl font-bold text-primary">Drop-off Code</h4>
                    </div>

                    <div className={`rounded-2xl p-8 flex items-center justify-center ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                        <span className="text-5xl font-bold text-primary tracking-tighter">
                            {current_assignment.drop_off_code || 'N/A'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-secondary leading-relaxed font-medium">
                            Use this code when dropping off the key at the BumbleHive point. Share this with the store partner if requested.
                        </p>
                    </div>
                </div>

                {/* Pickup Code (For Guest) */}
                <div className={`rounded-3xl border shadow-sm p-10 space-y-8 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                    <div>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">For Guest</h3>
                        <h4 className="text-xl font-bold text-primary">Pickup Code</h4>
                    </div>

                    <div className={`bg-bumble-yellow/10 rounded-2xl p-8 flex items-center justify-center`}>
                        <span className="text-5xl font-bold text-primary tracking-tighter">
                            {current_assignment.pickup_code || 'N/A'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-secondary leading-relaxed font-medium">
                            This is the code your guest will use to pick up the key. This is also included in the magic link shared with them.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <Button variant="outline" className="px-12 py-4" onClick={() => navigate(`/host/keys/${id}`)}>
                    Back to Key Details
                </Button>
            </div>
        </div>
    );
};

export default ViewCodes;
