import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../store/toast';
import Button from '../../components/common/Button';


const CollectionCodeView = () => {
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
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-12 space-y-12">
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-gray-900">
                            Collection code and link Generated
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Pick Up Instructions</h3>
                            <p className="text-gray-500 text-xs leading-relaxed max-w-md">
                                Share the following link with your guest. It contains all details regarding the collection code and location map
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="bumble"
                                className="flex-1 py-3 text-sm"
                                onClick={() => window.open(magicLink || '', '_blank')}
                                disabled={!magicLink}
                            >
                                Open Link
                            </Button>
                            <Button
                                variant="bumble"
                                className="flex-1 py-3 text-sm"
                                onClick={copyToClipboard}
                                disabled={!magicLink}
                            >
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-gray-100 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Guest Information</h3>
                            <p className="text-gray-500 text-xs leading-relaxed max-w-md">
                                If you think it will be easier for the partner to recognize the guest, you can put his name in the following section.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-900">Guest Name</label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Write the name"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all text-sm"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="bumble"
                                    className="px-8 py-2.5 text-sm"
                                    onClick={handleSaveName}
                                    isLoading={isSavingName}
                                >
                                    Save Name
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <Button
                            variant="bumble"
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
