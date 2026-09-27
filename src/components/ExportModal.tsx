import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAstrology } from '../context/AstrologyContext';

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
  const { profile, astrologyData, chatHistory } = useAstrology();
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
    setIsExporting(true);
    setSuccessMessage(null);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Background styling
      doc.setFillColor(3, 7, 18);
      doc.rect(0, 0, 210, 297, 'F');

      // Title & Header
      doc.setFont('times', 'bold');
      doc.setTextColor(251, 191, 36); // Amber Gold
      doc.setFontSize(22);
      doc.text('ASTRO ORACLE', 105, 20, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // Slate
      doc.setFontSize(9);
      doc.text('SWISSEPH PRECISION • VEDIC LAHIRI & WESTERN TROPICAL HYBRID', 105, 26, { align: 'center' });

      // Profile details
      doc.setDrawColor(51, 65, 85);
      doc.line(20, 30, 190, 30);

      doc.setFontSize(12);
      doc.setTextColor(248, 250, 252);
      doc.text(`Consultation Report: ${profile.name}`, 20, 38);

      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text(`Birth Date: ${profile.birthDate}  |  Birth Time: ${profile.birthTime}`, 20, 44);
      doc.text(`Coordinates: ${profile.birthCoordinates.latitude.toFixed(2)}°N, ${profile.birthCoordinates.longitude.toFixed(2)}°E (${profile.currentCity})`, 20, 49);

      // Celestial Placements Table Header
      if (astrologyData?.siderealChart) {
        const sc = astrologyData.siderealChart;
        doc.setFillColor(15, 23, 42);
        doc.rect(20, 55, 170, 8, 'F');
        doc.setTextColor(251, 191, 36);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('SIDEREAL LAHIRI NAVAGRAHA PLACEMENTS', 24, 60.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(226, 232, 240);
        let startY = 68;

        doc.text(`Lagna (Ascendant): ${sc.lagna.formattedDegree} (${sc.lagna.nakshatra} P${sc.lagna.pada})`, 22, startY);
        startY += 6;

        sc.planets.slice(0, 9).forEach((p, idx) => {
          const colX = idx < 5 ? 22 : 110;
          const rowY = startY + (idx < 5 ? idx : idx - 5) * 5.5;
          doc.text(`${p.name.padEnd(8)}: ${p.sign.padEnd(11)} ${p.formattedDegree} (H${p.house}) ${p.isRetrograde ? '[R]' : ''}`, colX, rowY);
        });

        startY += 32;

        // Active Dasha
        if (sc.dashaReport?.currentMahadasha) {
          const md = sc.dashaReport.currentMahadasha;
          doc.setFillColor(30, 27, 75);
          doc.rect(20, startY, 170, 10, 'F');
          doc.setTextColor(216, 180, 254);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`Active Vimshottari Period: ${md.lord} Mahadasha (${md.startDate} to ${md.endDate})`, 24, startY + 6.5);
          startY += 16;
        }

        // Recent Oracle Reading snippet
        if (chatHistory.length > 0) {
          doc.setFillColor(15, 23, 42);
          doc.rect(20, startY, 170, 8, 'F');
          doc.setTextColor(56, 189, 248); // Cyan
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('ORACLE CONSULTATION RECORD', 24, startY + 5.5);
          startY += 13;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(203, 213, 225);

          const lastAssistMsg = [...chatHistory].reverse().find(m => m.sender === 'assistant');
          if (lastAssistMsg) {
            const cleanText = lastAssistMsg.text.replace(/[#*`_]/g, '');
            const lines = doc.splitTextToSize(cleanText, 170);
            const printableLines = lines.slice(0, 28);
            doc.text(printableLines, 20, startY);
          }
        }
      }

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Astro Oracle Workstation • Generated locally via Client-Side WebAssembly', 105, 288, { align: 'center' });

      doc.save(`AstroOracle_${profile.name.replace(/\s+/g, '_')}_Report.pdf`);
      setSuccessMessage('Comprehensive astrological PDF generated and saved!');
      setTimeout(() => setSuccessMessage(null), 3000);
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
          className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 p-5 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Chart & Reading</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300">
            Export <strong className="text-purple-300">{profile.name}</strong>'s Swiss Ephemeris chart diagram, active Vimshottari Dasha, and consultation insights.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center gap-2 text-center transition group shadow-sm disabled:opacity-50"
            >
              <FileText className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white">Full PDF Report</span>
              <span className="text-[10px] text-slate-400">Charts, Dashas & AI reading</span>
            </button>

            <button
              type="button"
              onClick={handleExportPNG}
              disabled={isExporting}
              className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 flex flex-col items-center gap-2 text-center transition group shadow-sm disabled:opacity-50"
            >
              <ImageIcon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white">High-Res PNG</span>
              <span className="text-[10px] text-slate-400">Pure visual Kundali graphic</span>
            </button>
          </div>

          {isExporting && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-amber-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Rendering high-resolution document...</span>
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
