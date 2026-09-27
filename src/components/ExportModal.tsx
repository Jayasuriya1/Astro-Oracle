import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Image as ImageIcon, Loader2, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAstrology } from '../context/AstrologyContext';
import { generateAstrologyReportPdf } from '../services/pdfReportService';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetElementId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  targetElementId = 'astrology-studio-content'
}) => {
  const { profile, astrologyData, chatHistory, language } = useAstrology();
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportPNG = async () => {
    setIsExporting(true);
    setSuccessMessage(null);
    try {
      const element = document.getElementById(targetElementId) || document.body;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#030712',
        useCORS: true
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `AstroOracle_${profile.name.replace(/\s+/g, '_')}_Chart.png`;
      link.href = dataUrl;
      link.click();

      setSuccessMessage('High-resolution chart image downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Image export failed:', err);
      alert('Failed to export image: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!astrologyData) {
      alert('Astrology calculations are still loading. Please wait a moment.');
      return;
    }

    setIsExporting(true);
    setSuccessMessage(null);
    try {
      const doc = await generateAstrologyReportPdf(profile, astrologyData, chatHistory, language);
      const fileName = `AstroOracle_${profile.name.replace(/\s+/g, '_')}_Executive_Dossier.pdf`;
      doc.save(fileName);

      setSuccessMessage('Executive 4-page Light-Theme Dossier generated and downloaded!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 p-5 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Executive Astrology Report</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            Generate an executive-grade, publication-quality celestial dossier for{' '}
            <strong className="text-amber-300 font-semibold">{profile.name}</strong>.
          </p>

          {/* Executive Feature Highlights */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive 4-Page Dossier Highlights (Print-Ready Light Theme):</span>
            </div>
            <ul className="grid grid-cols-2 gap-1.5 pl-1 text-[10px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span>Visual South Indian Kundali</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-sky-400" />
                <span>Natal Panchangam (5 Cosmic Limbs)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-purple-400" />
                <span>Navagraha Table & Dignities</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span>Navamsha (D9) & Vargottama</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-400" />
                <span>Western Placidus & Aspects</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-yellow-400" />
                <span>120-Year Vimshottari Dasha</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
                <span>Current Planetary Transits</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span>Classical 3-Tier Remedies</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="p-4 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40 hover:border-amber-400 flex flex-col items-center gap-2 text-center transition group shadow-md disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-200">Executive PDF Dossier</span>
              <span className="text-[10px] text-amber-400/80 font-medium">
                4-Page Light Theme Report
              </span>
            </button>

            <button
              type="button"
              onClick={handleExportPNG}
              disabled={isExporting}
              className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 flex flex-col items-center gap-2 text-center transition group shadow-sm disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">Full Screen PNG</span>
              <span className="text-[10px] text-slate-400">Current View Snapshot</span>
            </button>
          </div>

          {isExporting && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-amber-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Rendering high-resolution executive document...</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

