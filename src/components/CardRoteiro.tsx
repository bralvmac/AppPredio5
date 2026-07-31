import React, { useState } from 'react';
import { Eye, Download, Share2, Trash2, Check, AlertTriangle, BookOpen, GraduationCap, User, Layers, Building2, Loader2, MessageCircle } from 'lucide-react';
import { Roteiro } from '../types/roteiro';
import { baixarPdfRoteiro, compartilharNoWhatsApp } from '../lib/downloadHelper';

interface CardRoteiroProps {
  roteiro: Roteiro;
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
}

export const CardRoteiro: React.FC<CardRoteiroProps> = ({
  roteiro,
  onOpenPdf,
  onDeletar
}) => {
  const [copiado, setCopiado] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const handleCopiarLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roteiro.pdfUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleBaixarPdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setBaixando(true);
      await baixarPdfRoteiro(roteiro.pdfUrl, roteiro.titulo);
    } finally {
      setBaixando(false);
    }
  };

  const handleCompartilharWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    compartilharNoWhatsApp(roteiro);
  };

  const handleConfirmarExclusao = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setExcluindo(true);
      await onDeletar(roteiro.id, roteiro.arquivoPath);
    } finally {
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
  };

  const isPresencial = roteiro.tipoCurso === 'Presencial';
  const isBasico = roteiro.modeloComponente === 'Básico';

  return (
    <div className="glass-panel-interactive rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative group hover:border-brand-500/40 transition-all duration-300 shadow-xl">
      
      {/* Topo do Card: Tags de Curso, Tipo e Modelo */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {roteiro.curso && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-3.5 h-3.5 mr-1" />
              {roteiro.curso}
            </span>
          )}

          {roteiro.tipoCurso && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              isPresencial
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              <Building2 className="w-3.5 h-3.5 mr-1" />
              {roteiro.tipoCurso}
            </span>
          )}

          {roteiro.modeloComponente && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              isBasico
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <Layers className="w-3.5 h-3.5 mr-1" />
              {roteiro.modeloComponente}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmandoExclusao(true);
            }}
            className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Excluir Roteiro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Título e Tema do Roteiro */}
        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 mb-1">
          {roteiro.titulo}
        </h3>
        
        <p className="text-xs text-slate-400 mb-4 line-clamp-2">
          <strong className="text-slate-300">Tema:</strong> {roteiro.tema}
        </p>

        {/* Informações detalhadas */}
        <div className="space-y-2 py-3 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              Unidade Curricular:
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[160px]" title={roteiro.disciplina}>
              {roteiro.disciplina}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-400" />
              Docente / Tutor:
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[160px]" title={roteiro.docente}>
              {roteiro.docente}
            </span>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onOpenPdf(roteiro)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-brand-500 to-teal-400 hover:from-brand-400 hover:to-teal-300 transition-all shadow-md shadow-brand-500/10 cursor-pointer"
        >
          <Eye className="w-4 h-4 stroke-[2.5]" />
          <span>Visualizar</span>
        </button>

        {/* WhatsApp Share */}
        <button
          onClick={handleCompartilharWhatsApp}
          className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors cursor-pointer"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        {/* Baixar PDF */}
        <button
          onClick={handleBaixarPdf}
          disabled={baixando}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          title="Baixar PDF"
        >
          {baixando ? <Loader2 className="w-4 h-4 animate-spin text-brand-400" /> : <Download className="w-4 h-4" />}
        </button>

        {/* Copiar Link */}
        <button
          onClick={handleCopiarLink}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copiar Link"
        >
          {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Overlay de Confirmação de Exclusão */}
      {confirmandoExclusao && (
        <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between animate-fade-in border border-rose-500/30">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Excluir este roteiro?</h4>
            <p className="text-xs text-slate-400">
              Esta ação excluirá permanentemente o roteiro "{roteiro.titulo}" do sistema e do banco de dados.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={() => setConfirmandoExclusao(false)}
              className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarExclusao}
              disabled={excluindo}
              className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
