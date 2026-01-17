'use client';

import { motion } from 'framer-motion';
import { Home, BookOpen, FolderGit2, Camera, Heart, FileText } from 'lucide-react';

export type TabType = 'home' | 'blog' | 'projects' | 'memories' | 'hobbies' | 'resume';

interface NavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'blog' as TabType, label: 'Blog', icon: BookOpen },
    { id: 'projects' as TabType, label: 'Projects', icon: FolderGit2 },
    { id: 'memories' as TabType, label: 'Memories', icon: Camera },
    { id: 'hobbies' as TabType, label: 'Hobbies', icon: Heart },
    { id: 'resume' as TabType, label: 'Resume', icon: FileText },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
    return (
        <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
            <div className="glass-effect rounded-full px-2 py-2">
                <div className="flex gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className="relative px-4 py-2.5 rounded-full transition-all duration-200 group"
                                aria-label={tab.label}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full shadow-md"
                                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                    />
                                )}

                                <div className="relative flex items-center gap-2">
                                    <Icon
                                        size={18}
                                        strokeWidth={2}
                                        className={`transition-colors ${isActive
                                            ? 'text-white'
                                            : 'text-gray-600 dark:text-gray-400 group-hover:text-[var(--color-primary)]'
                                            }`}
                                    />
                                    <span
                                        className={`text-sm font-medium transition-all whitespace-nowrap ${isActive
                                            ? 'text-white opacity-100 w-auto'
                                            : 'text-gray-600 dark:text-gray-400 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-1'
                                            }`}
                                    >
                                        {tab.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
