import React, { useState } from 'react';
import { X, UploadCloud, FileCheck, AlertCircle, PlusCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Roteiro, TipoCurso, ModeloComponente } from '../types/roteiro';
import { cadastrarRoteiro, isSupabaseConfigured } from '../lib/supabaseClient';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoteiroCadastrado: (novoRoteiro: Roteiro) => void;
  opcoesExistentes: {
    cursos: string[];
    docentes: string[];
    tutores: string[];
    disciplinas: string[];
  };
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onRoteiroCadastrado,
  opcoesExistentes
}) => {
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [curso, setCurso] = useState('');
  const [cursoNovo, setCursoNovo] = useState('');
  const [tipoCurso, setTipoCurso] = useState<TipoCurso>('Presencial');
  const [modeloComponente, setModeloComponente] = useState<ModeloComponente>('Básico');
  const [disciplina, setDisciplina] = useState('');
  const [disciplinaNova, setDisciplinaNova] = useState('');
  const [docente, setDocente] = useState('');
  const [docenteNovo, setDocenteNovo] = useState('');
  const [tutor, setTutor] = useState('');
  const [tutorNovo, setTutorNovo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duracaoMinutos, setDuracaoMinutos] = useState<number>(120);
  const [laboratorioTipo, setLaboratorioTipo] = useState('');
  
  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);
  const [urlPdfManual, setUrlPdfManual] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const cursoFinal = curso === '__novo__' ? cursoNovo : curso;
    const disciplinaFinal = disciplina === '__novo__' ? disciplinaNova : disciplina;
    const docenteFinal = docente === '__novo__' ? docenteNovo : docente;
    const tutorFinal = tutor === '__novo__' ? tutorNovo : tutor;

    if (!titulo || !tema || !cursoFinal || !disciplinaFinal || !docenteFinal || !tutorFinal) {
      setErro('Por favor, preencha todos os campos obrigatórios (Título, Tema, Curso, Disciplina, Docente e Tutor).');
      return;
    }

    if (!arquivoPdf && !urlPdfManual) {
      setErro('Selecione um arquivo PDF do roteiro ou informe uma URL válida do documento.');
      return;
    }

    try {
      setSalvando(true);
      
      const novoRoteiro = await cadastrarRoteiro(
        {
          titulo,
          tema,
          curso: cursoFinal,
          tipoCurso,
          modeloComponente,
          disciplina: disciplinaFinal,
          docente: docenteFinal,
          tutor: tutorFinal,
          descricao,
          pdfUrl: urlPdfManual || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          duracaoMinutos,
          laboratorioTipo: laboratorioTipo || 'Laboratório Multidisciplinar'
        },
        arquivoPdf || undefined
      );

      onRoteiroCadastrado(novoRoteiro);
      onClose();
      resetForm();
    } catch (err: any) {
      setErro(err.message || 'Ocorreu um erro ao salvar o roteiro.');
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setTitulo('');
    setTema('');
    setCurso('');
    setCursoNovo('');
    setTipoCurso('Presencial');
    setModeloComponente('Básico');
    setDisciplina('');
    setDisciplinaNova('');
    setDocente('');
    setDocenteNovo('');
    setTutor('');
    setTutorNovo('');
    setDescricao('');
    setDuracaoMinutos(120);
    setLaboratorioTipo('');
    setArquivoPdf(null);
    setUrlPdfManual('');
    setErro(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-auto">
        
        {/* Cabeçalho do Form */}
        <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cadastrar Novo Roteiro de Aula Prática</h2>
              <p className="text-xs text-slate-400">Faça o upload do PDF e associe as informações do componente curricular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem de alerta Supabase */}
        {!isSupabaseConfigured && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Modo Demonstração:</strong> Como o Supabase não está configurado, o arquivo será salvo localmente para teste instantâneo.
            </span>
          </div>
        )}

        {erro && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Seção 1: Upload do Arquivo PDF */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              1. Arquivo do Roteiro (Formato PDF) *
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex-1 w-full flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-xl cursor-pointer bg-slate-950/60 transition-colors">
                <UploadCloud className="w-8 h-8 text-brand-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  {arquivoPdf ? arquivoPdf.name : 'Clique para selecionar o PDF do Roteiro'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  {arquivoPdf ? `${(arquivoPdf.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF até 25MB'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setArquivoPdf(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <div className="w-full sm:w-auto text-center text-xs text-slate-500 font-bold">OU</div>

              <div className="flex-1 w-full space-y-1">
                <span className="text-[11px] font-medium text-slate-400">URL Direta do PDF (Opcional):</span>
                <input
                  type="url"
                  placeholder="https://exemplo.com/roteiro.pdf"
                  value={urlPdfManual}
                  onChange={(e) => setUrlPdfManual(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Identificação do Roteiro & Tema */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Roteiro *</label>
              <input
                type="text"
                placeholder="Ex: Dissecção e Identificação das Estruturas do Sistema Cardiorrespiratório"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tema da Aula Prática *</label>
              <input
                type="text"
                placeholder="Ex: Anatomia do Coração e Pulmões"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                required
              />
            </div>
          </div>

          {/* Seção 3: Classificação Curricular (Curso, Tipo, Modelo) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Classificação do Componente Curricular</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Curso */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Curso *</label>
                <select
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                  required
                >
                  <option value="">Selecione um Curso</option>
                  {opcoesExistentes.cursos.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__novo__">+ Adicionar Novo Curso...</option>
                </select>
                {curso === '__novo__' && (
                  <input
                    type="text"
                    placeholder="Nome do Novo Curso"
                    value={cursoNovo}
                    onChange={(e) => setCursoNovo(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-slate-950 border border-brand-500/40 rounded-xl text-xs text-slate-100"
                    required
                  />
                )}
              </div>

              {/* Tipo de Curso */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Curso *</label>
                <select
                  value={tipoCurso}
                  onChange={(e) => setTipoCurso(e.target.value as TipoCurso)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Semi-presencial">Semi-presencial</option>
                </select>
              </div>

              {/* Modelo do Componente */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo do Componente *</label>
                <select
                  value={modeloComponente}
                  onChange={(e) => setModeloComponente(e.target.value as ModeloComponente)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <option value="Básico">Básico</option>
                  <option value="Específico">Específico</option>
                </select>
              </div>

            </div>
          </div>

          {/* Seção 4: Disciplina, Docente e Tutor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Disciplina */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Disciplina / Matéria *</label>
              <select
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                required
              >
                <option value="">Selecione a Disciplina</option>
                {opcoesExistentes.disciplinas.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
                <option value="__novo__">+ Adicionar Nova Disciplina...</option>
              </select>
              {disciplina === '__novo__' && (
                <input
                  type="text"
                  placeholder="Nome da Disciplina"
                  value={disciplinaNova}
                  onChange={(e) => setDisciplinaNova(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-slate-950 border border-brand-500/40 rounded-xl text-xs text-slate-100"
                  required
                />
              )}
            </div>

            {/* Docente */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Docente Responsável *</label>
              <select
                value={docente}
                onChange={(e) => setDocente(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                required
              >
                <option value="">Selecione o Docente</option>
                {opcoesExistentes.docentes.map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
                <option value="__novo__">+ Adicionar Novo Docente...</option>
              </select>
              {docente === '__novo__' && (
                <input
                  type="text"
                  placeholder="Nome do Prof. Docente"
                  value={docenteNovo}
                  onChange={(e) => setDocenteNovo(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-slate-950 border border-brand-500/40 rounded-xl text-xs text-slate-100"
                  required
                />
              )}
            </div>

            {/* Tutor */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tutor *</label>
              <select
                value={tutor}
                onChange={(e) => setTutor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                required
              >
                <option value="">Selecione o Tutor</option>
                {opcoesExistentes.tutores.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="__novo__">+ Adicionar Novo Tutor...</option>
              </select>
              {tutor === '__novo__' && (
                <input
                  type="text"
                  placeholder="Nome do Tutor"
                  value={tutorNovo}
                  onChange={(e) => setTutorNovo(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-slate-950 border border-brand-500/40 rounded-xl text-xs text-slate-100"
                  required
                />
              )}
            </div>

          </div>

          {/* Seção 5: Detalhes Opcionais (Duração, Tipo Lab, Descrição) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duração Estimada (Minutos)</label>
              <input
                type="number"
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Laboratório Exigido</label>
              <input
                type="text"
                placeholder="Ex: Laboratório de Anatomia, Microbiologia, etc."
                value={laboratorioTipo}
                onChange={(e) => setLaboratorioTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Observações ou Resumo do Roteiro (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Descreva brevemente os objetivos da prática..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
            />
          </div>

          {/* Rodapé do Form */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-teal-400 hover:from-brand-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Finalizar Cadastro</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
