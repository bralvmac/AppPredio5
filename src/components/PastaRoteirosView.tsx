import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, FileText, Eye, Download, Share2, Trash2, Check, AlertTriangle, Building2 } from 'lucide-react';
import { Roteiro } from '../types/roteiro';

interface PastaRoteirosViewProps {
  roteiros: Roteiro[];
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
}

export const PastaRoteirosView: React.FC<PastaRoteirosViewProps> = ({
  roteiros,
  onOpenPdf,
  onDeletar
}) => {
  // Agrupa os roteiros por Curso e ordena Alfabeticamente por Título (A-Z)
  const roteirosPorCurso = React.useMemo(() => {
    const grupos: { [curso: string]: Roteiro[] } = {};
    
    roteiros.forEach(r => {
      const cursoNome = r.curso ? r.curso.trim() : 'Sem Curso Definido';
      if (!grupos[cursoNome]) {
        grupos[cursoNome] = [];
      }
      grupos[cursoNome].push(r);
    });

    // Ordenação Alfabética Natural por Título (Aula Prática 1, Aula Prática 2, Aula Prática 3...)
    Object.keys(grupos).forEach(curso => {
      grupos[curso].sort((a, b) => 
        a.titulo.localeCompare(b.titulo, 'pt-BR', { numeric: true, sensitivity: 'base' })
      );
    });

    return grupos;
  }, [roteiros]);

  // Estado das pastas abertas/fechadas (por padrão todas abertas)
  const [pastasAbertas, setPastasAbertas] = useState<{ [curso: string]: boolean }>({});

  const togglePasta = (curso: string) => {
    setPastasAbertas(prev => ({
      ...prev,
      [curso]: prev[curso] === undefined ? false : !prev[curso]
    }));
  };

  const expandirTodas = () => {
    const novoEstado: { [curso: string]: boolean } = {};
    Object.keys(roteirosPorCurso).forEach(c => { novoEstado[c] = true; });
    setPastasAbertas(novoEstado);
  };

  const recolherTodas = () => {
    const novoEstado: { [curso: string]: boolean } = {};
    Object.keys(roteirosPorCurso).forEach(c => { novoEstado[c] = false; });
    setPastasAbertas(novoEstado);
  };

  const cursos = Object.keys(roteirosPorCurso).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Barra de Controle de Pastas */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Folder className="w-4 h-4 text-amber-400" />
          Gerenciador de Pastas ({cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'})
        </span>
        <div className="flex items-center gap-3 font-medium">
          <button
            onClick={expandirTodas}
            className="hover:text-emerald-400 transition-colors"
          >
            + Expandir Todas
          </button>
          <span>|</span>
          <button
            onClick={recolherTodas}
            className="hover:text-slate-200 transition-colors"
          >
            - Recolher Todas
          </button>
        </div>
      </div>

      {/* Lista de Pastas por Curso */}
      <div className="space-y-3">
        {cursos.map((cursoNome) => {
          const listaRoteiros = roteirosPorCurso[cursoNome];
          const estaAberta = pastasAbertas[cursoNome] !== false;

          return (
            <div
              key={cursoNome}
              className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden transition-all duration-200 shadow-lg"
            >
              
              {/* Cabeçalho da Pasta (Clicável) */}
              <button
                onClick={() => togglePasta(cursoNome)}
                className="w-full px-5 py-4 bg-slate-900/90 hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    {estaAberta ? (
                      <FolderOpen className="w-5 h-5" />
                    ) : (
                      <Folder className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">
                      {cursoNome}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Pasta contendo {listaRoteiros.length} {listaRoteiros.length === 1 ? 'roteiro' : 'roteiros'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {listaRoteiros.length} {listaRoteiros.length === 1 ? 'arquivo' : 'arquivos'}
                  </span>
                  <div className="p-1 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white">
                    {estaAberta ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Conteúdo Interno da Pasta (Lista de Arquivos Ordenados A-Z) */}
              {estaAberta && (
                <div className="p-3 sm:p-4 bg-slate-950/60 border-t border-slate-800/80 space-y-2.5">
                  {listaRoteiros.map((roteiro) => (
                    <ItemRoteiroArquivoRow
                      key={roteiro.id}
                      roteiro={roteiro}
                      onOpenPdf={onOpenPdf}
                      onDeletar={onDeletar}
                    />
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

// Linha Estilo Arquivo do Windows Explorer com Badges Coloridas Vibrantes
const ItemRoteiroArquivoRow: React.FC<{
  roteiro: Roteiro;
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
}> = ({ roteiro, onOpenPdf, onDeletar }) => {
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
    <div className="glass-card-interactive rounded-xl p-3.5 sm:p-4 border border-slate-800/80 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative group">
      
      {/* Nome e Metadados do Arquivo */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
          <FileText className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
              {roteiro.titulo}
            </span>

            {/* Badge Tipo de Curso Colorida */}
            {roteiro.tipoCurso && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                isPresencial
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                <Building2 className="w-3 h-3 mr-1" />
                {roteiro.tipoCurso}
              </span>
            )}

            {/* Badge Modelo Componente Colorida */}
            {roteiro.modeloComponente && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                isBasico
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {roteiro.modeloComponente}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span><strong className="text-slate-300">Tema:</strong> {roteiro.tema}</span>
            <span>•</span>
            <span><strong className="text-slate-300">Unidade:</strong> {roteiro.disciplina}</span>
            {roteiro.docente && roteiro.docente !== 'Não informado' && (
              <>
                <span>•</span>
                <span><strong className="text-slate-300">Docente/Tutor:</strong> {roteiro.docente}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
        <button
          onClick={() => onOpenPdf(roteiro)}
          className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-colors shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
          <span>Visualizar</span>
        </button>

        <a
          href={roteiro.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Baixar PDF"
        >
          <Download className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={handleCopiarLink}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Copiar Link"
        >
          {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmandoExclusao(true);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Excluir Roteiro"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Confirmar Exclusão */}
      {confirmandoExclusao && (
        <div 
          className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md rounded-xl p-3 flex items-center justify-between gap-3 animate-fade-in border border-rose-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 text-xs text-rose-300 font-semibold truncate">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="truncate">Excluir "{roteiro.titulo}"?</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfirmandoExclusao(false)}
              className="py-1 px-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarExclusao}
              disabled={excluindo}
              className="py-1 px-2.5 rounded-lg bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
            >
              {excluindo ? '...' : 'Excluir'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
