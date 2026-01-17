'use client';

import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

const socialLinks = [
    { icon: Github, href: 'https://github.com/yourusername', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/in/yourusername', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com/yourusername', label: 'Twitter' },
    { icon: Mail, href: 'mailto:your@email.com', label: 'Email' },
];

export default function Footer() {
    return (
        <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="glass-effect rounded-full px-6 py-3">
                <div className="flex items-center gap-6">
                    {socialLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                                className="text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-all duration-200 hover:scale-110"
                            >
                                <Icon size={20} strokeWidth={2} />
                            </a>
                        );
                    })}
                </div>
            </div>
        </footer>
    );
}
