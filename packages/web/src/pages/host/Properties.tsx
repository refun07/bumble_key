import { useEffect, useState } from 'react';
import { useTheme } from '../../store/theme';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';

import {
    MagnifyingGlassIcon,
    PencilIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { TableShimmer } from '../../components/common/Shimmer';

interface Key {
    id: number;
    label: string;
    status: string;
}

interface Property {
    id: number;
    title: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    is_active: boolean;
    keys?: Key[];
}

const Properties = () => {
    const { isDarkMode } = useTheme();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);

    const fetchData = async (page = currentPage) => {
        setIsLoading(true);
        try {
            const propertiesResponse = await api.get('/hosts/properties-list', {
                params: {
                    page
                }
            });

            setProperties(propertiesResponse.data.data);
            setCurrentPage(propertiesResponse.data.current_page || 1);
            setLastPage(propertiesResponse.data.last_page || 1);
            setTotalProperties(propertiesResponse.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch properties', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const filteredProperties = properties.filter((property) => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        const address = [property.address, property.city, property.country]
            .filter(Boolean)
            .join(', ')
            .toLowerCase();
        const keyLabels = property.keys?.map((key) => key.label.toLowerCase()).join(' ') || '';
        return [
            property.title,
            property.description,
            address,
            keyLabels
        ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query));
    });

    const getPropertyAddress = (property: Property) => {
        const address = [property.address, property.city, property.country]
            .filter(Boolean)
            .join(', ');
        return address || 'No address provided';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full overflow-x-hidden">
                <div className="flex-1 flex flex-wrap items-center gap-4 min-w-0">
                    <div className="relative w-full lg:w-80 min-w-0">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, address, or key"
                            className={`w-full min-w-0 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all shadow-sm text-sm 
                                ${isDarkMode 
                                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' 
                                    : 'bg-white border-gray-100 text-gray-900 placeholder-gray-400'
                                }`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setSearch('');
                            fetchData(1);
                        }}
                        className="px-6 py-3 whitespace-nowrap"
                    >
                        Clear Search
                    </Button>
                </div>

                <Link to="/host/properties/new">
                    <Button variant="bumble" className="px-8 py-3 whitespace-nowrap">
                        Add New Property
                    </Button>
                </Link>
            </div>


            <div className="space-y-3">
                {isLoading ? (
                    <TableShimmer rows={6} cols={5} />
                ) : (
                    <>
                        {filteredProperties.map((property) => (
                            <Link
                                key={property.id}
                                to={`/host/properties/${property.id}`}
                                className={`block p-5 rounded-xl border shadow-sm transition-all group ${isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-bumble-yellow/30' : 'bg-white border-gray-50 hover:border-bumble-yellow/50'}`}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                                    <div className="md:col-span-3 font-bold text-primary text-sm">
                                        {property.title}
                                    </div>

                                    <div className="md:col-span-4 text-sm text-secondary truncate">
                                        {getPropertyAddress(property)}
                                    </div>

                                    <div className="md:col-span-3 text-sm text-primary font-medium">
                                        {property.keys?.length ? `${property.keys.length} key${property.keys.length === 1 ? '' : 's'}` : 'No keys'}
                                    </div>

                                    <div className="md:col-span-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                                        {property.is_active ? 'Active' : 'Inactive'}
                                    </div>

                                    <div className="md:col-span-1 flex justify-end">
                                        <div className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'group-hover:bg-zinc-800' : 'group-hover:bg-gray-50'}`}>
                                            <PencilIcon className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {filteredProperties.length === 0 && (
                            <div className={`rounded-3xl border p-20 text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                                    <ArrowPathIcon className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">No properties found</h3>
                                <p className="text-secondary max-w-xs mx-auto mb-8">
                                    We couldn't find any properties matching your search.
                                </p>
                                <Button variant="outline" onClick={() => { setSearch(''); }}>
                                    Clear search
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {lastPage > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-secondary">
                        Showing page {currentPage} of {lastPage} ({totalProperties} total)
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <Button
                           
                            className="px-4 py-2"
                            onClick={() => fetchData(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: lastPage }, (_, index) => {
                            const page = index + 1;
                            const isActive = page === currentPage;
                            return (
                                <Button
                                    key={page}
                                   
                                    className="px-4 py-2"
                                    onClick={() => fetchData(page)}
                                    disabled={isActive}
                                >
                                    {page}
                                </Button>
                            );
                        })}
                        <Button
                            
                            className="px-4 py-2"
                            onClick={() => fetchData(currentPage + 1)}
                            disabled={currentPage === lastPage}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Properties;
