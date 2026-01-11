import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { useTheme } from '../../store/theme';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
    HomeIcon,
    CubeIcon,
    SignalIcon,
    UserGroupIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    BellIcon,
    MagnifyingGlassIcon,
    SunIcon,
    MoonIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);

        try {
            const response = await api.get(`/admin/search?q=${query}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
        { name: 'Boxes', href: '/admin/boxes', icon: CubeIcon },
        { name: 'NFC Fobs', href: '/admin/nfc-fobs', icon: SignalIcon },
        { name: 'Hive Partners', href: '/admin/partners', icon: UserGroupIcon },
        { name: 'Hosts', href: '/admin/hosts', icon: UsersIcon },
        { name: 'Activity Logs', href: '/admin/activity-log', icon: ClipboardDocumentListIcon },
        { name: 'Accounts', href: '/admin/accounts', icon: CurrencyDollarIcon },
        { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
        { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ];

    return (
        <div className={`min-h-screen flex font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'bg-[#0F0F0F] text-white' : 'bg-[#F8F9FB] text-gray-900'}`}>
            {/* Sidebar */}
            <aside className={`w-72 fixed h-full z-20 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#171717] border-r border-zinc-800' : 'bg-white border-r border-gray-100'}`}>
                <div className="flex items-center h-24 px-8">
                    <img src="/logo.png" alt="BumbleKey Logo" className="h-10 w-auto object-contain" />
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'bg-bumble-yellow text-bumble-black shadow-lg shadow-bumble-yellow/20 scale-[1.02]'
                                    : isDarkMode
                                        ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white hover:translate-x-1'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                    }`}
                            >
                                <item.icon className={`mr-3.5 h-5 w-5 transition-all duration-300 ${isActive ? 'text-bumble-black scale-110' : isDarkMode ? 'text-zinc-500 group-hover:text-white group-hover:scale-110' : 'text-gray-400 group-hover:text-gray-900 group-hover:scale-110'}`} aria-hidden="true" />
                                {item.name}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-bumble-black rounded-r-full"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`p-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-gray-50 bg-gray-50/30'}`}>
                    <div className={`p-4 rounded-3xl border shadow-sm flex items-center gap-4 transition-colors duration-300 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'}`}>
                        <div className="h-11 w-11 rounded-2xl bg-bumble-yellow flex items-center justify-center text-bumble-black font-bold text-lg shadow-md">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Admin User'}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider truncate ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Super Admin</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                            title="Logout"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-72 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className={`backdrop-blur-md border-b h-20 flex items-center justify-between px-10 sticky top-0 z-10 transition-colors duration-300 ${isDarkMode ? 'bg-[#0F0F0F]/80 border-zinc-800' : 'bg-white/80 border-gray-100'}`}>
                    <div className="flex items-center gap-8">
                        <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Admin'}
                        </h2>
                        <div className="hidden md:block relative" ref={searchRef}>
                            <div className={`flex items-center rounded-2xl px-4 py-2 w-80 group transition-all ${isDarkMode ? 'bg-zinc-800 border border-zinc-700 focus-within:ring-2 focus-within:ring-bumble-yellow/20 focus-within:border-bumble-yellow' : 'bg-gray-50 border border-gray-100 focus-within:ring-2 focus-within:ring-bumble-yellow/20 focus-within:border-bumble-yellow'}`}>
                                <MagnifyingGlassIcon className={`h-4 w-4 mr-3 transition-colors ${isSearching ? 'text-bumble-yellow animate-pulse' : 'text-gray-400'}`} />
                                <input
                                    type="text"
                                    placeholder="Search everything..."
                                    className={`bg-transparent border-none text-sm focus:ring-0 focus:outline-none w-full font-medium ${isDarkMode ? 'placeholder:text-zinc-500 text-white' : 'placeholder:text-gray-400 text-gray-900'}`}
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && (
                                <div className={`absolute top-full left-0 w-full mt-2 rounded-2xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'}`}>
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map((result, idx) => (
                                                <div
                                                    key={`${result.type}-${result.id}-${idx}`}
                                                    onClick={() => {
                                                        navigate(result.url);
                                                        setShowResults(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${result.type === 'host' ? 'bg-blue-50 text-blue-600' :
                                                        result.type === 'partner' ? 'bg-green-50 text-green-600' :
                                                            result.type === 'box' ? 'bg-orange-50 text-orange-600' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {result.type === 'host' ? <UsersIcon className="h-4 w-4" /> :
                                                            result.type === 'partner' ? <UserGroupIcon className="h-4 w-4" /> :
                                                                result.type === 'box' ? <CubeIcon className="h-4 w-4" /> :
                                                                    <SignalIcon className="h-4 w-4" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{result.title}</p>
                                                        <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            {isSearching ? 'Searching...' : 'No results found'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'text-bumble-yellow hover:bg-zinc-800' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </button>
                        <button className={`p-2.5 rounded-xl transition-all relative ${isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <BellIcon className="h-6 w-6" />
                            <span className={`absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 ${isDarkMode ? 'border-[#0F0F0F]' : 'border-white'}`}></span>
                        </button>
                        <div className={`h-8 w-px mx-2 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-100'}`}></div>

                        {/* User Menu Dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl transition-all ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-50'}`}
                            >
                                <div className="text-right hidden sm:block">
                                    <p className={`text-sm font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Admin'}</p>
                                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Online</p>
                                </div>
                                <div className="h-10 w-10 rounded-2xl bg-bumble-black flex items-center justify-center text-white font-bold shadow-sm">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''} ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'}`}>
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate('/admin/settings');
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isDarkMode ? 'text-zinc-300 hover:bg-zinc-700 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                                        >
                                            <UserCircleIcon className="h-5 w-5" />
                                            Profile Settings
                                        </button>
                                        <div className={`mx-3 my-1 border-t ${isDarkMode ? 'border-zinc-700' : 'border-gray-100'}`}></div>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
