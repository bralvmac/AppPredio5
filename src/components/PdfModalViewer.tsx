import React, { useState } from 'react';
import { X, Download, Share2, ExternalLink, Check, FileText, GraduationCap, Building2, Layers, BookOpen, User, Loader2, MessageCircle, FlaskConical } from 'lucide-react';
import { Roteiro } from '../types/roteiro';
import { baixarPdfRoteiro, compartilharNoWhatsApp } from '../lib/downloadHelper';

interface PdfModalViewerProps {
  roteiro: Roteiro | null;
  onClose: () => void;
  onOpenReagentes?: (roteiro: Roteiro) => void;
}

export const PdfModalViewer: React.FC<PdfModalViewerProps> = ({ roteiro, onClose, onOpenReagentes }) => {
  const [copiado, setCopiado] = useState(false);
  const [baixando, setBaixando] = useState(false);

  if (!roteiro) return null;

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(roteiro.pdfUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleBaixarPdf = async () => {
    try {
      setBaixando(true);
      await baixarPdfRoteiro(roteiro.pdfUrl, roteiro.titulo);
    } finally {
      setBaixando(false);
    }
  };

  const handleCompartilharWhatsApp = () => {
    compartilharNoWhatsApp(roteiro);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      {/* Container Principal do Modal */}
      <div className="glass-panel w-full max-w-6xl h-[92vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden shadow-2xl">
        
        {/* Cabeçalho Superior do Modal */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {roteiro.titulo}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                Tema: <span className="text-amber-800 dark:text-slate-200 font-bold">{roteiro.tema}</span>
              </p>
            </div>
          </div>

          {/* Ações do Cabeçalho */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Botão Reagentes */}
            {onOpenReagentes && (
              <button
                onClick={() => onOpenReagentes(roteiro)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all"
                title="Analisar e Listar Reagentes da Aula Prática"
              >
                <FlaskConical className="w-4 h-4" />
                <span className="hidden md:inline">Reagentes</span>
              </button>
            )}

            {/* Botão Compartilhar WhatsApp */}
            <button
              onClick={handleCompartilharWhatsApp}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all"
              title="Compartilhar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* Botão Baixar PDF */}
            <button
              onClick={handleBaixarPdf}
              disabled={baixando}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-teal-400 hover:from-brand-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
              title="Baixar PDF do Roteiro"
            >
              {baixando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 stroke-[2.5]" />
              )}
              <span className="hidden sm:inline">Baixar PDF</span>
            </button>

            {/* Copiar Link */}
            <button
              onClick={handleCopiarLink}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Copiar Link"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Abrir em Nova Aba */}
            <a
              href={roteiro.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors hidden sm:flex"
              title="Abrir em Nova Aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fechar Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Faixa de Metadados Resumida */}
        <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Curso: <strong className="text-slate-900 dark:text-slate-200 font-bold">{roteiro.curso}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Unidade Curricular: <strong className="text-emerald-800 dark:text-slate-200 font-bold">{roteiro.disciplina}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Docente/Tutor: <strong className="text-slate-900 dark:text-slate-200 font-bold">{roteiro.docente}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tipo: <strong className="text-slate-900 dark:text-slate-200 font-bold">{roteiro.tipoCurso}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Modelo: <strong className="text-slate-900 dark:text-slate-200 font-bold">{roteiro.modeloComponente}</strong></span>
          </div>
        </div>

        {/* Visualizador de PDF */}
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
