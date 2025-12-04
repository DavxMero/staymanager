'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface DateSelectionCardProps {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    onUpdate?: (data: { checkIn?: string; checkOut?: string; adults?: number; children?: number }) => void;
}

export function DateSelectionCard({
    checkIn,
    checkOut,
    adults = 1,
    children = 0,
    onUpdate
}: DateSelectionCardProps) {
    const [localCheckIn, setLocalCheckIn] = useState(checkIn || '');
    const [localCheckOut, setLocalCheckOut] = useState(checkOut || '');
    const [localAdults, setLocalAdults] = useState(adults);
    const [localChildren, setLocalChildren] = useState(children);

    const handleUpdate = () => {
        onUpdate?.({
            checkIn: localCheckIn,
            checkOut: localCheckOut,
            adults: localAdults,
            children: localChildren,
        });
    };

    const updateCount = (type: 'adults' | 'children', increment: number) => {
        if (type === 'adults') {
            const newValue = Math.max(1, localAdults + increment);
            setLocalAdults(newValue);
            onUpdate?.({ checkIn: localCheckIn, checkOut: localCheckOut, adults: newValue, children: localChildren });
        } else {
            const newValue = Math.max(0, localChildren + increment);
            setLocalChildren(newValue);
            onUpdate?.({ checkIn: localCheckIn, checkOut: localCheckOut, adults: localAdults, children: newValue });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border-2 border-blue-200 dark:border-gray-600"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Dates</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose your check-in and check-out dates</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Date Inputs */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Check-in
                        </label>
                        <input
                            type="date"
                            value={localCheckIn}
                            onChange={(e) => {
                                setLocalCheckIn(e.target.value);
                                onUpdate?.({ checkIn: e.target.value, checkOut: localCheckOut, adults: localAdults, children: localChildren });
                            }}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Check-out
                        </label>
                        <input
                            type="date"
                            value={localCheckOut}
                            onChange={(e) => {
                                setLocalCheckOut(e.target.value);
                                onUpdate?.({ checkIn: localCheckIn, checkOut: e.target.value, adults: localAdults, children: localChildren });
                            }}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Guest Counter */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">Guests</span>
                    </div>

                    <div className="space-y-3">
                        {/* Adults Counter */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">Adults</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Age 13+</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateCount('adults', -1)}
                                    disabled={localAdults <= 1}
                                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                                >
                                    <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                </motion.button>
                                <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{localAdults}</span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateCount('adults', 1)}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all"
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Children Counter */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">Children</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Age 0-12</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateCount('children', -1)}
                                    disabled={localChildren <= 0}
                                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                                >
                                    <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                </motion.button>
                                <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{localChildren}</span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateCount('children', 1)}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all"
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                {localCheckIn && localCheckOut && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700"
                    >
                        <div className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                            ✓ Ready to search
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-400">
                            {localAdults} adult{localAdults > 1 ? 's' : ''}{localChildren > 0 && `, ${localChildren} child${localChildren > 1 ? 'ren' : ''}`} • {
                                Math.ceil((new Date(localCheckOut).getTime() - new Date(localCheckIn).getTime()) / (1000 * 60 * 60 * 24))
                            } night{Math.ceil((new Date(localCheckOut).getTime() - new Date(localCheckIn).getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
