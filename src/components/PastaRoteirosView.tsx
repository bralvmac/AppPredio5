import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, FileText, Eye, Download, Share2, Trash2, Check, AlertTriangle, Building2, Laptop, Loader2, MessageCircle } from 'lucide-react';
import { Roteiro } from '../types/roteiro';
import { baixarPdfRoteiro, compartilharNoWhatsApp } from '../lib/downloadHelper';

interface PastaRoteirosViewProps {
  roteiros: Roteiro[];
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
}

interface EstruturaSubpastas {
  'Presencial': Roteiro[];
  'Semi-presencial': Roteiro[];
}

export const PastaRoteirosView: React.FC<PastaRoteirosViewProps> = ({
  roteiros,
  onOpenPdf,
  onDeletar
}) => {
  // Agrupa os roteiros por Curso e depois por Subpasta de Modalidade (Presencial / Semi-presencial)
  const hierarquiaCursos = React.useMemo(() => {
    const cursosMap: { [curso: string]: EstruturaSubpastas } = {};
    
    roteiros.forEach(r => {
      const cursoNome = r.curso ? r.curso.trim() : 'Sem Curso Definido';
      const tipoModalidade: 'Presencial' | 'Semi-presencial' = 
        r.tipoCurso === 'Semi-presencial' ? 'Semi-presencial' : 'Presencial';

      if (!cursosMap[cursoNome]) {
        cursosMap[cursoNome] = {
          'Presencial': [],
          'Semi-presencial': []
        };
      }

      cursosMap[cursoNome][tipoModalidade].push(r);
    });

    // Ordenação Alfabética Natural por Título (A-Z) para os roteiros de cada subpasta
    Object.keys(cursosMap).forEach(curso => {
      cursosMap[curso]['Presencial'].sort((a, b) => 
        a.titulo.localeCompare(b.titulo, 'pt-BR', { numeric: true, sensitivity: 'base' })
      );
      cursosMap[curso]['Semi-presencial'].sort((a, b) => 
        a.titulo.localeCompare(b.titulo, 'pt-BR', { numeric: true, sensitivity: 'base' })
      );
    });

    return cursosMap;
  }, [roteiros]);

  // Estado de Abertura das Pastas Principais (Cursos) e Subpastas - RECOLHIDAS POR PADRÃO
  const [pastasCursoAbertas, setPastasCursoAbertas] = useState<{ [curso: string]: boolean }>({});
  const [subpastasAbertas, setSubpastasAbertas] = useState<{ [key: string]: boolean }>({});

  const togglePastaCurso = (curso: string) => {
    setPastasCursoAbertas(prev => ({
      ...prev,
      [curso]: !prev[curso]
    }));
  };

  const toggleSubpasta = (chaveSubpasta: string) => {
    setSubpastasAbertas(prev => ({
      ...prev,
      [chaveSubpasta]: !prev[chaveSubpasta]
    }));
  };

  const expandirTodas = () => {
    const estadoCurso: { [curso: string]: boolean } = {};
    const estadoSub: { [key: string]: boolean } = {};
    
    Object.keys(hierarquiaCursos).forEach(c => {
      estadoCurso[c] = true;
      estadoSub[`${c}-Presencial`] = true;
      estadoSub[`${c}-Semi-presencial`] = true;
    });

    setPastasCursoAbertas(estadoCurso);
    setSubpastasAbertas(estadoSub);
  };

  const recolherTodas = () => {
    setPastasCursoAbertas({});
    setSubpastasAbertas({});
  };

  const listaCursos = Object.keys(hierarquiaCursos).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Barra de Controle do Gerenciador de Pastas */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Folder className="w-4 h-4 text-amber-400" />
          Árvore de Pastas & Subpastas ({listaCursos.length} {listaCursos.length === 1 ? 'curso' : 'cursos'})
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

      {/* Lista de Pastas Raiz (Cursos) - RECOLHIDAS POR PADRÃO */}
      <div className="space-y-3.5">
        {listaCursos.map((cursoNome) => {
          const subpastas = hierarquiaCursos[cursoNome];
          const totalPresencial = subpastas['Presencial'].length;
          const totalSemi = subpastas['Semi-presencial'].length;
          const totalGeral = totalPresencial + totalSemi;

          const cursoAberto = Boolean(pastasCursoAbertas[cursoNome]);

          return (
            <div
              key={cursoNome}
              className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden transition-all duration-200 shadow-xl"
            >
              
              {/* Pasta Principal do Curso (1º Nível) */}
              <button
                onClick={() => togglePastaCurso(cursoNome)}
                className="w-full px-5 py-4 bg-slate-900/90 hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                    {cursoAberto ? (
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
                      Curso com {totalGeral} {totalGeral === 1 ? 'roteiro cadastrado' : 'roteiros cadastrados'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {totalGeral} {totalGeral === 1 ? 'roteiro' : 'roteiros'}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white">
                    {cursoAberto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Subpastas de Modalidade (2º Nível: Presencial e Semi-presencial) */}
              {cursoAberto && (
                <div className="p-3 sm:p-4 bg-slate-950/70 border-t border-slate-800/80 space-y-3 pl-4 sm:pl-8">
                  
                  {/* Subpasta 1: Presencial */}
                  {totalPresencial > 0 && (
                    <SubpastaModalidadeCard
                      chaveSubpasta={`${cursoNome}-Presencial`}
                      tituloModalidade="Presencial"
                      icone={<Building2 className="w-4 h-4 text-amber-400" />}
                      corTag="amber"
                      roteiros={subpastas['Presencial']}
                      estaAberta={Boolean(subpastasAbertas[`${cursoNome}-Presencial`])}
                      onToggle={() => toggleSubpasta(`${cursoNome}-Presencial`)}
                      onOpenPdf={onOpenPdf}
                      onDeletar={onDeletar}
                    />
                  )}

                  {/* Subpasta 2: Semi-presencial */}
                  {totalSemi > 0 && (
                    <SubpastaModalidadeCard
                      chaveSubpasta={`${cursoNome}-Semi-presencial`}
                      tituloModalidade="Semi-presencial"
                      icone={<Laptop className="w-4 h-4 text-indigo-400" />}
                      corTag="indigo"
                      roteiros={subpastas['Semi-presencial']}
                      estaAberta={Boolean(subpastasAbertas[`${cursoNome}-Semi-presencial`])}
                      onToggle={() => toggleSubpasta(`${cursoNome}-Semi-presencial`)}
                      onOpenPdf={onOpenPdf}
                      onDeletar={onDeletar}
                    />
                  )}

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

// Componente da Subpasta por Modalidade (2º Nível)
const SubpastaModalidadeCard: React.FC<{
  chaveSubpasta: string;
  tituloModalidade: string;
  icone: React.ReactNode;
  corTag: 'amber' | 'indigo';
  roteiros: Roteiro[];
  estaAberta: boolean;
  onToggle: () => void;
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
}> = ({
  tituloModalidade,
  icone,
  corTag,
  roteiros,
  estaAberta,
  onToggle,
  onOpenPdf,
  onDeletar
}) => {
  const isAmber = corTag === 'amber';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      
      {/* Botão de Abrir/Fechar a Subpasta */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-slate-900/80 hover:bg-slate-800/60 flex items-center justify-between text-left transition-colors cursor-pointer group select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            isAmber
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            {estaAberta ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          </div>
          
          <div className="flex items-center gap-2">
            {icone}
            <span className="text-xs font-bold text-slate-200 group-hover:text-white">
              Subpasta: {tituloModalidade}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
            isAmber
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            {roteiros.length} {roteiros.length === 1 ? 'roteiro' : 'roteiros'}
          </span>
          <div className="p-1 text-slate-400 group-hover:text-slate-200">
            {estaAberta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </div>
        </div>
      </button>

      {/* Roteiros dentro da Subpasta (3º Nível) */}
      {estaAberta && (
        <div className="p-2.5 sm:p-3 bg-slate-950/80 border-t border-slate-800/60 space-y-2 pl-3 sm:pl-5">
          {roteiros.map((roteiro) => (
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
};

// Linha Estilo Arquivo do Windows Explorer com Metadados Discriminados
const ItemRoteiroArquivoRow: React.FC<{
  roteiro: Roteiro;
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
}> = ({ roteiro, onOpenPdf, onDeletar }) => {
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

  const isBasico = roteiro.modeloComponente === 'Básico';

  return (
    <div className="glass-card-interactive rounded-xl p-3 sm:p-3.5 border border-slate-800/80 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 relative group">
      
      {/* Nome e Metadados do Arquivo */}
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
          <FileText className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
              {roteiro.titulo}
            </span>

            {/* Badge Modelo Componente Colorida (Básico / Específico) */}
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

          {/* Metadados Discriminados: Tema e Unidade Curricular */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <strong className="text-slate-300 font-bold shrink-0">Tema:</strong>
              <span className="text-amber-300/90 font-medium truncate">{roteiro.tema}</span>
            </div>

            <span className="hidden sm:inline text-slate-700">•</span>

            <div className="flex items-center gap-1.5 min-w-0">
              <strong className="text-slate-300 font-bold shrink-0">Unidade Curricular:</strong>
              <span className="text-emerald-300/90 font-medium truncate">{roteiro.disciplina}</span>
            </div>

            {roteiro.docente && roteiro.docente !== 'Não informado' && (
              <>
                <span className="hidden sm:inline text-slate-700">•</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <strong className="text-slate-300 font-bold shrink-0">Docente/Tutor:</strong>
                  <span className="text-slate-300 truncate">{roteiro.docente}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
        
        {/* Visualizar PDF */}
        <button
          onClick={() => onOpenPdf(roteiro)}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-colors shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
          <span>Visualizar</span>
        </button>

        {/* Compartilhar WhatsApp */}
        <button
          onClick={handleCompartilharWhatsApp}
          className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>

        {/* Baixar PDF */}
        <button
          onClick={handleBaixarPdf}
          disabled={baixando}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          title="Baixar PDF"
        >
          {baixando ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" /> : <Download className="w-3.5 h-3.5" />}
        </button>

        {/* Copiar Link */}
        <button
          onClick={handleCopiarLink}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Copiar Link"
        >
          {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* Excluir Roteiro */}
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
