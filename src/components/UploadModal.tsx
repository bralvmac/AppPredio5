import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle, CheckCircle2, Loader2, Sparkles, Trash2, Layers, Check, Copy } from 'lucide-react';
import { Roteiro, TipoCurso, ModeloComponente } from '../types/roteiro';
import { cadastrarRoteirosEmLote, isSupabaseConfigured } from '../lib/supabaseClient';
import { extrairMetadadosDoPdf } from '../lib/pdfExtractor';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoteiroCadastrado: (novoRoteiro: Roteiro) => void;
  opcoesExistentes: {
    cursos: string[];
    docentes: string[];
    disciplinas: string[];
  };
}

interface ItemRoteiroEmLote {
  tempId: string;
  arquivoPdf?: File;
  titulo: string;
  tema: string;
  curso: string;
  cursoNovo: string;
  tipoCurso: TipoCurso;
  modeloComponente: ModeloComponente;
  disciplina: string;
  disciplinaNova: string;
  docente: string;
  docenteNovo: string;
  urlPdfManual: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onRoteiroCadastrado,
  opcoesExistentes
}) => {
  const [itens, setItens] = useState<ItemRoteiroEmLote[]>([]);
  const [lendoArquivos, setLendoArquivos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estado do Aplicador em Lote Global
  const [globalCurso, setGlobalCurso] = useState('');
  const [globalTipoCurso, setGlobalTipoCurso] = useState<TipoCurso>('Presencial');
  const [globalModelo, setGlobalModelo] = useState<ModeloComponente>('Básico');
  const [globalDocente, setGlobalDocente] = useState('');

  if (!isOpen) return null;

  // Seleção de Múltiplos Arquivos PDF com Extração Individual para cada Roteiro
  const handleSelecionarArquivos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLendoArquivos(true);
    setErro(null);

    const novosItens: ItemRoteiroEmLote[] = [];

    for (const file of files) {
      const nomeSemExtensao = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ').trim();
      let temaExtraido = nomeSemExtensao;
      let disciplinaExtraida = '';

      try {
        const meta = await extrairMetadadosDoPdf(file);
        if (meta.tema) temaExtraido = meta.tema;
        if (meta.unidadeCurricular) disciplinaExtraida = meta.unidadeCurricular;
      } catch (err) {
        console.warn(`Erro ao ler o PDF ${file.name}:`, err);
      }

      novosItens.push({
        tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        arquivoPdf: file,
        titulo: nomeSemExtensao,
        tema: temaExtraido,
        curso: globalCurso || '',
        cursoNovo: '',
        tipoCurso: globalTipoCurso || 'Presencial',
        modeloComponente: globalModelo || 'Básico',
        disciplina: disciplinaExtraida || '',
        disciplinaNova: '',
        docente: globalDocente || '',
        docenteNovo: '',
        urlPdfManual: ''
      });
    }

    setItens(prev => [...prev, ...novosItens]);
    setLendoArquivos(false);
    e.target.value = ''; // reseta input de arquivo
  };

  // Adicionar item manual em branco se quiser
  const handleAdicionarItemManual = () => {
    setItens(prev => [
      ...prev,
      {
        tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        titulo: '',
        tema: '',
        curso: globalCurso || '',
        cursoNovo: '',
        tipoCurso: globalTipoCurso || 'Presencial',
        modeloComponente: globalModelo || 'Básico',
        disciplina: '',
        disciplinaNova: '',
        docente: globalDocente || '',
        docenteNovo: '',
        urlPdfManual: ''
      }
    ]);
  };

  const handleRemoverItem = (tempId: string) => {
    setItens(prev => prev.filter(i => i.tempId !== tempId));
  };

  const handleAtualizarItem = (tempId: string, campo: keyof ItemRoteiroEmLote, valor: any) => {
    setItens(prev => prev.map(item => {
      if (item.tempId === tempId) {
        return { ...item, [campo]: valor };
      }
      return item;
    }));
  };

  // Aplica dados globais (Curso, Tipo, Modelo, Docente) para TODOS os roteiros da lista
  const handleAplicarParaTodos = () => {
    setItens(prev => prev.map(item => ({
      ...item,
      curso: globalCurso || item.curso,
      tipoCurso: globalTipoCurso || item.tipoCurso,
      modeloComponente: globalModelo || item.modeloComponente,
      docente: globalDocente || item.docente
    })));
  };

  // Envio final de todos os roteiros da lista
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (itens.length === 0) {
      setErro('Adicione pelo menos um arquivo PDF ou roteiro para cadastrar.');
      return;
    }

    // Validação: Apenas TÍTULO e TEMA são obrigatórios!
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      if (!item.titulo.trim() || !item.tema.trim()) {
        setErro(`O item #${i + 1} (${item.titulo || 'Sem título'}) precisa ter o Título e o Tema preenchidos.`);
        return;
      }
    }

    try {
      setSalvando(true);

      const payload = itens.map(item => ({
        dados: {
          titulo: item.titulo.trim(),
          tema: item.tema.trim(),
          curso: (item.curso === '__novo__' ? item.cursoNovo : item.curso) || 'Geral',
          tipoCurso: item.tipoCurso,
          modeloComponente: item.modeloComponente,
          disciplina: (item.disciplina === '__novo__' ? item.disciplinaNova : item.disciplina) || 'Geral',
          docente: (item.docente === '__novo__' ? item.docenteNovo : item.docente) || 'Não informado',
          tutor: (item.docente === '__novo__' ? item.docenteNovo : item.docente) || 'Não informado',
          pdfUrl: item.urlPdfManual || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        pdfArquivo: item.arquivoPdf
      }));

      const criados = await cadastrarRoteirosEmLote(payload);
      
      criados.forEach(r => onRoteiroCadastrado(r));
      onClose();
      resetForm();
    } catch (err: any) {
      setErro(err.message || 'Ocorreu um erro ao cadastrar os roteiros.');
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setItens([]);
    setErro(null);
    setGlobalCurso('');
    setGlobalDocente('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      <div className="glass-panel w-full max-w-5xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-auto">
        
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cadastrar Roteiros de Aula Prática em Lote</h2>
              <p className="text-xs text-slate-400">Selecione vários PDFs de uma vez para extração automática e cadastro em lote</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Área de Seleção de Múltiplos Arquivos */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-xl cursor-pointer bg-slate-950/60 transition-colors">
              
              {lendoArquivos ? (
                <div className="flex flex-col items-center py-2">
                  <Loader2 className="w-9 h-9 text-brand-400 animate-spin mb-2" />
                  <span className="text-sm font-semibold text-brand-300">Lendo e extraindo Unidade Curricular e Tema de todos os PDFs...</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-brand-400 mb-2" />
                  <span className="text-sm font-bold text-slate-100">
                    Clique ou arraste vários arquivos PDF aqui de uma vez
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Você pode selecionar 1, 5, 10 ou mais roteiros em PDF simultaneamente
                  </span>
                </>
              )}

              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleSelecionarArquivos}
                className="hidden"
                disabled={lendoArquivos}
              />
            </label>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Apenas <strong>Título</strong> e <strong>Tema</strong> são obrigatórios para salvar.</span>
              <button
                type="button"
                onClick={handleAdicionarItemManual}
                className="text-brand-400 hover:underline font-semibold"
              >
                + Adicionar Roteiro por URL / Manual
              </button>
            </div>
          </div>

          {/* Barra de Preenchimento em Lote Global (Aplica para todos) */}
          {itens.length > 1 && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Preencher em Lote para Todos os {itens.length} Roteiros
                </span>
                <button
                  type="button"
                  onClick={handleAplicarParaTodos}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-colors shadow-sm"
                >
                  Aplicar a Todos
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Curso:</label>
                  <select
                    value={globalCurso}
                    onChange={(e) => setGlobalCurso(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="">Selecione para todos...</option>
                    {opcoesExistentes.cursos.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Curso:</label>
                  <select
                    value={globalTipoCurso}
                    onChange={(e) => setGlobalTipoCurso(e.target.value as TipoCurso)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Semi-presencial">Semi-presencial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Modelo Componente:</label>
                  <select
                    value={globalModelo}
                    onChange={(e) => setGlobalModelo(e.target.value as ModeloComponente)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Específico">Específico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Docente / Tutor:</label>
                  <select
                    value={globalDocente}
                    onChange={(e) => setGlobalDocente(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="">Selecione para todos...</option>
                    {opcoesExistentes.docentes.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Roteiros Extraídos / Em Edição */}
          {itens.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                  Roteiros Prontos para Cadastrar ({itens.length})
                </h3>
                <span className="text-[11px] text-slate-400">* Apenas Título e Tema são obrigatórios</span>
              </div>

              <div className="space-y-3">
                {itens.map((item, index) => (
                  <div key={item.tempId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 relative group">
                    
                    {/* Linha 1: Número, Nome do PDF e Botão Remover */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-white truncate max-w-md">
                          {item.arquivoPdf ? item.arquivoPdf.name : 'Roteiro Manual / URL'}
                        </span>
                        {item.arquivoPdf && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            Auto-Extraído
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverItem(item.tempId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remover este item da lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Linha 2: Título (Obrigatório) & Tema (Obrigatório) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Título do Roteiro *</label>
                        <input
                          type="text"
                          value={item.titulo}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'titulo', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:ring-1 focus:ring-brand-500"
                          placeholder="Nome do arquivo ou título"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tema da Aula Prática *</label>
                        <input
                          type="text"
                          value={item.tema}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'tema', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:ring-1 focus:ring-brand-500"
                          placeholder="Tema extraído da aula"
                          required
                        />
                      </div>
                    </div>

                    {/* Linha 3: Unidade Curricular, Curso, Tipo, Modelo, Docente (Opcionais) */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
                      
                      {/* Unidade Curricular */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Unidade Curricular:</label>
                        <select
                          value={item.disciplina}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'disciplina', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                        >
                          <option value="">Selecione...</option>
                          {opcoesExistentes.disciplinas.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                          <option value="__novo__">+ Nova...</option>
                        </select>
                        {item.disciplina === '__novo__' && (
                          <input
                            type="text"
                            placeholder="Nome da Unidade"
                            value={item.disciplinaNova}
                            onChange={(e) => handleAtualizarItem(item.tempId, 'disciplinaNova', e.target.value)}
                            className="w-full mt-1 px-2 py-1 bg-slate-950 border border-brand-500/40 rounded-lg text-xs"
                          />
                        )}
                      </div>

                      {/* Curso */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Curso:</label>
                        <select
                          value={item.curso}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'curso', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                        >
                          <option value="">Selecione...</option>
                          {opcoesExistentes.cursos.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="__novo__">+ Novo...</option>
                        </select>
                        {item.curso === '__novo__' && (
                          <input
                            type="text"
                            placeholder="Nome do Curso"
                            value={item.cursoNovo}
                            onChange={(e) => handleAtualizarItem(item.tempId, 'cursoNovo', e.target.value)}
                            className="w-full mt-1 px-2 py-1 bg-slate-950 border border-brand-500/40 rounded-lg text-xs"
                          />
                        )}
                      </div>

                      {/* Tipo de Curso */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Tipo de Curso:</label>
                        <select
                          value={item.tipoCurso}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'tipoCurso', e.target.value as TipoCurso)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                        >
                          <option value="Presencial">Presencial</option>
                          <option value="Semi-presencial">Semi-presencial</option>
                        </select>
                      </div>

                      {/* Modelo Componente */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Modelo Componente:</label>
                        <select
                          value={item.modeloComponente}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'modeloComponente', e.target.value as ModeloComponente)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                        >
                          <option value="Básico">Básico</option>
                          <option value="Específico">Específico</option>
                        </select>
                      </div>

                      {/* Docente / Tutor */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Docente / Tutor:</label>
                        <select
                          value={item.docente}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'docente', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                        >
                          <option value="">Selecione...</option>
                          {opcoesExistentes.docentes.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                          <option value="__novo__">+ Novo...</option>
                        </select>
                        {item.docente === '__novo__' && (
                          <input
                            type="text"
                            placeholder="Nome Docente"
                            value={item.docenteNovo}
                            onChange={(e) => handleAtualizarItem(item.tempId, 'docenteNovo', e.target.value)}
                            className="w-full mt-1 px-2 py-1 bg-slate-950 border border-brand-500/40 rounded-lg text-xs"
                          />
                        )}
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rodapé com Ações */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {itens.length > 0 ? `${itens.length} roteiro(s) prontos para cadastro` : 'Nenhum roteiro selecionado ainda'}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando || lendoArquivos || itens.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-teal-400 hover:from-brand-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                {salvando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cadastrando {itens.length} Roteiro(s)...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Finalizar Cadastro ({itens.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
};
