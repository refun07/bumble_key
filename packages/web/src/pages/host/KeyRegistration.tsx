import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../store/toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';



const KeyRegistration = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const [formData, setFormData] = useState({
        property_id: '',
        label: '',
        key_type: 'master',
        package_type: 'monthly',
        description: '',
        notes: '',
        hive_id: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propsRes, hivesRes] = await Promise.all([
                    api.get('/hosts/properties'),
                    api.get('/hives')
                ]);
                console.log('Fetched data:', { props: propsRes.data.data, hives: hivesRes.data.data });
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});
        try {
            await api.post('/hosts/keys', formData);
            showToast('Key registered successfully', 'success');
            navigate('/host/keys');
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                showToast('Please check the form for errors', 'error');
            } else {
                showToast('Failed to register key', 'error');
            }
        } finally {
            setIsSaving(false);
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
        <div className="min-h-screen bg-[#F8F9FB] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto bg-white rounded-[40px] shadow-sm border border-gray-100 p-12">
                <div className="text-left mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Register Your Key
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <Input
                            label="Key Name"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            error={errors.label?.[0]}
                            required
                        />

                        <Input
                            label="Address"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />

                        <Input
                            label="Property ID"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            value={formData.property_id}
                            onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                        />

                        <Input
                            label="Notes"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Key Image</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Write the name"
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:bg-white transition-all text-sm"
                                    readOnly
                                />
                                <Button type="button" variant="bumble" className="px-6 py-3">
                                    Upload
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">BumbleHive</label>
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src="/bumblehive_preview.png" alt="BumbleHive" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">Embakment - Ap Food Express</h4>
                                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">21-22 Embankment Pl, London WC2N 6NN, UK</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            variant="bumble"
                            className="w-full py-4 text-lg"
                            isLoading={isSaving}
                        >
                            Save Key Details
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default KeyRegistration;
