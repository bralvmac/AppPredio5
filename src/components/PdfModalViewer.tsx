import React, { useEffect } from 'react';
import { X, Download, ExternalLink, GraduationCap, User, UserCheck, BookOpen, Clock, FileText } from 'lucide-react';
import { Roteiro } from '../types/roteiro';

interface PdfModalViewerProps {
  roteiro: Roteiro | null;
  onClose: () => void;
}

export const PdfModalViewer: React.FC<PdfModalViewerProps> = ({ roteiro, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!roteiro) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      
      {/* Container Principal do Modal */}
      <div className="glass-panel w-full max-w-6xl h-[92vh] rounded-2xl flex flex-col border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {roteiro.curso}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                {roteiro.tipoCurso}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                {roteiro.modeloComponente}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate">
              {roteiro.titulo}
            </h2>
            <p className="text-xs text-slate-400 truncate">
              <span className="text-slate-300">Tema: </span>{roteiro.tema} | <span className="text-slate-300">Matéria: </span>{roteiro.disciplina}
            </p>
          </div>

          {/* Ações e Fechar */}
          <div className="flex items-center gap-2">
            
            <a
              href={roteiro.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="Abrir em Nova Aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Aba</span>
            </a>

            <a
              href={roteiro.pdfUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold transition-colors"
              title="Baixar PDF"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Baixar</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors ml-1"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* Informações Rápidas de Apoio */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
          <div><strong className="text-slate-400">Docente:</strong> {roteiro.docente}</div>
          <div><strong className="text-slate-400">Tutor:</strong> {roteiro.tutor}</div>
          <div><strong className="text-slate-400">Laboratório:</strong> {roteiro.laboratorioTipo || 'Geral'}</div>
          <div><strong className="text-slate-400">Duração:</strong> {roteiro.duracaoMinutos || 120} min</div>
        </div>

        {/* Leitor de PDF Embutido */}
        <div className="flex-1 bg-slate-900 relative">
          <iframe
            src={`${roteiro.pdfUrl}#toolbar=1&navpanes=0`}
            title={roteiro.titulo}
            className="w-full h-full border-none"
          />
        </div>

      </div>

    </div>
  );
};
