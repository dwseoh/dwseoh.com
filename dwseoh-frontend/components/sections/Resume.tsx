'use client';

import { motion } from 'framer-motion';
import { Download, Briefcase, GraduationCap, Award } from 'lucide-react';

// Dummy data
const experience = [
    {
        title: 'Senior Developer',
        company: 'Tech Company',
        period: '2024 - Present',
        description: 'Leading frontend development initiatives and mentoring junior developers on best practices and modern web technologies.',
    },
    {
        title: 'Full Stack Developer',
        company: 'Startup Inc',
        period: '2022 - 2024',
        description: 'Built scalable web applications using modern technologies. Collaborated with cross-functional teams to deliver high-quality products.',
    },
];

const education = [
    {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University Name',
        period: '2018 - 2022',
    },
];

const skills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
    'Python', 'Tailwind CSS', 'Git', 'AWS', 'Docker',
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
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
};

export default function Resume() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-32 pb-32">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Resume</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                        My professional journey
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-medium shadow-md hover:shadow-lg transition-shadow"
                    >
                        <Download size={18} strokeWidth={2} />
                        Download Resume
                    </motion.button>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-16"
                >
                    {/* Experience */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-md">
                                <Briefcase size={22} className="text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Experience</h3>
                        </div>

                        <div className="space-y-6">
                            {experience.map((exp, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="card p-8"
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{exp.title}</h4>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{exp.period}</span>
                                    </div>
                                    <p className="text-[var(--color-primary)] font-medium mb-4">{exp.company}</p>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{exp.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Education */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-secondary)] flex items-center justify-center shadow-md">
                                <GraduationCap size={22} className="text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Education</h3>
                        </div>

                        <div className="space-y-6">
                            {education.map((edu, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="card p-8"
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{edu.degree}</h4>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{edu.period}</span>
                                    </div>
                                    <p className="text-[var(--color-accent)] font-medium">{edu.school}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Skills */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-success)] to-[var(--color-accent)] flex items-center justify-center shadow-md">
                                <Award size={22} className="text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Skills</h3>
                        </div>

                        <div className="card p-8">
                            <div className="flex flex-wrap gap-3">
                                {skills.map((skill, index) => (
                                    <motion.span
                                        key={skill}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                                        className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-medium text-sm shadow-sm"
                                    >
                                        {skill}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
