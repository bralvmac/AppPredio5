import React from 'react';
import { Eye, Download, FileText, GraduationCap, User, UserCheck, Clock, Building2, ExternalLink, Share2, Check } from 'lucide-react';
import { Roteiro } from '../types/roteiro';

interface CardRoteiroProps {
  roteiro: Roteiro;
  onOpenPdf: (roteiro: Roteiro) => void;
}

export const CardRoteiro: React.FC<CardRoteiroProps> = ({ roteiro, onOpenPdf }) => {
  const [copiado, setCopiado] = React.useState(false);

  const handleCopiarLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roteiro.pdfUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const isPresencial = roteiro.tipoCurso === 'Presencial';
  const isBasico = roteiro.modeloComponente === 'Básico';

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 flex flex-col justify-between group transition-all duration-300 relative border border-slate-800/80">
      
      <div>
        {/* Badges de Categoria & Modalidade */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          
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

        {/* Título do Roteiro */}
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2 leading-snug">
          {roteiro.titulo}
        </h3>

        {/* Tema da Aula Prática */}
        <p className="text-xs font-medium text-slate-400 mb-4 line-clamp-2">
          <span className="text-slate-300 font-semibold">Tema: </span>
          {roteiro.tema}
        </p>

        {/* Detalhes de Disciplina, Docente e Tutor */}
        <div className="space-y-2 py-3 border-t border-b border-slate-800/60 text-xs mb-4">
          
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Disciplina:
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[60%]">{roteiro.disciplina}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Docente:
            </span>
            <span className="font-medium text-slate-200 truncate max-w-[60%]">{roteiro.docente}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              Tutor:
            </span>
            <span className="font-medium text-slate-200 truncate max-w-[60%]">{roteiro.tutor}</span>
          </div>

          {roteiro.duracaoMinutos && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Duração Estimada:
              </span>
              <span className="font-medium text-emerald-400">{roteiro.duracaoMinutos} min</span>
            </div>
          )}

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

    </div>
  );
};
