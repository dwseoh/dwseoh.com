'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github, Star, Eye } from 'lucide-react';

// Dummy data - will be replaced with backend API
const projects = [
    {
        id: 1,
        title: 'Portfolio Website',
        description: 'A beautiful, minimalistic portfolio built with Next.js, TypeScript, and Framer Motion for smooth animations.',
        tags: ['Next.js', 'TypeScript', 'Framer Motion'],
        github: 'https://github.com/yourusername/portfolio',
        demo: 'https://yourportfolio.com',
        stars: 124,
        views: 1520,
    },
    {
        id: 2,
        title: 'Task Manager App',
        description: 'A productivity application with a clean interface, real-time updates, and smooth animations.',
        tags: ['React', 'Tailwind', 'Firebase'],
        github: 'https://github.com/yourusername/task-manager',
        demo: 'https://taskmanager.com',
        stars: 89,
        views: 980,
    },
    {
        id: 3,
        title: 'Weather Dashboard',
        description: 'Real-time weather data visualization with beautiful charts and location-based forecasts.',
        tags: ['Vue.js', 'Chart.js', 'API'],
        github: 'https://github.com/yourusername/weather',
        demo: 'https://weather.com',
        stars: 156,
        views: 2100,
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

export default function Projects() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-32 pb-32">
            <div className="max-w-5xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Projects</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Things I've built and shipped
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            variants={itemVariants}
                            className="card p-8 group hover:border-[var(--color-primary)] transition-colors"
                        >
                            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-[var(--color-primary)] transition-colors">
                                {project.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-5 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={16} strokeWidth={2} className="text-[var(--color-warning)]" />
                                        <span className="font-medium">{project.stars}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye size={16} strokeWidth={2} />
                                        <span className="font-medium">{project.views}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                        aria-label="View on GitHub"
                                    >
                                        <Github size={20} strokeWidth={2} />
                                    </a>
                                    <a
                                        href={project.demo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                        aria-label="View live demo"
                                    >
                                        <ExternalLink size={20} strokeWidth={2} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
