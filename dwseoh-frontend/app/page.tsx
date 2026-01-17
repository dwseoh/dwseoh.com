'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation, { TabType } from '@/components/Navigation';
import Footer from '@/components/Footer';
import Home from '@/components/sections/Home';
import Blog from '@/components/sections/Blog';
import Projects from '@/components/sections/Projects';
import Memories from '@/components/sections/Memories';
import Hobbies from '@/components/sections/Hobbies';
import Resume from '@/components/sections/Resume';

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const renderSection = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'blog':
        return <Blog />;
      case 'projects':
        return <Projects />;
      case 'memories':
        return <Memories />;
      case 'hobbies':
        return <Hobbies />;
      case 'resume':
        return <Resume />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="relative min-h-screen">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>

      <Footer />
    </div>
  );
}
