'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Room {
    id: string;
    number: string;
    type: string;
    base_price: number;
}

interface BookingDetails {
    room: Room;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
}

interface BookingConfirmationProps {
    booking: BookingDetails;
    onConfirm: (guest: { guestName: string; guestEmail: string; guestPhone: string }) => void;
    onCancel: () => void;
}

export function BookingConfirmation({ booking, onConfirm, onCancel }: BookingConfirmationProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [guestName, setGuestName] = useState(booking.guestName);
    const [guestEmail, setGuestEmail] = useState(booking.guestEmail);
    // Telepon sengaja selalu kosong saat modal muncul — wajib diisi manual
    const [guestPhone, setGuestPhone] = useState('');

    const nameValid = guestName.trim().length >= 3;
    const emailValid = /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(guestEmail.trim());
    const phoneValid = guestPhone.replace(/\D/g, '').length >= 8;
    const formValid = nameValid && emailValid && phoneValid;

    // Error hanya ditampilkan untuk field yang sudah diisi tapi tidak valid —
    // field kosong tampil netral (Confirm tetap disabled lewat formValid)
    const showNameError = guestName !== '' && !nameValid;
    const showEmailError = guestEmail !== '' && !emailValid;
    const showPhoneError = guestPhone !== '' && !phoneValid;

    // booking.* berisi data akun login (prop terbaru, termasuk hasil
    // fetch tabel guests) — dipakai tombol "Samakan dengan data diri akun ini"
    const fillFromAccount = () => {
        setGuestName(booking.guestName);
        setGuestEmail(booking.guestEmail);
        setGuestPhone(booking.guestPhone);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleConfirm = async () => {
        if (!formValid) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        onConfirm({ guestName: guestName.trim(), guestEmail: guestEmail.trim(), guestPhone: guestPhone.trim() });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-blue-600 dark:bg-blue-700 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-3 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Confirm Booking</h2>
                                <p className="text-blue-100 text-sm">Review your reservation details</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        {/* Room Details */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Room Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{booking.room.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Room Number:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{booking.room.number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatPrice(booking.room.base_price)}/night</span>
                                </div>
                            </div>
                        </div>

                        {/* Stay Duration */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Stay Duration
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Check-in:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{booking.checkIn}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Check-out:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{booking.checkOut}</span>
                                </div>
                            </div>
                        </div>

                        {/* Guest Details */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Verifikasi Data Diri
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                Isi data tamu yang akan menginap. Reservasi bisa dibuat untuk orang lain.
                            </p>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <label htmlFor="bc-guest-name" className="block text-gray-600 dark:text-gray-400 mb-1">Nama Lengkap</label>
                                    <input
                                        id="bc-guest-name"
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${showNameError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                        placeholder="Nama sesuai identitas"
                                    />
                                    {showNameError && (
                                        <p className="mt-1 text-xs text-red-500">Nama minimal 3 karakter.</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="bc-guest-phone" className="block text-gray-600 dark:text-gray-400 mb-1">No. Telepon</label>
                                    <input
                                        id="bc-guest-phone"
                                        type="tel"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${showPhoneError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                        placeholder="+62 8xx xxxx xxxx"
                                    />
                                    {showPhoneError && (
                                        <p className="mt-1 text-xs text-red-500">Nomor telepon minimal 8 digit.</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="bc-guest-email" className="block text-gray-600 dark:text-gray-400 mb-1">Email</label>
                                    <input
                                        id="bc-guest-email"
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${showEmailError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                        placeholder="email@contoh.com"
                                    />
                                    {showEmailError && (
                                        <p className="mt-1 text-xs text-red-500">Format email tidak valid.</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={fillFromAccount}
                                    disabled={isSubmitting}
                                    className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-500/50 rounded-lg py-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                                >
                                    Samakan dengan data diri akun ini
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting || !formValid}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                'Confirm Booking'
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}