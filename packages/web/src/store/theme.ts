import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
}

export const useTheme = create<ThemeState>()(
    persist(
        (set) => ({
            isDarkMode: false,
            toggleDarkMode: () => set((state) => {
                const newValue = !state.isDarkMode;
                if (newValue) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                return { isDarkMode: newValue };
            }),
            setDarkMode: (value) => set(() => {
                if (value) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                return { isDarkMode: value };
            }),
        }),
        {
            name: 'bumblekey-theme',
            onRehydrateStorage: () => (state) => {
                // Apply dark mode class on initial load
                if (state?.isDarkMode) {
                    document.documentElement.classList.add('dark');
                }
            },
        }
    )
);
