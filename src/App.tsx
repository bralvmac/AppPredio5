import React, { useState, useEffect, useMemo } from 'react';
import { FiltrosBusca } from './components/FiltrosBusca';
import { CardRoteiro } from './components/CardRoteiro';
import { PastaRoteirosView } from './components/PastaRoteirosView';
import { PdfModalViewer } from './components/PdfModalViewer';
import { UploadModal } from './components/UploadModal';
import { Roteiro, FiltrosState, OpcoesFiltros } from './types/roteiro';
import { buscarRoteiros, deletarRoteiro, supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { SearchX, Loader2, FolderTree, LayoutGrid } from 'lucide-react';

/**
 * Remove acentos, diacríticos e converte para minúsculas para busca 100% insensível a acentuação e maiúsculas/minúsculas.
 * Ex: "Nutrição" -> "nutricao", "ÁGUA" -> "agua", "Aterosclerose" -> "aterosclerose"
 */
function normalizarTexto(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const App: React.FC = () => {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  // Modo de Visualização: 'pastas' (Estilo Gerenciador Windows/Pastas) ou 'grade' (Cards)
  const [modoVisualizacao, setModoVisualizacao] = useState<'pastas' | 'grade'>('pastas');

  // Modais
  const [roteiroSelecionado, setRoteiroSelecionado] = useState<Roteiro | null>(null);
  const [uploadModalAberto, setUploadModalAberto] = useState<boolean>(false);

  // Estado dos Filtros
  const [filtros, setFiltros] = useState<FiltrosState>({
    buscaGeral: '',
    curso: '',
    tipoCurso: 'Todos',
    modeloComponente: 'Todos',
    docente: '',
    disciplina: '',
    tema: ''
  });

  // Carrega os dados iniciais e escuta mudanças em Realtime
  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const dados = await buscarRoteiros();
        setRoteiros(dados);
      } catch (err) {
        console.error("Erro ao carregar roteiros:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();

    // Inscrição em Tempo Real (Supabase Realtime)
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel('mudancas-roteiros')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'roteiros' },
          async () => {
            const atualizados = await buscarRoteiros();
            setRoteiros(atualizados);
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, []);

  // Extrai listas ÚNICAS (sem duplicados) para popular os seletores dos filtros
  const opcoesFiltros = useMemo<OpcoesFiltros>(() => {
    const cursosSet = new Set<string>();
    const docentesSet = new Set<string>();
    const disciplinasSet = new Set<string>();
    const temasSet = new Set<string>();

    roteiros.forEach(r => {
      if (r.curso && r.curso.trim()) {
        cursosSet.add(r.curso.trim());
      }
      if (r.docente && r.docente.trim()) {
        docentesSet.add(r.docente.trim());
      }
      if (r.disciplina && r.disciplina.trim()) {
        disciplinasSet.add(r.disciplina.trim());
      }
      if (r.tema && r.tema.trim()) {
        temasSet.add(r.tema.trim());
      }
    });

    return {
      cursos: Array.from(cursosSet).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      docentes: Array.from(docentesSet).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      disciplinas: Array.from(disciplinasSet).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      temas: Array.from(temasSet).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    };
  }, [roteiros]);

  // Algoritmo de filtragem com Busca Insensível a Acentuação, Maiúsculas/Minúsculas e Caracteres Especiais
  const roteirosFiltrados = useMemo(() => {
    const filtrados = roteiros.filter(r => {
      
      // 1. Busca Geral Insensível a Acentos e Maiúsculas
      if (filtros.buscaGeral.trim()) {
        const termoNorm = normalizarTexto(filtros.buscaGeral);
        const conteudoNorm = normalizarTexto(
          `${r.titulo} ${r.tema} ${r.curso} ${r.disciplina} ${r.docente} ${r.tipoCurso} ${r.modeloComponente} ${r.descricao || ''}`
        );
        
        // Suporta busca por múltiplos termos espaçados (ex: "nutricao glicemia")
        const termos = termoNorm.split(/\s+/).filter(Boolean);
        const correspondeTodosTermos = termos.every(t => conteudoNorm.includes(t));
        
        if (!correspondeTodosTermos) return false;
      }

      // 2. Filtro de Curso (Insensível a Acentos/Caixa)
      if (filtros.curso && normalizarTexto(r.curso) !== normalizarTexto(filtros.curso)) {
        return false;
      }

      // 3. Filtro de Tipo de Curso (Presencial / Semi-presencial)
      if (filtros.tipoCurso !== 'Todos' && normalizarTexto(r.tipoCurso) !== normalizarTexto(filtros.tipoCurso)) {
        return false;
      }

      // 4. Filtro de Modelo de Componente (Básico / Específico)
      if (filtros.modeloComponente !== 'Todos' && normalizarTexto(r.modeloComponente) !== normalizarTexto(filtros.modeloComponente)) {
        return false;
      }

      // 5. Filtro de Docente / Tutor
      if (filtros.docente && normalizarTexto(r.docente) !== normalizarTexto(filtros.docente)) {
        return false;
      }

      // 6. Filtro de Unidade Curricular (Disciplina)
      if (filtros.disciplina && normalizarTexto(r.disciplina) !== normalizarTexto(filtros.disciplina)) {
        return false;
      }

      // 7. Filtro de Tema
      if (filtros.tema && normalizarTexto(r.tema) !== normalizarTexto(filtros.tema)) {
        return false;
      }

      return true;
    });

    // Ordena Alfabeticamente por Título (Aula Prática 1, Aula Prática 2, Aula Prática 3...)
    return filtrados.sort((a, b) => 
      a.titulo.localeCompare(b.titulo, 'pt-BR', { numeric: true, sensitivity: 'base' })
    );
  }, [roteiros, filtros]);

  const handleLimparFiltros = () => {
    setFiltros({
      buscaGeral: '',
      curso: '',
      tipoCurso: 'Todos',
      modeloComponente: 'Todos',
      docente: '',
      disciplina: '',
      tema: ''
    });
  };

  const handleNovoRoteiroCadastrado = (novo: Roteiro) => {
    setRoteiros(prev => [novo, ...prev]);
  };

  const handleDeletarRoteiro = async (id: string, arquivoPath?: string) => {
    await deletarRoteiro(id, arquivoPath);
    setRoteiros(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col bg-glow-radial">
      
      {/* Conteúdo Principal Ultra Limpo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Busca, Filtros e Botão Cadastrar Roteiro */}
        <FiltrosBusca
          filtros={filtros}
          opcoes={opcoesFiltros}
          onFiltroChange={setFiltros}
          onLimparFiltros={handleLimparFiltros}
          totalResultados={roteirosFiltrados.length}
          onOpenUploadModal={() => setUploadModalAberto(true)}
        />

        {/* Alternador de Modo de Visualização (Pastas x Grade) */}
        {!carregando && roteirosFiltrados.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Exibição dos Roteiros
            </span>

            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setModoVisualizacao('pastas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  modoVisualizacao === 'pastas'
                    ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Visão em Pastas (Windows)</span>
              </button>

              <button
                type="button"
                onClick={() => setModoVisualizacao('grade')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  modoVisualizacao === 'grade'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Visão em Grade (Cards)</span>
              </button>
            </div>
          </div>
        )}

        {/* Estado de Carregando */}
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-brand-400 mb-3" />
            <p className="text-sm font-medium">Carregando roteiros de aula prática...</p>
          </div>
        ) : roteirosFiltrados.length > 0 ? (
          
          modoVisualizacao === 'pastas' ? (
            /* Visualização por Pastas (Estilo Gerenciador de Arquivos) */
            <PastaRoteirosView
              roteiros={roteirosFiltrados}
              onOpenPdf={setRoteiroSelecionado}
              onDeletar={handleDeletarRoteiro}
            />
          ) : (
            /* Grid de Roteiros Encontrados em Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {roteirosFiltrados.map((roteiro) => (
                <CardRoteiro
                  key={roteiro.id}
                  roteiro={roteiro}
                  onOpenPdf={setRoteiroSelecionado}
                  onDeletar={handleDeletarRoteiro}
                />
              ))}
            </div>
          )

        ) : (

          /* Estado Sem Resultados */
          <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto border border-slate-800 my-8">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Nenhum roteiro encontrado</h3>
            <p className="text-xs text-slate-400 mb-6">
              Não encontramos nenhum roteiro com a combinação de filtros selecionada. Tente ajustar os parâmetros ou limpar a busca.
            </p>
            <button
              onClick={handleLimparFiltros}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-colors shadow-md shadow-brand-500/20"
            >
              Limpar Todos os Filtros
            </button>
          </div>

        )}

      </main>

      {/* Modal Leitor de PDF */}
      <PdfModalViewer
        roteiro={roteiroSelecionado}
        onClose={() => setRoteiroSelecionado(null)}
      />

      {/* Modal de Upload de Roteiros */}
      <UploadModal
        isOpen={uploadModalAberto}
        onClose={() => setUploadModalAberto(false)}
        onRoteiroCadastrado={handleNovoRoteiroCadastrado}
        opcoesExistentes={opcoesFiltros}
      />

    </div>
  );
};

export default App;
