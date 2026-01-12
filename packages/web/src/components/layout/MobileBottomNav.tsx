import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    KeyIcon,
    BuildingOfficeIcon,
    UserIcon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../store/theme';

interface NavItem {
    name: string;
    href: string;
    icon: React.ForwardRefExoticComponent<any>;
}

const MobileBottomNav: React.FC<{ type: 'admin' | 'host' }> = ({ type }) => {
    const location = useLocation();
    const { isDarkMode } = useTheme();

    const adminNavigation: NavItem[] = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Squares2X2Icon },
        { name: 'Partners', href: '/admin/partners', icon: BuildingOfficeIcon },
        { name: 'Hives', href: '/admin/hives', icon: HomeIcon },
        { name: 'Fobs', href: '/admin/fobs', icon: KeyIcon },
    ];

    const hostNavigation: NavItem[] = [
        { name: 'Dashboard', href: '/host/dashboard', icon: Squares2X2Icon },
        { name: 'Keys', href: '/host/keys', icon: KeyIcon },
        { name: 'Properties', href: '/host/properties', icon: BuildingOfficeIcon },
        { name: 'Profile', href: '/host/settings', icon: UserIcon },
    ];

    const navigation = type === 'admin' ? adminNavigation : hostNavigation;

    return (
        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe border-t transition-colors duration-300 ${isDarkMode ? 'bg-[#171717]/90 border-zinc-800' : 'bg-white/90 border-gray-100'
            } backdrop-blur-lg`}>
            <div className="flex justify-around items-center h-16 px-2">
                {navigation.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 transition-all duration-300 active:scale-90 ${isActive
                                    ? 'text-bumble-yellow'
                                    : isDarkMode
                                        ? 'text-zinc-500'
                                        : 'text-gray-400'
                                }`}
                        >
                            <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                            <span className="text-[10px] font-bold truncate uppercase tracking-tighter">
                                {item.name}
                            </span>
                            {isActive && (
                                <span className="absolute bottom-1 w-1 h-1 bg-bumble-yellow rounded-full"></span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
