'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Heart } from 'lucide-react';

// Dummy data - will be replaced with backend API
const memories = [
    {
        id: 1,
        title: 'Summer Adventure 2025',
        location: 'San Francisco, CA',
        date: '2025-07-15',
        image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
        likes: 67,
    },
    {
        id: 2,
        title: 'Coffee & Code',
        location: 'Local Cafe',
        date: '2025-09-20',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
        likes: 45,
    },
    {
        id: 3,
        title: 'Mountain Hiking',
        location: 'Yosemite National Park',
        date: '2025-10-10',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        likes: 89,
    },
    {
        id: 4,
        title: 'City Lights',
        location: 'New York, NY',
        date: '2025-11-05',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
        likes: 52,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
};

export default function Memories() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-32 pb-32">
            <div className="max-w-5xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Memories</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Moments worth remembering
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {memories.map((memory) => (
                        <motion.div
                            key={memory.id}
                            variants={itemVariants}
                            className="card overflow-hidden group cursor-pointer"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={memory.image}
                                    alt={memory.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} strokeWidth={2} />
                                            <span>{memory.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} strokeWidth={2} />
                                            <span>{new Date(memory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 flex items-center justify-between bg-white dark:bg-gray-800">
                                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                                    <Heart size={18} strokeWidth={2} className="text-[var(--color-primary)]" />
                                    <span className="font-medium text-sm">{memory.likes}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
