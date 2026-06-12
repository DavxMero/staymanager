'use client';

import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck, Save, Clock } from 'lucide-react';
import Link from 'next/link';

interface LoginPromptCardProps {
    reason?: string;
}

export function LoginPromptCard({ reason = 'make a reservation' }: LoginPromptCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
            <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                        Sign in to {reason}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        To continue, please log in or create an account. Once signed in, your details
                        are filled in automatically and reservations are saved to your history.
                    </p>
                </div>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Guest details auto-filled from your profile
                </li>
                <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Reservation history saved & accessible anytime
                </li>
            </ul>

            <div className="grid grid-cols-2 gap-2 mt-5">
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                    <LogIn className="w-4 h-4" />
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                </Link>
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                Sign up only needs an email &amp; password — no lengthy verification.
            </p>
        </motion.div>
    );
}
