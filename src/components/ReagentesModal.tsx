import React, { useState, useEffect } from 'react';
import { X, FlaskConical, Check, Copy, MessageCircle, AlertCircle, Beaker, Sparkles, Building2, UserCheck } from 'lucide-react';
import { Roteiro } from '../types/roteiro';
import { analisarReagentesDoRoteiro, ResultadoAnaliseReagentes } from '../lib/reagentAnalyzer';

interface ReagentesModalProps {
  roteiro: Roteiro | null;
  onClose: () => void;
  isDark?: boolean;
}

export const ReagentesModal: React.FC<ReagentesModalProps> = ({ roteiro, onClose, isDark = true }) => {
  const [analisando, setAnalisando] = useState(true);
  const [resultado, setResultado] = useState<ResultadoAnaliseReagentes | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!roteiro) return;

    async function executarAnalise() {
      setAnalisando(true);
      setResultado(null);

      // Simula tempo de leitura e isolamento das seções de bancada no PDF
      const res = await analisarReagentesDoRoteiro(roteiro!);
      
      setTimeout(() => {
        setResultado(res);
        setAnalisando(false);
      }, 500);
    }

    executarAnalise();
  }, [roteiro]);

  if (!roteiro) return null;

  const handleCopiarTexto = () => {
    if (!resultado || resultado.reagentes.length === 0) return;

    let texto = `🧪 *REAGENTES DAS SEÇÕES DE BANCADA DA AULA PRÁTICA*\n`;
    texto += `📌 *Roteiro:* ${roteiro.titulo}\n`;
    texto += `🔬 *Tema:* ${roteiro.tema}\n`;
    texto += `📚 *Unidade Curricular:* ${roteiro.disciplina}\n`;
    texto += `-----------------------------------\n\n`;

    resultado.reagentes.forEach((r, idx) => {
      texto += `${idx + 1}. *${r.nome}*\n`;
      texto += `   • Quantidade: ${r.quantidade}\n`;
      if (r.origemBancada) texto += `   • Local: ${r.origemBancada}\n`;
      if (r.concentracao) texto += `   • Concentração: ${r.concentracao}\n`;
      if (r.observacoes) texto += `   • Obs: ${r.observacoes}\n`;
      texto += `\n`;
    });

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCompartilharWhatsApp = () => {
    if (!resultado || resultado.reagentes.length === 0) return;

    let texto = `🧪 *REAGENTES E SOLUÇÕES DA AULA PRÁTICA*\n\n`;
    texto += `📄 *Roteiro:* ${roteiro.titulo}\n`;
    texto += `🔬 *Tema:* ${roteiro.tema}\n`;
    texto += `📚 *Disciplina:* ${roteiro.disciplina}\n\n`;
    texto += `*ITENS EXTRAÍDOS DA DISPONIBILIZAÇÃO:* \n`;

    resultado.reagentes.forEach((r, idx) => {
      texto += `\n${idx + 1}️⃣ *${r.nome}*\n`;
      texto += `🧪 Quantidade: ${r.quantidade}\n`;
      if (r.origemBancada) texto += `📍 ${r.origemBancada}\n`;
      if (r.concentracao) texto += `⚗️ Conc: ${r.concentracao}\n`;
    });

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      <div 
        className="w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden my-auto transition-all"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#cbd5e1',
          color: isDark ? '#f1f5f9' : '#020617'
        }}
      >
        
        {/* Cabeçalho do Modal */}
        <div 
          className="px-5 py-4 border-b flex items-center justify-between gap-3"
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
                Reagentes das Bancadas da Aula Prática
              </h2>
              <p className="text-xs font-semibold truncate" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                Análise das seções <span className="font-bold text-amber-600 dark:text-amber-400">Disponibilização - Bancada do Aluno / Apoio</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border transition-colors cursor-pointer shrink-0"
            style={{
              backgroundColor: isDark ? '#0f172a' : '#e2e8f0',
              borderColor: isDark ? '#334155' : '#cbd5e1',
              color: isDark ? '#cbd5e1' : '#020617'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Estado 1: Analisando as Seções de Bancada */}
          {analisando && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="relative">
                <FlaskConical className="w-12 h-12 text-amber-500 animate-bounce" />
                <Sparkles className="w-5 h-5 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                  Analisando Seções de Bancada no Roteiro...
                </h3>
                <p className="text-xs font-medium max-w-sm mt-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  Isolando as seções "Disponibilização - Bancada do Aluno" e "Disponibilização - Bancada de Apoio" para identificar reagentes e quantidades.
                </p>
              </div>
            </div>
          )}

          {/* Estado 2: Análise Concluída */}
          {!analisando && resultado && (
            <>
              {/* Card de Resumo Informativo */}
              <div 
                className="p-4 rounded-xl border flex items-start gap-3 text-xs"
                style={
                  resultado.requerReagentes
                    ? (isDark
                        ? { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', color: '#fef08a' }
                        : { backgroundColor: '#fef3c7', borderColor: '#fde68a', color: '#78350f' })
                    : (isDark
                        ? { backgroundColor: 'rgba(51, 65, 85, 0.4)', borderColor: 'rgba(71, 85, 105, 0.4)', color: '#cbd5e1' }
                        : { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', color: '#334155' })
                }
              >
                {resultado.requerReagentes ? (
                  <Beaker className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-extrabold text-xs">
                    {resultado.requerReagentes ? 'Reagentes Encontrados nas Seções de Bancada' : 'Nenhum Reagente Solicitado nas Bancadas'}
                  </h4>
                  <p className="font-medium mt-0.5 leading-relaxed">
                    {resultado.resumoGeral}
                  </p>
                </div>
              </div>

              {/* Tabela / Lista de Reagentes Encontrados nas Seções de Bancada */}
              {resultado.requerReagentes && resultado.reagentes.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: isDark ? '#cbd5e1' : '#020617' }}>
                      Reagentes das Bancadas ({resultado.reagentes.length})
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Focado em Bancada do Aluno / Apoio
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {resultado.reagentes.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-all hover:border-amber-500/50"
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                          borderColor: isDark ? '#334155' : '#e2e8f0'
                        }}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-black" style={{ color: isDark ? '#ffffff' : '#020617' }}>
                              {idx + 1}. {item.nome}
                            </span>

                            {/* Badge da Origem da Bancada (Aluno x Apoio) */}
                            {item.origemBancada && (
                              <span 
                                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold border flex items-center gap-1"
                                style={
                                  item.origemBancada === 'Bancada do Aluno'
                                    ? { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' }
                                    : { backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }
                                }
                              >
                                {item.origemBancada === 'Bancada do Aluno' ? (
                                  <UserCheck className="w-3 h-3" />
                                ) : (
                                  <Building2 className="w-3 h-3" />
                                )}
                                {item.origemBancada}
                              </span>
                            )}

                            {/* Categoria do Composto */}
                            {item.categoria && item.categoria !== 'Geral' && (
                              <span 
                                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold border"
                                style={
                                  item.categoria === 'Ácido / Base'
                                    ? { backgroundColor: '#ffe4e6', color: '#be123c', borderColor: '#fecdd3' }
                                    : { backgroundColor: '#fef3c7', color: '#78350f', borderColor: '#fde68a' }
                                }
                              >
                                {item.categoria}
                              </span>
                            )}
                          </div>

                          {item.observacoes && (
                            <p className="text-[11px] font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                              💡 {item.observacoes}
                            </p>
                          )}
                        </div>

                        {/* Quantidade Solicitada na Tabela */}
                        <div className="flex flex-col sm:items-end gap-0.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                            <Beaker className="w-3.5 h-3.5" />
                            <span>Quant: {item.quantidade}</span>
                          </div>

                          {item.concentracao && (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              Conc: {item.concentracao}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}

        </div>

        {/* Rodapé do Modal com Ações */}
        {!analisando && resultado && resultado.requerReagentes && (
          <div 
            className="px-5 py-4 border-t flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: isDark ? '#1e293b' : '#f8fafc',
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}
          >
            <span className="text-xs font-bold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Substâncias extraídas das seções de Bancada do Aluno / Apoio
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleCopiarTexto}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer"
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  color: isDark ? '#f1f5f9' : '#020617'
                }}
              >
                {copiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiado ? 'Copiado!' : 'Copiar Lista'}</span>
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
