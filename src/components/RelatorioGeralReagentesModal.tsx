import React, { useState, useEffect, useMemo } from 'react';
import { X, FlaskConical, Check, Copy, MessageCircle, Loader2, Search, Beaker, Sparkles, Building2, PackageCheck, Layers, Printer } from 'lucide-react';
import { Roteiro } from '../types/roteiro';
import { analisarReagentesDoRoteiro, ResultadoAnaliseReagentes, ReagenteItem } from '../lib/reagentAnalyzer';
import { gerarPdfRelatorioReagentes, ItemConsolidadoPDF } from '../lib/pdfReportGenerator';

interface RelatorioGeralReagentesModalProps {
  isOpen: boolean;
  onClose: () => void;
  roteiros: Roteiro[];
  tituloContexto?: string;
  isDark?: boolean;
}

export const RelatorioGeralReagentesModal: React.FC<RelatorioGeralReagentesModalProps> = ({
  isOpen,
  onClose,
  roteiros,
  tituloContexto = 'Relatório Geral do Laboratório',
  isDark = true
}) => {
  const [carregando, setCarregando] = useState(true);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });
  const [resultadosMap, setResultadosMap] = useState<Map<string, ResultadoAnaliseReagentes>>(new Map());
  const [abaAtiva, setAbaAtiva] = useState<'consolidado' | 'porRoteiro'>('consolidado');
  const [buscaReagente, setBuscaReagente] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!isOpen || roteiros.length === 0) return;

    let cancelado = false;

    async function analisarTodosOsRoteiros() {
      setCarregando(true);
      setProgresso({ atual: 0, total: roteiros.length });

      const mapaResultados = new Map<string, ResultadoAnaliseReagentes>();

      for (let i = 0; i < roteiros.length; i++) {
        if (cancelado) break;

        const roteiro = roteiros[i];
        setProgresso({ atual: i + 1, total: roteiros.length });

        try {
          const res = await analisarReagentesDoRoteiro(roteiro);
          mapaResultados.set(roteiro.id, res);
        } catch (err) {
          console.warn(`Erro ao analisar reagentes do roteiro ${roteiro.titulo}:`, err);
        }

        await new Promise(r => setTimeout(r, 10));
      }

      if (!cancelado) {
        setResultadosMap(mapaResultados);
        setCarregando(false);
      }
    }

    analisarTodosOsRoteiros();

    return () => {
      cancelado = true;
    };
  }, [isOpen, roteiros]);

  // Consolidação dos reagentes únicos
  const itensConsolidados = useMemo<ItemConsolidadoPDF[]>(() => {
    const mapaItens = new Map<string, ItemConsolidadoPDF>();

    resultadosMap.forEach((res, idRoteiro) => {
      const roteiro = roteiros.find(r => r.id === idRoteiro);
      if (!roteiro || !res.requerReagentes) return;

      res.reagentes.forEach(item => {
        const chaveNorm = item.nome.toLowerCase().trim();

        if (!mapaItens.has(chaveNorm)) {
          mapaItens.set(chaveNorm, {
            nome: item.nome,
            categoria: item.categoria,
            concentracao: item.concentracao,
            quantidades: [],
            totalOcorrencias: 0
          });
        }

        const reg = mapaItens.get(chaveNorm)!;
        reg.quantidades.push({
          roteiroTitulo: roteiro.titulo,
          curso: roteiro.curso || 'Sem Curso',
          quantidade: item.quantidade,
          origemBancada: item.origemBancada
        });
        reg.totalOcorrencias += 1;
      });
    });

    return Array.from(mapaItens.values()).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [resultadosMap, roteiros]);

  const itensConsolidadosFiltrados = useMemo(() => {
    if (!buscaReagente.trim()) return itensConsolidados;

    const termo = buscaReagente.toLowerCase().trim();
    return itensConsolidados.filter(item => 
      item.nome.toLowerCase().includes(termo) ||
      (item.categoria && item.categoria.toLowerCase().includes(termo)) ||
      item.quantidades.some(q => q.roteiroTitulo.toLowerCase().includes(termo) || q.curso.toLowerCase().includes(termo))
    );
  }, [itensConsolidados, buscaReagente]);

  const totalRoteirosComReagentes = useMemo(() => {
    let count = 0;
    resultadosMap.forEach(res => {
      if (res.requerReagentes) count++;
    });
    return count;
  }, [resultadosMap]);

  if (!isOpen) return null;

  const handleGerarPdf = () => {
    if (itensConsolidados.length === 0) return;
    gerarPdfRelatorioReagentes(itensConsolidados, tituloContexto, roteiros.length);
  };

  const handleCopiarRelatorioCompleto = () => {
    if (itensConsolidados.length === 0) return;

    let texto = `🧪 *RELATÓRIO DE PRODUTOS QUÍMICOS E REAGENTES*\n`;
    texto += `📌 *Contexto:* ${tituloContexto}\n`;
    texto += `📊 Total de Roteiros Analisados: ${roteiros.length}\n`;
    texto += `🔬 Roteiros com Solicitação de Reagentes: ${totalRoteirosComReagentes}\n`;
    texto += `⚗️ Total de Produtos Químicos Distintos: ${itensConsolidados.length}\n`;
    texto += `--------------------------------------------------\n\n`;

    itensConsolidados.forEach((item, idx) => {
      texto += `${idx + 1}. *${item.nome}*\n`;
      if (item.concentracao) texto += `   • Concentração: ${item.concentracao}\n`;
      if (item.categoria) texto += `   • Categoria: ${item.categoria}\n`;
      texto += `   • Solicitado em ${item.totalOcorrencias} aula(s) prática(s):\n`;
      
      item.quantidades.forEach(q => {
        texto += `     - ${q.roteiroTitulo} (${q.curso}): ${q.quantidade} [${q.origemBancada || 'Bancada'}]\n`;
      });
      texto += `\n`;
    });

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCompartilharWhatsApp = () => {
    if (itensConsolidados.length === 0) return;

    let texto = `🧪 *RELATÓRIO DE PRODUTOS QUÍMICOS - ${tituloContexto.toUpperCase()}*\n\n`;
    texto += `📊 *Resumo:* ${itensConsolidados.length} produtos químicos distintos para ${totalRoteirosComReagentes} aulas práticas.\n\n`;
    texto += `*LISTA CONSOLIDADA:* \n`;

    itensConsolidados.forEach((item, idx) => {
      texto += `\n${idx + 1}️⃣ *${item.nome}*\n`;
      if (item.concentracao) texto += `⚗️ Conc: ${item.concentracao}\n`;
      texto += `📌 Usado em ${item.totalOcorrencias} aula(s)\n`;
    });

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const pctProgresso = progresso.total > 0 ? Math.round((progresso.atual / progresso.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      <div 
        className="w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#cbd5e1',
          color: isDark ? '#f1f5f9' : '#020617'
        }}
      >
        
        {/* Cabeçalho do Modal */}
        <div 
          className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black truncate" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                Relatório de Produtos Químicos e Reagentes
              </h2>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {tituloContexto} ({roteiros.length} {roteiros.length === 1 ? 'roteiro' : 'roteiros'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!carregando && itensConsolidados.length > 0 && (
              <button
                onClick={handleGerarPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-extrabold hover:bg-emerald-500/25 transition-all cursor-pointer"
                title="Gerar PDF para Impressão"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Gerar PDF / Imprimir</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl border transition-colors cursor-pointer"
              style={{
                backgroundColor: isDark ? '#0f172a' : '#e2e8f0',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                color: isDark ? '#cbd5e1' : '#020617'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-5 text-center">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="space-y-2 w-full max-w-md">
                <h3 className="text-sm font-extrabold" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                  Analisando Roteiros... ({progresso.atual} de {progresso.total})
                </h3>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-300 dark:border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-200 rounded-full"
                    style={{ width: `${pctProgresso}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Filtrando exclusivamente produtos químicos e reagentes... ({pctProgresso}%)
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Barra de Cards de Resumo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div 
                  className="p-3.5 rounded-xl border flex items-center gap-3"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                  }}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      Produtos Químicos
                    </span>
                    <h4 className="text-base font-black" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                      {itensConsolidados.length} reagentes
                    </h4>
                  </div>
                </div>

                <div 
                  className="p-3.5 rounded-xl border flex items-center gap-3"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                  }}
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      Aulas Práticas com Reagentes
                    </span>
                    <h4 className="text-base font-black" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                      {totalRoteirosComReagentes} de {roteiros.length} roteiros
                    </h4>
                  </div>
                </div>

                <div 
                  className="p-3.5 rounded-xl border flex items-center gap-3"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                  }}
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      Escopo do Relatório
                    </span>
                    <h4 className="text-xs font-black truncate max-w-[150px]" style={{ color: isDark ? '#ffffff' : '#020617' }} title={tituloContexto}>
                      {tituloContexto}
                    </h4>
                  </div>
                </div>

              </div>

              {/* Barra de Busca + Troca de Abas */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                
                <div className="flex rounded-xl p-1 border self-start" style={{
                  backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                  borderColor: isDark ? '#334155' : '#cbd5e1'
                }}>
                  <button
                    onClick={() => setAbaAtiva('consolidado')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      abaAtiva === 'consolidado'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                        : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Visão Consolidada de Compras</span>
                  </button>

                  <button
                    onClick={() => setAbaAtiva('porRoteiro')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      abaAtiva === 'porRoteiro'
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                        : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Visão Detalhada por Roteiro</span>
                  </button>
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar reagente ou curso..."
                    value={buscaReagente}
                    onChange={(e) => setBuscaReagente(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none"
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      color: isDark ? '#ffffff' : '#020617'
                    }}
                  />
                  {buscaReagente && (
                    <button
                      onClick={() => setBuscaReagente('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

              {/* ABA 1: VISÃO CONSOLIDADA */}
              {abaAtiva === 'consolidado' && (
                <div className="space-y-3 pt-1">
                  {itensConsolidadosFiltrados.length > 0 ? (
                    <div className="space-y-2.5">
                      {itensConsolidadosFiltrados.map((item, idx) => (
                        <div 
                          key={idx}
                          className="p-4 rounded-xl border flex flex-col gap-2.5 shadow-sm transition-all hover:border-amber-500/40"
                          style={{
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderColor: isDark ? '#334155' : '#e2e8f0'
                          }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs sm:text-sm font-black" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                                {idx + 1}. {item.nome}
                              </span>

                              {item.categoria && (
                                <span 
                                  className="px-2 py-0.5 rounded-md text-[10px] font-extrabold border"
                                  style={
                                    item.categoria === 'Kit de Ensaio / Diagnóstico'
                                      ? { backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }
                                      : item.categoria === 'Ácido / Base'
                                        ? { backgroundColor: '#ffe4e6', color: '#be123c', borderColor: '#fecdd3' }
                                        : { backgroundColor: '#fef3c7', color: '#78350f', borderColor: '#fde68a' }
                                  }
                                >
                                  {item.categoria}
                                </span>
                              )}
                            </div>

                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Solicitado em {item.totalOcorrencias} aula(s) prática(s)
                            </span>
                          </div>

                          <div className="pl-3 border-l-2 border-amber-500/40 space-y-1 text-xs">
                            {item.quantidades.map((q, qIdx) => (
                              <div key={qIdx} className="flex flex-wrap items-center justify-between gap-2 py-0.5">
                                <span className="font-semibold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                                  📄 {q.roteiroTitulo} <span className="text-emerald-600 dark:text-emerald-400 font-bold">({q.curso})</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                    Qtd: {q.quantidade}
                                  </span>
                                  {q.origemBancada && (
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                      [{q.origemBancada}]
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Nenhum produto químico encontrado com o termo "{buscaReagente}".
                    </div>
                  )}
                </div>
              )}

              {/* ABA 2: VISÃO POR ROTEIRO */}
              {abaAtiva === 'porRoteiro' && (
                <div className="space-y-3 pt-1">
                  {roteiros.map(roteiro => {
                    const res = resultadosMap.get(roteiro.id);
                    if (!res || !res.requerReagentes) return null;

                    return (
                      <div 
                        key={roteiro.id}
                        className="p-4 rounded-xl border space-y-2.5"
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                          borderColor: isDark ? '#334155' : '#e2e8f0'
                        }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-300 dark:border-slate-700">
                          <div>
                            <h4 className="text-xs sm:text-sm font-black" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                              {roteiro.titulo}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              Curso: <strong className="text-emerald-600 dark:text-emerald-400">{roteiro.curso}</strong> | Disciplina: {roteiro.disciplina}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {res.reagentes.length} produto(s)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {res.reagentes.map((r, rIdx) => (
                            <div 
                              key={rIdx}
                              className="p-2.5 rounded-lg border flex items-center justify-between gap-2"
                              style={{
                                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                borderColor: isDark ? '#334155' : '#cbd5e1'
                              }}
                            >
                              <div className="min-w-0">
                                <span className="font-extrabold truncate block" style={{ color: isDark ? '#f1f5f9' : '#020617' }}>
                                  {r.nome}
                                </span>
                                {r.origemBancada && (
                                  <span className="text-[10px] text-slate-400">
                                    {r.origemBancada}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 shrink-0">
                                {r.quantidade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>

        {/* Rodapé do Modal com Ações */}
        {!carregando && itensConsolidados.length > 0 && (
          <div 
            className="px-5 py-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0"
            style={{
              backgroundColor: isDark ? '#1e293b' : '#f8fafc',
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}
          >
            <span className="text-xs font-bold text-slate-400">
              Relatório de produtos químicos das bancadas ({tituloContexto})
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleGerarPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Gerar PDF / Imprimir</span>
              </button>

              <button
                onClick={handleCopiarRelatorioCompleto}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer"
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  color: isDark ? '#f1f5f9' : '#020617'
                }}
              >
                {copiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={handleCompartilharWhatsApp}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
