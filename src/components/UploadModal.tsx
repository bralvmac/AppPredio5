import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle, CheckCircle2, Loader2, Trash2, Layers } from 'lucide-react';
import { Roteiro, TipoCurso, ModeloComponente } from '../types/roteiro';
import { cadastrarRoteirosEmLote } from '../lib/supabaseClient';
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
  tipoCurso: TipoCurso;
  modeloComponente: ModeloComponente;
  disciplina: string; // Unidade Curricular
  docente: string; // Docente / Tutor
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

  // Estado do Aplicador em Lote Global (Sem opção pré-selecionada)
  const [globalCurso, setGlobalCurso] = useState('');
  const [globalTipoCurso, setGlobalTipoCurso] = useState<TipoCurso>('');
  const [globalModelo, setGlobalModelo] = useState<ModeloComponente>('');
  const [globalDocente, setGlobalDocente] = useState('');

  if (!isOpen) return null;

  // Seleção de Múltiplos Arquivos PDF com Extração da Unidade Curricular e Tema
  const handleSelecionarArquivos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLendoArquivos(true);
    setErro(null);

    const novosItens: ItemRoteiroEmLote[] = [];

    for (const file of files) {
      const nomeSemExtensao = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ').trim();
      let temaExtraido = nomeSemExtensao;
      let unidadeExtraida = '';

      try {
        const meta = await extrairMetadadosDoPdf(file);
        if (meta.tema) temaExtraido = meta.tema;
        if (meta.unidadeCurricular) unidadeExtraida = meta.unidadeCurricular;
      } catch (err) {
        console.warn(`Erro ao ler o PDF ${file.name}:`, err);
      }

      novosItens.push({
        tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        arquivoPdf: file,
        titulo: nomeSemExtensao,
        tema: temaExtraido,
        curso: globalCurso || '',
        tipoCurso: globalTipoCurso || '',
        modeloComponente: globalModelo || '',
        disciplina: unidadeExtraida || '',
        docente: globalDocente || '',
        urlPdfManual: ''
      });
    }

    setItens(prev => [...prev, ...novosItens]);
    setLendoArquivos(false);
    e.target.value = '';
  };

  const handleAdicionarItemManual = () => {
    setItens(prev => [
      ...prev,
      {
        tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        titulo: '',
        tema: '',
        curso: globalCurso || '',
        tipoCurso: globalTipoCurso || '',
        modeloComponente: globalModelo || '',
        disciplina: '',
        docente: globalDocente || '',
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

  const handleAplicarParaTodos = () => {
    setItens(prev => prev.map(item => ({
      ...item,
      curso: globalCurso || item.curso,
      tipoCurso: globalTipoCurso !== '' ? globalTipoCurso : item.tipoCurso,
      modeloComponente: globalModelo !== '' ? globalModelo : item.modeloComponente,
      docente: globalDocente || item.docente
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (itens.length === 0) {
      setErro('Adicione pelo menos um arquivo PDF ou roteiro para cadastrar.');
      return;
    }

    // Apenas TÍTULO e TEMA são obrigatórios!
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
          curso: item.curso.trim() || 'Geral',
          tipoCurso: item.tipoCurso || 'Presencial',
          modeloComponente: item.modeloComponente || 'Básico',
          disciplina: item.disciplina.trim() || 'Geral',
          docente: item.docente.trim() || 'Não informado',
          tutor: item.docente.trim() || 'Não informado',
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
    setGlobalTipoCurso('');
    setGlobalModelo('');
    setGlobalDocente('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      {/* Datalists para autocompletar Unidades Curriculares, Cursos e Docentes sem limitar a digitação livre */}
      <datalist id="list-disciplinas">
        {opcoesExistentes.disciplinas.map(d => <option key={d} value={d} />)}
      </datalist>
      <datalist id="list-cursos">
        {opcoesExistentes.cursos.map(c => <option key={c} value={c} />)}
      </datalist>
      <datalist id="list-docentes">
        {opcoesExistentes.docentes.map(doc => <option key={doc} value={doc} />)}
      </datalist>

      <div className="glass-panel w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto text-slate-900 dark:text-slate-100">
        
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Cadastrar Roteiros de Aula Prática em Lote</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Selecione vários PDFs de uma vez para extração automática e cadastro em lote</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Área de Seleção de Múltiplos Arquivos */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500/50 rounded-xl cursor-pointer bg-white dark:bg-slate-950/60 transition-colors">
              
              {lendoArquivos ? (
                <div className="flex flex-col items-center py-2">
                  <Loader2 className="w-9 h-9 text-brand-500 animate-spin mb-2" />
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-300">Lendo e extraindo Unidade Curricular e Tema de todos os PDFs...</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-brand-500 dark:text-brand-400 mb-2" />
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Clique ou arraste vários arquivos PDF aqui de uma vez
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Apenas <strong>Título</strong> e <strong>Tema</strong> são obrigatórios para salvar.</span>
              <button
                type="button"
                onClick={handleAdicionarItemManual}
                className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                + Adicionar Roteiro por URL / Manual
              </button>
            </div>
          </div>

          {/* Barra de Preenchimento em Lote Global */}
          {itens.length > 1 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
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
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Curso:</label>
                  <input
                    type="text"
                    list="list-cursos"
                    placeholder="Digitar ou selecionar..."
                    value={globalCurso}
                    onChange={(e) => setGlobalCurso(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Tipo de Curso:</label>
                  <select
                    value={globalTipoCurso}
                    onChange={(e) => setGlobalTipoCurso(e.target.value as TipoCurso)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                  >
                    <option value="">Selecione...</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Semi-presencial">Semi-presencial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Modelo Componente:</label>
                  <select
                    value={globalModelo}
                    onChange={(e) => setGlobalModelo(e.target.value as ModeloComponente)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                  >
                    <option value="">Selecione...</option>
                    <option value="Básico">Básico</option>
                    <option value="Específico">Específico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Docente / Tutor:</label>
                  <input
                    type="text"
                    list="list-docentes"
                    placeholder="Digitar ou selecionar..."
                    value={globalDocente}
                    onChange={(e) => setGlobalDocente(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lista de Roteiros Extraídos / Em Edição */}
          {itens.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                  Roteiros Prontos para Cadastrar ({itens.length})
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">* Apenas Título e Tema são obrigatórios</span>
              </div>

              <div className="space-y-3">
                {itens.map((item, index) => (
                  <div key={item.tempId} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative group shadow-sm">
                    
                    {/* Linha 1: Número, Nome do PDF e Botão Remover */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-md">
                          {item.arquivoPdf ? item.arquivoPdf.name : 'Roteiro Manual / URL'}
                        </span>
                        {item.arquivoPdf && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-500/20 font-bold">
                            Auto-Extraído
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverItem(item.tempId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Remover este item da lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Linha 2: Título (Obrigatório) & Tema (Obrigatório) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Título do Roteiro *</label>
                        <input
                          type="text"
                          value={item.titulo}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'titulo', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-brand-500 font-medium"
                          placeholder="Nome do arquivo ou título"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Tema da Aula Prática *</label>
                        <input
                          type="text"
                          value={item.tema}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'tema', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-brand-500 font-medium"
                          placeholder="Tema extraído da aula"
                          required
                        />
                      </div>
                    </div>

                    {/* Linha 3: Unidade Curricular, Curso, Tipo, Modelo, Docente (Opcionais) */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
                      
                      {/* Unidade Curricular */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">Unidade Curricular:</label>
                        <input
                          type="text"
                          list="list-disciplinas"
                          value={item.disciplina}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'disciplina', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                          placeholder="Extraída do PDF..."
                        />
                      </div>

                      {/* Curso */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">Curso:</label>
                        <input
                          type="text"
                          list="list-cursos"
                          value={item.curso}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'curso', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                          placeholder="Selecione ou digite..."
                        />
                      </div>

                      {/* Tipo de Curso */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">Tipo de Curso:</label>
                        <select
                          value={item.tipoCurso}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'tipoCurso', e.target.value as TipoCurso)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                        >
                          <option value="">Selecione...</option>
                          <option value="Presencial">Presencial</option>
                          <option value="Semi-presencial">Semi-presencial</option>
                        </select>
                      </div>

                      {/* Modelo Componente */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">Modelo Componente:</label>
                        <select
                          value={item.modeloComponente}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'modeloComponente', e.target.value as ModeloComponente)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                        >
                          <option value="">Selecione...</option>
                          <option value="Básico">Básico</option>
                          <option value="Específico">Específico</option>
                        </select>
                      </div>

                      {/* Docente / Tutor */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">Docente / Tutor:</label>
                        <input
                          type="text"
                          list="list-docentes"
                          value={item.docente}
                          onChange={(e) => handleAtualizarItem(item.tempId, 'docente', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                          placeholder="Selecione ou digite..."
                        />
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rodapé com Ações */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {itens.length > 0 ? `${itens.length} roteiro(s) prontos para cadastro` : 'Nenhum roteiro selecionado ainda'}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
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
