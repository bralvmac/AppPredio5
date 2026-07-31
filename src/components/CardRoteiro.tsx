import React, { useState } from 'react';
import { Eye, Download, FileText, GraduationCap, User, Building2, Share2, Check, Trash2, AlertTriangle } from 'lucide-react';
import { Roteiro } from '../types/roteiro';

interface CardRoteiroProps {
  roteiro: Roteiro;
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
}

export const CardRoteiro: React.FC<CardRoteiroProps> = ({ roteiro, onOpenPdf, onDeletar }) => {
  const [copiado, setCopiado] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const handleCopiarLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roteiro.pdfUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
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
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 flex flex-col justify-between group transition-all duration-300 relative border border-slate-800/80">
      
      <div>
        {/* Linha Superior: Badges + Botão Excluir */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Badge Curso */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-3.5 h-3.5 mr-1" />
              {roteiro.curso}
            </span>

            {/* Badge Tipo de Curso (Presencial x Semi-presencial) */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
              isPresencial
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              <Building2 className="w-3 h-3 mr-1" />
              {roteiro.tipoCurso}
            </span>

            {/* Badge Modelo Componente (Básico x Específico) */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
              isBasico
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {roteiro.modeloComponente}
            </span>
          </div>

          {/* Botão de Lixeira para Excluir */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmandoExclusao(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-75 group-hover:opacity-100"
            title="Excluir este roteiro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Título do Roteiro (Nome do Arquivo) */}
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2 leading-snug">
          {roteiro.titulo}
        </h3>

        {/* Tema da Aula Prática */}
        <p className="text-xs font-medium text-slate-400 mb-4 line-clamp-2">
          <span className="text-slate-300 font-semibold">Tema: </span>
          {roteiro.tema}
        </p>

        {/* Detalhes de Unidade Curricular e Docente/Tutor */}
        <div className="space-y-2 py-3 border-t border-b border-slate-800/60 text-xs mb-4">
          
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Unidade Curricular:
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[55%]">{roteiro.disciplina}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Docente / Tutor:
            </span>
            <span className="font-medium text-slate-200 truncate max-w-[55%]">{roteiro.docente}</span>
          </div>

        </div>
      </div>

      {/* Botões de Ação na Parte Inferior */}
      <div className="flex items-center gap-2 pt-2">
        
        {/* Botão Principal: Visualizar Roteiro */}
        <button
          onClick={() => onOpenPdf(roteiro)}
          className="flex-1 inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md shadow-emerald-500/10 transition-all duration-200 transform group-hover:scale-[1.02]"
        >
          <Eye className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          <span>Visualizar Roteiro</span>
        </button>

        {/* Botão Baixar Direct */}
        <a
          href={roteiro.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Baixar PDF"
        >
          <Download className="w-4 h-4" />
        </a>

        {/* Botão Copiar Link */}
        <button
          onClick={handleCopiarLink}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Copiar link do PDF"
        >
          {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>

      </div>

      {/* Modal / Popover de Confirmação de Exclusão */}
      {confirmandoExclusao && (
        <div 
          className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-center items-center text-center animate-fade-in border border-rose-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Excluir este roteiro?</h4>
          <p className="text-xs text-slate-400 mb-4 px-2 line-clamp-2">
            "{roteiro.titulo}"
          </p>

          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => setConfirmandoExclusao(false)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarExclusao}
              disabled={excluindo}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {excluindo ? 'Excluindo...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
