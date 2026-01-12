import { useEffect, useState } from 'react';
import { useTheme } from '../../store/theme';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../store/toast';
import Button from '../../components/common/Button';


const CollectionCodeView = () => {
    const { isDarkMode } = useTheme();
    const { showToast } = useToast();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [key, setKey] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [magicLink, setMagicLink] = useState<string | null>(null);
    const [guestName, setGuestName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchKeyAndMagicLink();
    }, [id]);

    const fetchKeyAndMagicLink = async () => {
        setIsLoading(true);
        try {
            const keyResponse = await api.get(`/hosts/keys/${id}`);
            const keyData = keyResponse.data.data;
            setKey(keyData);
            setGuestName(keyData.current_assignment?.guest?.name || '');

            if (keyData.current_assignment) {
                const linkResponse = await api.post(`/hosts/assignments/${keyData.current_assignment.id}/magic-link`);
                setMagicLink(linkResponse.data.magic_link);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveName = async () => {
        if (!key?.current_assignment) return;
        setIsSavingName(true);
        try {
            await api.post(`/hosts/assignments/${key.current_assignment.id}/guest`, {
                name: guestName
            });
            // Refresh key data to get updated guest name
            const keyResponse = await api.get(`/hosts/keys/${id}`);
            setKey(keyResponse.data.data);
            showToast('Guest name saved successfully', 'success');
        } catch (error) {
            console.error('Failed to save guest name', error);
            showToast('Failed to save guest name', 'error');
        } finally {
            setIsSavingName(false);
        }
    };

    const copyToClipboard = () => {
        if (magicLink) {
            navigator.clipboard.writeText(magicLink);
            setCopied(true);
            showToast('Magic link copied to clipboard', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center py-12 px-4 ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
            <div className={`max-w-2xl w-full rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                <div className="p-12 space-y-12">
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-primary">
                            Collection code and link Generated
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-primary mb-2">Pick Up Instructions</h3>
                            <p className="text-secondary text-xs leading-relaxed max-w-md">
                                Share the following link with your guest. It contains all details regarding the collection code and location map
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="primary"
                                className="flex-1 py-3 text-sm"
                                onClick={() => window.open(magicLink || '', '_blank')}
                                disabled={!magicLink}
                            >
                                Open Link
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 py-3 text-sm"
                                onClick={copyToClipboard}
                                disabled={!magicLink}
                            >
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </div>
                    </div>

                    <div className={`pt-12 border-t space-y-6 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                        <div>
                            <h3 className="text-sm font-bold text-primary mb-2">Guest Information</h3>
                            <p className="text-secondary text-xs leading-relaxed max-w-md">
                                If you think it will be easier for the partner to recognize the guest, you can put his name in the following section.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-primary">Guest Name</label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Write the name"
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow transition-all text-sm ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    className="px-8 py-2.5 text-sm"
                                    onClick={handleSaveName}
                                    isLoading={isSavingName}
                                >
                                    Save Name
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className={`pt-6 border-t ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                        <Button
                            variant="primary"
                            className="w-full py-3 text-sm"
                            onClick={() => navigate('/host/keys')}
                        >
                            Go Back to Keys
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionCodeView;
