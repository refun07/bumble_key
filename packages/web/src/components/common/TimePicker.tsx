import { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    className?: string;
    disabled?: boolean;
}

const generateTimeOptions = () => {
    const times = [];
    const periods = ['AM', 'PM'];
    for (const period of periods) {
        for (let hour = 0; hour < 12; hour++) {
            const displayHour = hour === 0 ? 12 : hour;
            for (let minute = 0; minute < 60; minute += 30) {
                const displayMinute = minute.toString().padStart(2, '0');
                times.push(`${displayHour}:${displayMinute} ${period}`);
            }
        }
    }
    return times;
};

const TIME_OPTIONS = generateTimeOptions();

const TimePicker = ({ value, onChange, className = '', disabled = false }: TimePickerProps) => {
    // Ensure value is formatted correctly or default to something valid if empty
    const [selected, setSelected] = useState(value || '10:00 AM');

    useEffect(() => {
        if (value) setSelected(value);
    }, [value]);

    const handleChange = (time: string) => {
        setSelected(time);
        onChange(time);
    };

    return (
        <div className={`relative ${className}`}>
            <Listbox value={selected} onChange={handleChange} disabled={disabled}>
                <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2.5 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus-visible:border-bumble-yellow focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm transition-all shadow-sm">
                        <span className="block truncate font-medium text-gray-700">{selected}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ClockIcon
                                className="h-4 w-4 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                            {TIME_OPTIONS.map((time, timeIdx) => (
                                <Listbox.Option
                                    key={timeIdx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-bumble-yellow/10 text-bumble-yellow-dark' : 'text-gray-900'
                                        }`
                                    }
                                    value={time}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-bold text-bumble-yellow-dark' : 'font-normal'
                                                    }`}
                                            >
                                                {time}
                                            </span>
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

export default TimePicker;
