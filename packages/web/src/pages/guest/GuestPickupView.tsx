import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';


const GuestPickupView = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPickupDetails();
    }, [id, location.search]);

    const fetchPickupDetails = async () => {
        setIsLoading(true);
        try {
            // The signature is in the query string
            const response = await api.get(`/guest/pickup/${id}${location.search}`);
            setData(response.data.data);
        } catch (err: any) {
            console.error('Failed to fetch pickup details', err);
            setError(err.response?.data?.message || 'Invalid or expired link');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
                    <div className="text-red-500 text-5xl mb-4">!</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Link Error</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Button variant="bumble" className="w-full py-3 rounded-xl font-bold" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
                        {data.host_name || 'Melbourne Booker'} have shared this link with you<br />
                        Key is ready for <span className="text-bumble-yellow">pickup</span>
                    </h2>
                </div>

                <div className="space-y-12">
                    {/* Step 1 */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                01
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">Get to the BumbleHive Point</h3>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
                                    <img src="/bumblehive_preview.png" alt={data.hive?.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="md:w-1/2 p-8 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">{data.hive?.name || 'Embakment - Ap Food Express'}</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">{data.hive?.address || '21-22 Embankment Pl, London WC2N 6NN, UK'}</p>
                                    </div>

                                    <div>
                                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Opening Hours</h5>
                                        <div className="space-y-0.5">
                                            <p className="text-xs text-gray-600 font-medium">Mon - Sat: 08:00 - 23:00</p>
                                            <p className="text-xs text-gray-600 font-medium">Sun: 08:00 - 22:30</p>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full py-2.5 rounded-lg font-bold bg-black text-white border-none text-xs">
                                        Get Directions on Map
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                02
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">Share the pickup code with the store owner.</h3>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center justify-center">
                            <div className="border-2 border-gray-100 rounded-2xl px-12 py-6 text-6xl font-bold text-gray-900 tracking-tighter">
                                {data.pickup_code || '12345'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestPickupView;
