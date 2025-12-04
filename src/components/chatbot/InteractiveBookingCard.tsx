'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, BedDouble, DollarSign, Check } from 'lucide-react';
import { useState } from 'react';

interface BookingInfo {
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    checkIn?: string;
    checkOut?: string;
    roomType?: string;
    adults?: number;
    children?: number;
}

interface InteractiveBookingCardProps {
    bookingInfo: BookingInfo;
    onUpdate?: (info: BookingInfo) => void;
    stage?: 'info' | 'dates' | 'preferences' | 'confirm';
}

export function InteractiveBookingCard({ bookingInfo, onUpdate, stage = 'info' }: InteractiveBookingCardProps) {
    const [editMode, setEditMode] = useState(false);
    const [localInfo, setLocalInfo] = useState(bookingInfo);

    const handleSave = () => {
        onUpdate?.(localInfo);
        setEditMode(false);
    };

    const isComplete = (fields: (keyof BookingInfo)[]) => {
        return fields.every(field => localInfo[field]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 border-2 border-blue-200 dark:border-gray-600 shadow-lg"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <BedDouble className="w-5 h-5 text-white" />
                    </div>
                    Booking Information
                </h3>
                <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                    {editMode ? 'Cancel' : 'Edit'}
                </button>
            </div>

            <div className="space-y-3">
                {/* Guest Information Section */}
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isComplete(['guestName', 'guestEmail', 'guestPhone'])
                                ? 'bg-green-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                            {isComplete(['guestName', 'guestEmail', 'guestPhone']) && (
                                <Check className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Guest Details
                        </span>
                    </div>

                    <InfoField
                        label="Name"
                        value={localInfo.guestName}
                        editMode={editMode}
                        onChange={(v) => setLocalInfo({ ...localInfo, guestName: v })}
                        icon="👤"
                    />
                    <InfoField
                        label="Email"
                        value={localInfo.guestEmail}
                        editMode={editMode}
                        onChange={(v) => setLocalInfo({ ...localInfo, guestEmail: v })}
                        icon="📧"
                        type="email"
                    />
                    <InfoField
                        label="Phone"
                        value={localInfo.guestPhone}
                        editMode={editMode}
                        onChange={(v) => setLocalInfo({ ...localInfo, guestPhone: v })}
                        icon="📱"
                        type="tel"
                    />
                </div>

                {/* Dates Section */}
                {(stage === 'dates' || stage === 'preferences' || stage === 'confirm') && (
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isComplete(['checkIn', 'checkOut'])
                                    ? 'bg-green-500'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}>
                                {isComplete(['checkIn', 'checkOut']) && (
                                    <Check className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Stay Dates
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <InfoField
                                label="Check-in"
                                value={localInfo.checkIn}
                                editMode={editMode}
                                onChange={(v) => setLocalInfo({ ...localInfo, checkIn: v })}
                                icon="📅"
                                type="date"
                            />
                            <InfoField
                                label="Check-out"
                                value={localInfo.checkOut}
                                editMode={editMode}
                                onChange={(v) => setLocalInfo({ ...localInfo, checkOut: v })}
                                icon="📅"
                                type="date"
                            />
                        </div>
                    </div>
                )}

                {/* Guest Count Section */}
                {(stage === 'preferences' || stage === 'confirm') && (
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Guests
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <InfoField
                                label="Adults"
                                value={localInfo.adults?.toString() || '1'}
                                editMode={editMode}
                                onChange={(v) => setLocalInfo({ ...localInfo, adults: parseInt(v) || 1 })}
                                icon="👨"
                                type="number"
                            />
                            <InfoField
                                label="Children"
                                value={localInfo.children?.toString() || '0'}
                                editMode={editMode}
                                onChange={(v) => setLocalInfo({ ...localInfo, children: parseInt(v) || 0 })}
                                icon="👶"
                                type="number"
                            />
                        </div>
                    </div>
                )}

                {editMode && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-lg transition-all"
                    >
                        Save Changes
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

interface InfoFieldProps {
    label: string;
    value?: string;
    editMode: boolean;
    onChange: (value: string) => void;
    icon?: string;
    type?: string;
}

function InfoField({ label, value, editMode, onChange, icon, type = 'text' }: InfoFieldProps) {
    if (editMode) {
        return (
            <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                    {icon && <span className="mr-1">{icon}</span>}
                    {label}
                </label>
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {value || '—'}
                </div>
            </div>
        </div>
    );
}
