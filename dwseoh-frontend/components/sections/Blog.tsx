'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Heart } from 'lucide-react';

// Dummy data - will be replaced with backend API
const blogPosts = [
    {
        id: 1,
        title: 'Building Beautiful Web Experiences',
        excerpt: 'Exploring the art of creating delightful user interfaces that users love. Learn about the principles of good design and how to apply them.',
        date: '2026-01-15',
        readTime: '5 min read',
        likes: 42,
    },
    {
        id: 2,
        title: 'The Power of Minimalism in Design',
        excerpt: 'Why less is often more when it comes to creating impactful designs. Discover how constraints can fuel creativity.',
        date: '2026-01-10',
        readTime: '4 min read',
        likes: 38,
    },
    {
        id: 3,
        title: 'My Journey into Web Development',
        excerpt: 'From curiosity to career - how I fell in love with coding and what I learned along the way.',
        date: '2026-01-05',
        readTime: '7 min read',
        likes: 56,
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
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
};

export default function Blog() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-32 pb-32">
            <div className="max-w-3xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Blog</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Thoughts, stories, and ideas
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {blogPosts.map((post) => (
                        <motion.article
                            key={post.id}
                            variants={itemVariants}
                            className="card p-8 cursor-pointer group hover:border-[var(--color-primary)] transition-colors"
                        >
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-[var(--color-primary)] transition-colors">
                                {post.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={16} strokeWidth={2} />
                                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} strokeWidth={2} />
                                    <span>{post.readTime}</span>
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto">
                                    <Heart size={16} strokeWidth={2} className="text-[var(--color-primary)]" />
                                    <span className="font-medium">{post.likes}</span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
