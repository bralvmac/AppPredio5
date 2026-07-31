import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, FileText, Eye, Download, Share2, Trash2, Check, AlertTriangle, Building2, Laptop, Loader2, MessageCircle } from 'lucide-react';
import { Roteiro } from '../types/roteiro';
import { baixarPdfRoteiro, compartilharNoWhatsApp } from '../lib/downloadHelper';

interface PastaRoteirosViewProps {
  roteiros: Roteiro[];
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
  tema?: 'dark' | 'light';
}

interface EstruturaSubpastas {
  'Presencial': Roteiro[];
  'Semi-presencial': Roteiro[];
}

export const PastaRoteirosView: React.FC<PastaRoteirosViewProps> = ({
  roteiros,
  onOpenPdf,
  onDeletar,
  tema = 'dark'
}) => {
  const isDark = tema === 'dark';

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
      
      {/* Barra de Controle do Gerenciador de Pastas com Garantia de Cor Direta */}
      <div className="flex items-center justify-between px-2 py-1 text-xs">
        <span
          className="font-extrabold text-sm sm:text-base flex items-center gap-2"
          style={{ color: isDark ? '#f1f5f9' : '#020617' }}
        >
          <Folder className="w-5 h-5 text-amber-500" />
          Árvore de Pastas & Subpastas ({listaCursos.length} {listaCursos.length === 1 ? 'curso' : 'cursos'})
        </span>

        <div className="flex items-center gap-2.5 font-bold">
          <button
            onClick={expandirTodas}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer"
            style={
              isDark
                ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }
                : { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }
            }
          >
            + Expandir Todas
          </button>
          <button
            onClick={recolherTodas}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer"
            style={
              isDark
                ? { backgroundColor: 'rgba(51, 65, 85, 0.6)', color: '#cbd5e1', border: '1px solid rgba(71, 85, 105, 0.6)' }
                : { backgroundColor: '#e2e8f0', color: '#020617', border: '1px solid #cbd5e1' }
            }
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
              className="rounded-2xl border overflow-hidden transition-all duration-200 shadow-md"
              style={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#cbd5e1'
              }}
            >
              
              {/* Pasta Principal do Curso (1º Nível) */}
              <button
                onClick={() => togglePastaCurso(cursoNome)}
                className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors cursor-pointer group select-none border-b"
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0'
                }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0">
                    {cursoAberto ? (
                      <FolderOpen className="w-5 h-5" />
                    ) : (
                      <Folder className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3
                      className="text-sm sm:text-base font-black truncate"
                      style={{ color: isDark ? '#ffffff' : '#020617' }}
                    >
                      {cursoNome}
                    </h3>
                    <p
                      className="text-[11px] font-semibold"
                      style={{ color: isDark ? '#94a3b8' : '#475569' }}
                    >
                      Curso com {totalGeral} {totalGeral === 1 ? 'roteiro cadastrado' : 'roteiros cadastrados'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-xl text-xs font-black border"
                    style={
                      isDark
                        ? { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.2)' }
                        : { backgroundColor: '#fef3c7', color: '#78350f', borderColor: '#fde68a' }
                    }
                  >
                    {totalGeral} {totalGeral === 1 ? 'roteiro' : 'roteiros'}
                  </span>
                  <div
                    className="p-1.5 rounded-lg border"
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                      color: isDark ? '#cbd5e1' : '#0f172a',
                      borderColor: isDark ? '#334155' : '#cbd5e1'
                    }}
                  >
                    {cursoAberto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Subpastas de Modalidade (2º Nível: Presencial e Semi-presencial) */}
              {cursoAberto && (
                <div
                  className="p-3 sm:p-4 space-y-3 pl-4 sm:pl-8 border-t"
                  style={{
                    backgroundColor: isDark ? '#020617' : '#f1f5f9',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0'
                  }}
                >
                  
                  {/* Subpasta 1: Presencial */}
                  {totalPresencial > 0 && (
                    <SubpastaModalidadeCard
                      chaveSubpasta={`${cursoNome}-Presencial`}
                      tituloModalidade="Presencial"
                      icone={<Building2 className="w-4 h-4 text-amber-500" />}
                      corTag="amber"
                      roteiros={subpastas['Presencial']}
                      estaAberta={Boolean(subpastasAbertas[`${cursoNome}-Presencial`])}
                      onToggle={() => toggleSubpasta(`${cursoNome}-Presencial`)}
                      onOpenPdf={onOpenPdf}
                      onDeletar={onDeletar}
                      isDark={isDark}
                    />
                  )}

                  {/* Subpasta 2: Semi-presencial */}
                  {totalSemi > 0 && (
                    <SubpastaModalidadeCard
                      chaveSubpasta={`${cursoNome}-Semi-presencial`}
                      tituloModalidade="Semi-presencial"
                      icone={<Laptop className="w-4 h-4 text-indigo-500" />}
                      corTag="indigo"
                      roteiros={subpastas['Semi-presencial']}
                      estaAberta={Boolean(subpastasAbertas[`${cursoNome}-Semi-presencial`])}
                      onToggle={() => toggleSubpasta(`${cursoNome}-Semi-presencial`)}
                      onOpenPdf={onOpenPdf}
                      onDeletar={onDeletar}
                      isDark={isDark}
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
  isDark: boolean;
}> = ({
  tituloModalidade,
  icone,
  corTag,
  roteiros,
  estaAberta,
  onToggle,
  onOpenPdf,
  onDeletar,
  isDark
}) => {
  const isAmber = corTag === 'amber';

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#1e293b' : '#cbd5e1'
      }}
    >
      
      {/* Botão de Abrir/Fechar a Subpasta */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer group select-none border-b"
        style={{
          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
          borderColor: isDark ? '#334155' : '#e2e8f0'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            isAmber
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
          }`}>
            {estaAberta ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          </div>
          
          <div className="flex items-center gap-2">
            {icone}
            <span
              className="text-xs font-black"
              style={{ color: isDark ? '#ffffff' : '#020617' }}
            >
              Subpasta: {tituloModalidade}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold border"
            style={
              isAmber
                ? (isDark
                    ? { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.2)' }
                    : { backgroundColor: '#fef3c7', color: '#78350f', borderColor: '#fde68a' })
                : (isDark
                    ? { backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.2)' }
                    : { backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' })
            }
          >
            {roteiros.length} {roteiros.length === 1 ? 'roteiro' : 'roteiros'}
          </span>
          <div
            className="p-1 rounded-md"
            style={{ color: isDark ? '#94a3b8' : '#0f172a' }}
          >
            {estaAberta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </div>
        </div>
      </button>

      {/* Roteiros dentro da Subpasta (3º Nível) */}
      {estaAberta && (
        <div
          className="p-2.5 sm:p-3 space-y-2 pl-3 sm:pl-5 border-t"
          style={{
            backgroundColor: isDark ? '#020617' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0'
          }}
        >
          {roteiros.map((roteiro) => (
            <ItemRoteiroArquivoRow
              key={roteiro.id}
              roteiro={roteiro}
              onOpenPdf={onOpenPdf}
              onDeletar={onDeletar}
              isDark={isDark}
            />
          ))}
        </div>
      )}

    </div>
  );
};

// Linha Estilo Arquivo do Windows Explorer Adaptada com Cores Diretas para Máximo Contraste
const ItemRoteiroArquivoRow: React.FC<{
  roteiro: Roteiro;
  onOpenPdf: (roteiro: Roteiro) => void;
  onDeletar: (id: string, arquivoPath?: string) => void;
  isDark: boolean;
}> = ({ roteiro, onOpenPdf, onDeletar, isDark }) => {
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
    <div
      className="rounded-xl p-3 sm:p-3.5 border hover:border-emerald-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 relative group shadow-sm"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#1e293b' : '#cbd5e1'
      }}
    >
      
      {/* Nome e Metadados do Arquivo */}
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div
          className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5"
          style={{
            backgroundColor: isDark ? '#020617' : '#f1f5f9',
            borderColor: isDark ? '#1e293b' : '#cbd5e1',
            color: isDark ? '#34d399' : '#059669'
          }}
        >
          <FileText className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Título do Roteiro - 100% PRETO JET BLACK NO MODO CLARO */}
            <span
              className="text-xs sm:text-sm font-black line-clamp-1"
              style={{ color: isDark ? '#ffffff' : '#020617' }}
            >
              {roteiro.titulo}
            </span>

            {/* Badge Modelo Componente Colorida (Básico / Específico) */}
            {roteiro.modeloComponente && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold border"
                style={
                  isBasico
                    ? (isDark
                        ? { backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.2)' }
                        : { backgroundColor: '#cffaff', color: '#0e7490', borderColor: '#a5f3fc' })
                    : (isDark
                        ? { backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.2)' }
                        : { backgroundColor: '#ffe4e6', color: '#be123c', borderColor: '#fecdd3' })
                }
              >
                {roteiro.modeloComponente}
              </span>
            )}
          </div>

          {/* Metadados Discriminados com Máximo Contraste */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <strong
                className="font-black shrink-0"
                style={{ color: isDark ? '#cbd5e1' : '#020617' }}
              >
                Tema:
              </strong>
              <span
                className="font-bold truncate"
                style={{ color: isDark ? '#fcd34d' : '#78350f' }}
              >
                {roteiro.tema}
              </span>
            </div>

            <span
              className="hidden sm:inline"
              style={{ color: isDark ? '#334155' : '#cbd5e1' }}
            >
              •
            </span>

            <div className="flex items-center gap-1.5 min-w-0">
              <strong
                className="font-black shrink-0"
                style={{ color: isDark ? '#cbd5e1' : '#020617' }}
              >
                Unidade Curricular:
              </strong>
              <span
                className="font-bold truncate"
                style={{ color: isDark ? '#6ee7b7' : '#065f46' }}
              >
                {roteiro.disciplina}
              </span>
            </div>

            {roteiro.docente && roteiro.docente !== 'Não informado' && (
              <>
                <span
                  className="hidden sm:inline"
                  style={{ color: isDark ? '#334155' : '#cbd5e1' }}
                >
                  •
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <strong
                    className="font-black shrink-0"
                    style={{ color: isDark ? '#cbd5e1' : '#020617' }}
                  >
                    Docente/Tutor:
                  </strong>
                  <span
                    className="font-bold truncate"
                    style={{ color: isDark ? '#cbd5e1' : '#1e293b' }}
                  >
                    {roteiro.docente}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div
        className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0"
        style={{ borderColor: isDark ? '#1e293b' : '#e2e8f0' }}
      >
        
        {/* Visualizar PDF */}
        <button
          onClick={() => onOpenPdf(roteiro)}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-colors shadow-sm cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
          <span>Visualizar</span>
        </button>

        {/* Compartilhar WhatsApp */}
        <button
          onClick={handleCompartilharWhatsApp}
          className="p-1.5 rounded-lg border transition-colors cursor-pointer"
          style={
            isDark
              ? { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }
              : { backgroundColor: '#d1fae5', borderColor: '#a7f3d0', color: '#065f46' }
          }
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>

        {/* Baixar PDF */}
        <button
          onClick={handleBaixarPdf}
          disabled={baixando}
          className="p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50"
          style={{
            backgroundColor: isDark ? '#020617' : '#f1f5f9',
            borderColor: isDark ? '#1e293b' : '#cbd5e1',
            color: isDark ? '#cbd5e1' : '#020617'
          }}
          title="Baixar PDF"
        >
          {baixando ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
        </button>

        {/* Copiar Link */}
        <button
          onClick={handleCopiarLink}
          className="p-1.5 rounded-lg border transition-colors cursor-pointer"
          style={{
            backgroundColor: isDark ? '#020617' : '#f1f5f9',
            borderColor: isDark ? '#1e293b' : '#cbd5e1',
            color: isDark ? '#cbd5e1' : '#020617'
          }}
          title="Copiar Link"
        >
          {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* Excluir Roteiro */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmandoExclusao(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Excluir Roteiro"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Confirmar Exclusão */}
      {confirmandoExclusao && (
        <div 
          className="absolute inset-0 z-20 backdrop-blur-md rounded-xl p-3 flex items-center justify-between gap-3 animate-fade-in border shadow-lg"
          style={{
            backgroundColor: isDark ? 'rgba(2, 6, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: '#f43f5e'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 text-xs font-bold truncate" style={{ color: isDark ? '#fda4af' : '#be123c' }}>
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="truncate">Excluir "{roteiro.titulo}"?</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfirmandoExclusao(false)}
              className="py-1 px-2.5 rounded-lg text-xs font-semibold"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                color: isDark ? '#cbd5e1' : '#0f172a'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarExclusao}
              disabled={excluindo}
              className="py-1 px-2.5 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {excluindo ? '...' : 'Excluir'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
