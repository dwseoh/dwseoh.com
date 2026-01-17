'use client';

import { motion } from 'framer-motion';
import { Music, Camera, Book, Gamepad2, Plane, Coffee } from 'lucide-react';

// Dummy data
const hobbies = [
    {
        id: 1,
        title: 'Music',
        description: 'Playing guitar and discovering new artists',
        icon: Music,
    },
    {
        id: 2,
        title: 'Photography',
        description: 'Capturing moments and beautiful landscapes',
        icon: Camera,
    },
    {
        id: 3,
        title: 'Reading',
        description: 'Getting lost in fiction and learning from non-fiction',
        icon: Book,
    },
    {
        id: 4,
        title: 'Gaming',
        description: 'Exploring virtual worlds and strategic challenges',
        icon: Gamepad2,
    },
    {
        id: 5,
        title: 'Travel',
        description: 'Exploring new places and cultures',
        icon: Plane,
    },
    {
        id: 6,
        title: 'Coffee',
        description: 'Brewing the perfect cup and trying new roasts',
        icon: Coffee,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
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

export default function Hobbies() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-32 pb-32">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Hobbies</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Things I love doing in my free time
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {hobbies.map((hobby) => {
                        const Icon = hobby.icon;
                        return (
                            <motion.div
                                key={hobby.id}
                                variants={itemVariants}
                                className="card p-8 text-center group hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                            >
                                <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                                    <Icon size={28} className="text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                    {hobby.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {hobby.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
