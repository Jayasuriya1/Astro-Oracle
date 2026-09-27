import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AstrologyProvider, useAstrology } from './context/AstrologyContext';
import { Navbar } from './components/Navbar';
import { OracleChat } from './components/OracleChat';
import { ChartViewer } from './components/ChartViewer';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { BackgroundStars } from './components/BackgroundStars';

const MainContent: React.FC = () => {
  const { activeView, isExportOpen, setIsExportOpen } = useAstrology();

  return (
    <div className="relative z-10 flex flex-col h-full min-h-[100svh] min-h-[100dvh] overflow-hidden">
      <Navbar />

      <main className="flex-1 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full overflow-hidden"
            >
              <OracleChat />
            </motion.div>
          )}

          {activeView === 'charts' && (
            <motion.div
              key="charts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full overflow-y-auto no-scrollbar"
            >
              <ChartViewer defaultSubTab="vedic" />
            </motion.div>
          )}

          {activeView === 'transits' && (
            <motion.div
              key="transits"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full overflow-y-auto no-scrollbar"
            >
              <ChartViewer defaultSubTab="transits" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SettingsModal />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AstrologyProvider>
      <div className="h-full min-h-[100svh] min-h-[100dvh] bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col selection:bg-purple-600 selection:text-white">
        {/* Subtle radial ambient cosmic glow */}
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="fixed top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none" />

        {/* Dynamic canvas stars */}
        <BackgroundStars />

        {/* Main application tree */}
        <MainContent />
      </div>
    </AstrologyProvider>
  );
}

export default App;
