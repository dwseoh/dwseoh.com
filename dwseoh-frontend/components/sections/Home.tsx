'use client';

import { motion } from 'framer-motion';
import ProfileCard from '../ProfileCard';
import { Code, Palette, Sparkles } from 'lucide-react';

const features = [
    {
        icon: Code,
        title: 'Developer',
        description: 'Crafting clean, efficient, and scalable code',
    },
    {
        icon: Palette,
        title: 'Designer',
        description: 'Creating beautiful and intuitive interfaces',
    },
    {
        icon: Sparkles,
        title: 'Creator',
        description: 'Building experiences that delight users',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.6,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
};

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-32 pb-32">
            <div className="max-w-6xl w-full">
                <ProfileCard />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
                >
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                className="card p-8 text-center group hover:border-[var(--color-primary)] transition-colors"
                            >
                                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                                    <Icon size={24} className="text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
