import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
    PlusIcon,
    PencilSquareIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    LinkIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { TableShimmer } from '../../components/common/Shimmer';
import { useToast } from '../../store/toast';

interface Host {
    id: number;
    name: string;
    business_name: string | null;
    email: string;
    phone: string | null;
    is_active: boolean;
    keys_count: number;
    package_types: string[];
}

const HostList = () => {
    const { showToast } = useToast();
    const [hosts, setHosts] = useState<Host[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHost, setSelectedHost] = useState<Host | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchHosts();
    }, [search, statusFilter]);

    const fetchHosts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/hosts', {
                params: {
                    search,
                    status: statusFilter === 'all' ? '' : statusFilter
                }
            });
            setHosts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch hosts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (host: Host) => {
        try {
            await api.put(`/admin/hosts/${host.id}`, {
                is_active: !host.is_active
            });
            showToast(`Host ${!host.is_active ? 'activated' : 'deactivated'} successfully`, 'success');
            fetchHosts();
        } catch (error) {
            console.error('Failed to toggle status', error);
            showToast('Failed to update host status', 'error');
        }
    };

    const handleAddClick = () => {
        setSelectedHost(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEditClick = (host: Host) => {
        setSelectedHost(host);
        setFormData({
            name: host.name,
            email: host.email,
            phone: host.phone || '',
            password: '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});
        try {
            if (selectedHost) {
                await api.put(`/admin/hosts/${selectedHost.id}`, formData);
                showToast('Host profile updated successfully', 'success');
            } else {
                await api.post('/admin/hosts', formData);
                showToast('Host created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchHosts();
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                showToast('Please check the form for errors', 'error');
            } else {
                showToast('Failed to save host', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
    };

    const copySignupLink = () => {
        const link = `${window.location.origin}/host/signup`;
        navigator.clipboard.writeText(link);
        showToast('Host signup link copied to clipboard!', 'success');
    };

    const handleInviteHost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            // Placeholder for actual invitation API
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast(`Invitation sent to ${inviteEmail}`, 'success');
            setIsInviteModalOpen(false);
            setInviteEmail('');
        } catch (error) {
            console.error('Failed to send invitation', error);
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Hosts</h2>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={copySignupLink}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-gray-200 text-gray-700 font-bold"
                    >
                        <LinkIcon className="h-5 w-5" />
                        <span>Copy Signup Link</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-gray-200 text-gray-700 font-bold"
                    >
                        <EnvelopeIcon className="h-5 w-5" />
                        <span>Invite Host</span>
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg"
                    >
                        <PlusIcon className="h-5 w-5 stroke-[3]" />
                        <span>Add New Partner</span>
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:bg-white transition-all sm:text-sm"
                        placeholder="Search BumbleHive/Partner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Status</span>
                    <select
                        className="w-full md:w-40 px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:bg-white transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <button
                    onClick={resetFilters}
                    className="w-full md:w-auto px-8 py-3 border-2 border-black rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                >
                    Reset Filters
                </button>
            </div>

            {/* Hosts List */}
            <div className="space-y-4">
                {/* Header Row */}
                <div className="grid grid-cols-12 px-8 py-2 text-sm font-bold text-gray-400">
                    <div className="col-span-4">Host Name</div>
                    <div className="col-span-2 text-center">Key registered</div>
                    <div className="col-span-2 text-center">Host Status</div>
                    <div className="col-span-3">Package</div>
                    <div className="col-span-1"></div>
                </div>

                {isLoading ? (
                    <TableShimmer rows={6} cols={5} />
                ) : hosts.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                        <div className="bg-gray-50 p-4 rounded-full">
                            <MagnifyingGlassIcon className="h-8 w-8 text-gray-300" />
                        </div>
                        <div>
                            <p className="text-gray-900 font-bold text-lg">No hosts found</p>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    </div>
                ) : (
                    hosts.map((host) => (
                        <div
                            key={host.id}
                            className="grid grid-cols-12 items-center bg-white px-8 py-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
                        >
                            <div className="col-span-4">
                                <Link
                                    to={`/admin/hosts/${host.id}`}
                                    className="font-bold text-gray-900 hover:text-bumble-yellow transition-colors"
                                >
                                    {host.business_name ? `${host.name} - ${host.business_name}` : host.name}
                                </Link>
                                <p className="text-sm text-gray-400">{host.email}</p>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-50 rounded-lg text-sm font-bold text-gray-700">
                                    {host.keys_count.toString().padStart(2, '0')}
                                </span>
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <button
                                    onClick={() => handleToggleStatus(host)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${host.is_active ? 'bg-bumble-yellow' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${host.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                            <div className="col-span-3">
                                <p className="text-sm font-medium text-gray-500">
                                    {host.package_types.length > 0
                                        ? host.package_types.map(p => p.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(' | ')
                                        : 'No packages'
                                    }
                                </p>
                            </div>
                            <div className="col-span-1 flex justify-end items-center gap-2">
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/host/signup?ref=${host.id}`;
                                        navigator.clipboard.writeText(link);
                                        showToast('Personalized signup link copied!', 'success');
                                    }}
                                    className="p-2 text-gray-400 hover:text-bumble-yellow hover:bg-gray-50 rounded-lg transition-all"
                                    title="Copy personalized signup link"
                                >
                                    <LinkIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleEditClick(host)}
                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                                >
                                    <PencilSquareIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Transition.Root show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-10">
                                    <div className="absolute right-0 top-0 pr-6 pt-6">
                                        <button
                                            type="button"
                                            className="rounded-full bg-gray-50 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-all"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="text-left">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                                                {selectedHost ? 'Edit Host' : 'Add New Host'}
                                            </Dialog.Title>
                                            <form onSubmit={handleSave} className="mt-8 space-y-6">
                                                <Input
                                                    label="Full Name"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    error={errors.name?.[0]}
                                                    required
                                                />
                                                <Input
                                                    label="Email Address"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    error={errors.email?.[0]}
                                                    required
                                                />
                                                <Input
                                                    label="Phone Number"
                                                    placeholder="+1 234 567 890"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    error={errors.phone?.[0]}
                                                />
                                                <Input
                                                    label={selectedHost ? "New Password (leave blank to keep current)" : "Password"}
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    error={errors.password?.[0]}
                                                    required={!selectedHost}
                                                />

                                                <div className="pt-4 flex gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="flex-1 py-3 rounded-xl font-bold"
                                                        onClick={() => setIsModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="bumble"
                                                        className="flex-[2] py-3 rounded-xl font-bold shadow-lg"
                                                        isLoading={isSaving}
                                                    >
                                                        {selectedHost ? 'Save Changes' : 'Create Host'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Invite Host Modal */}
            <Transition.Root show={isInviteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsInviteModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-10">
                                    <div className="absolute right-0 top-0 pr-6 pt-6">
                                        <button
                                            type="button"
                                            className="rounded-full bg-gray-50 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-all"
                                            onClick={() => setIsInviteModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="text-left">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                                                Invite New Host
                                            </Dialog.Title>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Send an invitation email to a potential host. They will receive a link to sign up.
                                            </p>
                                            <form onSubmit={handleInviteHost} className="mt-8 space-y-6">
                                                <Input
                                                    label="Email Address"
                                                    type="email"
                                                    placeholder="host@example.com"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    required
                                                />

                                                <div className="pt-4 flex gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="flex-1 py-3 rounded-xl font-bold"
                                                        onClick={() => setIsInviteModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="bumble"
                                                        className="flex-[2] py-3 rounded-xl font-bold shadow-lg"
                                                        isLoading={isInviting}
                                                    >
                                                        Send Invitation
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
};

export default HostList;
