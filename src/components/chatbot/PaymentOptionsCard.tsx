'use client';

import { motion } from 'framer-motion';
import { CreditCard, Building2, Wallet, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface PaymentOptionsCardProps {
    totalAmount: number;
    onPaymentSelect?: (method: 'now' | 'later', paymentType?: string) => void;
}

export function PaymentOptionsCard({ totalAmount, onPaymentSelect }: PaymentOptionsCardProps) {
    const [selectedMethod, setSelectedMethod] = useState<'now' | 'later' | null>(null);
    const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);

    const handlePayNow = (type: string) => {
        setSelectedMethod('now');
        setSelectedPaymentType(type);
        onPaymentSelect?.('now', type);
    };

    const handlePayLater = () => {
        setSelectedMethod('later');
        setSelectedPaymentType(null);
        onPaymentSelect?.('later');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 shadow-xl border-2 border-purple-200 dark:border-gray-600"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        Payment Options
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose how you'd like to pay</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Amount</div>
                    <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {formatCurrency(totalAmount)}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {/* Pay Now Section */}
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">Pay Now</span>
                        <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                            Instant Confirmation
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {/* Bank Transfer */}
                        <PaymentMethodButton
                            icon={<Building2 className="w-5 h-5" />}
                            title="Bank Transfer"
                            subtitle="BCA 7125348238 - Dava Romero"
                            selected={selectedMethod === 'now' && selectedPaymentType === 'bank'}
                            onClick={() => handlePayNow('bank')}
                            color="blue"
                        />

                        {/* Credit Card */}
                        <PaymentMethodButton
                            icon={<CreditCard className="w-5 h-5" />}
                            title="Credit Card"
                            subtitle="Visa, Mastercard, Amex"
                            selected={selectedMethod === 'now' && selectedPaymentType === 'card'}
                            onClick={() => handlePayNow('card')}
                            color="purple"
                        />

                        {/* E-Wallet */}
                        <PaymentMethodButton
                            icon={<Wallet className="w-5 h-5" />}
                            title="E-Wallet"
                            subtitle="GoPay, OVO, DANA, ShopeePay"
                            selected={selectedMethod === 'now' && selectedPaymentType === 'ewallet'}
                            onClick={() => handlePayNow('ewallet')}
                            color="green"
                        />
                    </div>
                </div>

                {/* Pay Later Section */}
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">Pay Later</span>
                        <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
                            Requires Confirmation
                        </span>
                    </div>

                    <PaymentMethodButton
                        icon={<Building2 className="w-5 h-5" />}
                        title="Pay at Check-in"
                        subtitle="Contact front office to confirm"
                        selected={selectedMethod === 'later'}
                        onClick={handlePayLater}
                        color="orange"
                        fullWidth
                    />

                    {selectedMethod === 'later' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700"
                        >
                            <p className="text-xs text-orange-800 dark:text-orange-300">
                                ⚠️ Your reservation will be <strong>pending</strong> until confirmed by our front office.
                                You'll need to contact us or visit the hotel to complete the payment.
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Selected Summary */}
                {selectedMethod === 'now' && selectedPaymentType && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-white"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">Ready to Confirm Payment</span>
                        </div>
                        <div className="text-sm opacity-90">
                            Please complete your payment via{' '}
                            <strong>
                                {selectedPaymentType === 'bank' && 'Bank Transfer'}
                                {selectedPaymentType === 'card' && 'Credit Card'}
                                {selectedPaymentType === 'ewallet' && 'E-Wallet'}
                            </strong>
                            , then let me know once it's done!
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

interface PaymentMethodButtonProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    selected: boolean;
    onClick: () => void;
    color: 'blue' | 'purple' | 'green' | 'orange';
    fullWidth?: boolean;
}

function PaymentMethodButton({
    icon,
    title,
    subtitle,
    selected,
    onClick,
    color,
    fullWidth = false
}: PaymentMethodButtonProps) {
    const colorClasses = {
        blue: {
            border: 'border-blue-500 dark:border-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-300',
            icon: 'text-blue-600 dark:text-blue-400',
        },
        purple: {
            border: 'border-purple-500 dark:border-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/30',
            text: 'text-purple-700 dark:text-purple-300',
            icon: 'text-purple-600 dark:text-purple-400',
        },
        green: {
            border: 'border-green-500 dark:border-green-400',
            bg: 'bg-green-50 dark:bg-green-900/30',
            text: 'text-green-700 dark:text-green-300',
            icon: 'text-green-600 dark:text-green-400',
        },
        orange: {
            border: 'border-orange-500 dark:border-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/30',
            text: 'text-orange-700 dark:text-orange-300',
            icon: 'text-orange-600 dark:text-orange-400',
        },
    };

    const colors = colorClasses[color];

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
        ${fullWidth ? 'w-full' : ''}
        flex items-center gap-3 p-3 rounded-lg border-2 transition-all
        ${selected
                    ? `${colors.border} ${colors.bg}`
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700/50'
                }
      `}
        >
            <div className={selected ? colors.icon : 'text-gray-500 dark:text-gray-400'}>
                {icon}
            </div>
            <div className="flex-1 text-left">
                <div className={`text-sm font-semibold ${selected ? colors.text : 'text-gray-900 dark:text-white'}`}>
                    {title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
            </div>
            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-6 h-6 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}
                >
                    <CheckCircle className={`w-4 h-4 ${colors.icon}`} />
                </motion.div>
            )}
        </motion.button>
    );
}
