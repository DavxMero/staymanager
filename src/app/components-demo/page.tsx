'use client';

import { useState } from 'react';
import { MarkdownMessage } from '@/components/chatbot/MarkdownMessage';
import { InteractiveBookingCard } from '@/components/chatbot/InteractiveBookingCard';
import { DateSelectionCard } from '@/components/chatbot/DateSelectionCard';
import { PaymentOptionsCard } from '@/components/chatbot/PaymentOptionsCard';
import { BookingProgressTracker } from '@/components/chatbot/BookingProgressTracker';
import { motion } from 'framer-motion';

export default function ComponentsDemoPage() {
    const [bookingStep, setBookingStep] = useState<'info' | 'dates' | 'room' | 'payment' | 'confirmed'>('info');
    const [completedSteps, setCompletedSteps] = useState<('info' | 'dates' | 'room' | 'payment')[]>([]);

    const sampleMarkdown = `
# Welcome to StayManager

I'd be happy to help you with your booking! Here's what we offer:

## Room Types

We have **three main room categories**:

1. **Standard Rooms** - Perfect for solo travelers or couples
   - Starting from Rp 200,000/night
   - Queen-sized bed
   - Free Wi-Fi
   - *Includes breakfast*

2. **Deluxe Rooms** - Extra space and comfort
   - Starting from Rp 250,000/night  
   - King-sized bed
   - City view
   - Premium amenities

3. **Suite Rooms** - Ultimate luxury
   - Starting from Rp 500,000/night
   - Separate living area
   - Premium bathroom
   - 24/7 room service

> All rates include breakfast and standard amenities. Prices may vary based on dates, availability, and ongoing promotions.

**Ready to book?** Just let me know your preferred dates! 🏨
  `;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Chatbot Interactive Components Demo
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Preview of all new interactive components for the booking flow
                    </p>
                </div>

                {/* Progress Tracker Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Booking Progress Tracker</h2>
                    <BookingProgressTracker currentStep={bookingStep} completedSteps={completedSteps} />

                    <div className="flex gap-2 flex-wrap">
                        {(['info', 'dates', 'room', 'payment', 'confirmed'] as const).map((step) => (
                            <button
                                key={step}
                                onClick={() => {
                                    setBookingStep(step);
                                    if (step !== 'info' && step !== 'confirmed') {
                                        const steps: ('info' | 'dates' | 'room' | 'payment')[] = [];
                                        if (step === 'dates') steps.push('info');
                                        if (step === 'room') steps.push('info', 'dates');
                                        if (step === 'payment') steps.push('info', 'dates', 'room');
                                        setCompletedSteps(steps);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Set to: {step}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Markdown Message Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Markdown Message Renderer</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <MarkdownMessage content={sampleMarkdown} />
                    </div>
                </section>

                {/* Interactive Booking Card Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Interactive Booking Card</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InteractiveBookingCard
                            bookingInfo={{
                                guestName: 'John Doe',
                                guestEmail: 'john@example.com',
                                guestPhone: '+62 812-3456-7890',
                                checkIn: '2025-12-10',
                                checkOut: '2025-12-12',
                                adults: 2,
                                children: 1,
                            }}
                            stage="info"
                            onUpdate={(info) => console.log('Updated:', info)}
                        />
                        <InteractiveBookingCard
                            bookingInfo={{
                                guestName: 'Jane Smith',
                                guestEmail: 'jane@example.com',
                                guestPhone: '+62 821-9876-5432',
                                checkIn: '2025-12-15',
                                checkOut: '2025-12-18',
                                adults: 1,
                                children: 0,
                            }}
                            stage="confirm"
                        />
                    </div>
                </section>

                {/* Date Selection Card Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Date Selection Card</h2>
                    <div className="max-w-md">
                        <DateSelectionCard
                            checkIn="2025-12-10"
                            checkOut="2025-12-12"
                            adults={2}
                            children={1}
                            onUpdate={(data) => console.log('Date/Guest updated:', data)}
                        />
                    </div>
                </section>

                {/* Payment Options Card Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Payment Options Card</h2>
                    <div className="max-w-lg">
                        <PaymentOptionsCard
                            totalAmount={750000}
                            onPaymentSelect={(method, type) => {
                                console.log(`Payment selected: ${method} - ${type}`);
                                alert(`Payment selected: ${method}${type ? ` - ${type}` : ''}`);
                            }}
                        />
                    </div>
                </section>

                {/* Feature List */}
                <section className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-6">✨ Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FeatureItem
                            icon="📝"
                            title="Markdown Support"
                            description="Full markdown rendering with bold, italic, lists, code blocks, and more"
                        />
                        <FeatureItem
                            icon="⚡"
                            title="Smooth Streaming"
                            description="Text streams in with typing animation at 3ms per character"
                        />
                        <FeatureItem
                            icon="🎨"
                            title="Modern Typography"
                            description="Inter font for excellent readability and professional look"
                        />
                        <FeatureItem
                            icon="🌙"
                            title="Dark Mode"
                            description="All components support light and dark themes seamlessly"
                        />
                        <FeatureItem
                            icon="📱"
                            title="Responsive Design"
                            description="Optimized for mobile, tablet, and desktop experiences"
                        />
                        <FeatureItem
                            icon="🎭"
                            title="Smooth Animations"
                            description="Framer Motion powered animations for delightful interactions"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

interface FeatureItemProps {
    icon: string;
    title: string;
    description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
        >
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-white/80">{description}</p>
        </motion.div>
    );
}
