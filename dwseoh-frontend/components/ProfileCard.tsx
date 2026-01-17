'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ProfileCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="text-center max-w-2xl mx-auto"
        >
            <motion.div
                className="relative w-32 h-32 mx-auto mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full blur-xl opacity-20" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg bg-white">
                    <Image
                        src="/profile-placeholder.png"
                        alt="Profile"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-3 gradient-text"
            >
                Your Name
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-xl text-gray-700 dark:text-gray-300 mb-4 font-medium"
            >
                Creative Developer & Designer
            </motion.p>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto"
            >
                Building beautiful experiences on the web with a focus on clean design,
                thoughtful interactions, and meaningful user experiences.
            </motion.p>
        </motion.div>
    );
}
