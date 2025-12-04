'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Room {
    id: string;
    number: string;
    type: string;
    base_price: number;
}

interface RoomCardProps {
    room: Room;
    checkIn: string;
    checkOut: string;
    onBook: (room: Room) => void;
}

export function RoomCard({ room, checkIn, checkOut, onBook }: RoomCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getRoomIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('suite')) return '👑';
        if (lowerType.includes('deluxe')) return '⭐';
        return '🏨';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">{getRoomIcon(room.type)}</div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {room.type}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Room {room.number}
                            </p>
                        </div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                        Available
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <div className="space-y-3">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatPrice(room.base_price)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            / night
                        </span>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{checkIn} → {checkOut}</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {['WiFi', 'AC', 'TV', 'Breakfast'].map((amenity) => (
                            <span
                                key={amenity}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                            >
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Book Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onBook(room)}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Book This Room
                </motion.button>
            </div>

            {/* Hover Effect Border */}
            <motion.div
                className="absolute inset-0 border-2 border-blue-500 dark:border-blue-400 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
            />
        </motion.div>
    );
}
