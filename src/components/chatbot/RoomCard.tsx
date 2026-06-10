'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface Room {
    id: string;
    number: string;
    type: string;
    base_price: number;
    image_url?: string | null;
    images?: string[];
    amenities?: string[];
    max_occupancy?: number | null;
    room_size?: number | null;
    bed_configuration?: string | null;
    description?: string | null;
}

interface RoomCardProps {
    room: Room;
    checkIn: string;
    checkOut: string;
    onBook: (room: Room) => void;
    count?: number;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);

const getRoomIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('presidential')) return '👑';
    if (lower.includes('suite')) return '🌟';
    if (lower.includes('deluxe')) return '⭐';
    return '🏨';
};

export function RoomCard({ room, checkIn, checkOut, onBook, count }: RoomCardProps) {
    const isGroup = typeof count === 'number';
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const gallery = useMemo(() => {
        const all = [room.image_url, ...(room.images || [])].filter(
            (u): u is string => Boolean(u),
        );
        return Array.from(new Set(all));
    }, [room.image_url, room.images]);

    const primaryImage = gallery[0] || null;
    const amenities =
        room.amenities && room.amenities.length > 0
            ? room.amenities
            : ['WiFi', 'AC', 'TV', 'Breakfast']; // fallback default

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
                {/* Compact Header: thumbnail + name */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {primaryImage ? (
                                <img
                                    src={primaryImage}
                                    alt={room.type}
                                    className="w-14 h-14 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl shrink-0">
                                    {getRoomIcon(room.type)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {room.type}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {isGroup
                                        ? `${count} room${count !== 1 ? 's' : ''} available`
                                        : `Room ${room.number}`}
                                </p>
                            </div>
                        </div>
                        <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 border border-emerald-200 dark:border-emerald-900">
                            Available
                        </span>
                    </div>
                </div>

                {/* Body: price + dates + actions */}
                <div className="p-4 space-y-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {formatPrice(room.base_price)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">/ night</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{checkIn} → {checkOut}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                            onClick={() => setDetailsOpen(true)}
                            className="text-xs font-medium px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onBook(room)}
                            className="text-xs font-semibold px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Book
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Details Modal with carousel */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{room.type} – Room {room.number}</DialogTitle>
                        <DialogDescription>
                            {room.type} room {room.number} at {formatPrice(room.base_price)} per night
                        </DialogDescription>
                    </DialogHeader>

                    {/* Carousel */}
                    <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {gallery.length > 0 ? (
                                <motion.img
                                    key={carouselIndex}
                                    src={gallery[carouselIndex]}
                                    alt={`${room.type} ${room.number} - view ${carouselIndex + 1}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-7xl">
                                    {getRoomIcon(room.type)}
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Carousel controls — always rendered; disabled visually when only 1 image */}
                        {(() => {
                            const multi = gallery.length > 1;
                            return (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => multi && setCarouselIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                                        disabled={!multi}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Previous image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => multi && setCarouselIndex((i) => (i + 1) % gallery.length)}
                                        disabled={!multi}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Next image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    {multi && (
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {gallery.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCarouselIndex(idx)}
                                                    className={`h-1.5 rounded-full transition-all ${
                                                        idx === carouselIndex
                                                            ? 'w-6 bg-white'
                                                            : 'w-1.5 bg-white/60'
                                                    }`}
                                                    aria-label={`Go to image ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Details body */}
                    <div className="p-6 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {room.type}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {isGroup ? `${count} room${count !== 1 ? 's' : ''} available` : `Room ${room.number}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatPrice(room.base_price)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">per night</div>
                            </div>
                        </div>

                        {room.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {room.description}
                            </p>
                        )}

                        {/* Specs grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-gray-200 dark:border-gray-700">
                            <SpecItem
                                label="Type"
                                value={room.type}
                            />
                            {room.max_occupancy && (
                                <SpecItem
                                    label="Capacity"
                                    value={`${room.max_occupancy} guest${room.max_occupancy !== 1 ? 's' : ''}`}
                                />
                            )}
                            {room.room_size && (
                                <SpecItem
                                    label="Size"
                                    value={`${room.room_size} m²`}
                                />
                            )}
                            {room.bed_configuration && (
                                <SpecItem
                                    label="Bed"
                                    value={room.bed_configuration}
                                />
                            )}
                        </div>

                        {/* Check-in/out */}
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Check-in {checkIn} → Check-out {checkOut}</span>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Amenities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {amenities.map((a) => (
                                    <span
                                        key={a}
                                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full"
                                    >
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                                setDetailsOpen(false);
                                onBook(room);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Book This Room
                        </motion.button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function SpecItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-center sm:text-left">
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{value}</div>
        </div>
    );
}