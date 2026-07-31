import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FiltrosBusca } from './components/FiltrosBusca';
import { CardRoteiro } from './components/CardRoteiro';
import { PdfModalViewer } from './components/PdfModalViewer';
import { UploadModal } from './components/UploadModal';
import { Roteiro, FiltrosState, OpcoesFiltros } from './types/roteiro';
import { buscarRoteiros, deletarRoteiro, supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { SearchX, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

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

  // Extrai listas únicas para popular os seletores dos filtros
  const opcoesFiltros = useMemo<OpcoesFiltros>(() => {
    const cursosSet = new Set<string>();
    const docentesSet = new Set<string>();
    const disciplinasSet = new Set<string>();
    const temasSet = new Set<string>();

    roteiros.forEach(r => {
      if (r.curso) cursosSet.add(r.curso);
      if (r.docente) docentesSet.add(r.docente);
      if (r.disciplina) disciplinasSet.add(r.disciplina);
      if (r.tema) temasSet.add(r.tema);
    });

    return {
      cursos: Array.from(cursosSet).sort(),
      docentes: Array.from(docentesSet).sort(),
      disciplinas: Array.from(disciplinasSet).sort(),
      temas: Array.from(temasSet).sort(),
    };
  }, [roteiros]);

  // Algoritmo de filtragem rápida e combinada
  const roteirosFiltrados = useMemo(() => {
    return roteiros.filter(r => {
      // 1. Busca Geral (Texto Livre)
      if (filtros.buscaGeral.trim()) {
        const termo = filtros.buscaGeral.toLowerCase();
        const textoCompleto = `${r.titulo} ${r.tema} ${r.curso} ${r.disciplina} ${r.docente} ${r.descricao || ''}`.toLowerCase();
        if (!textoCompleto.includes(termo)) return false;
      }

      // 2. Filtro de Curso
      if (filtros.curso && r.curso !== filtros.curso) return false;

      // 3. Filtro de Tipo de Curso (Presencial / Semi-presencial)
      if (filtros.tipoCurso !== 'Todos' && r.tipoCurso !== filtros.tipoCurso) return false;

      // 4. Filtro de Modelo de Componente (Básico / Específico)
      if (filtros.modeloComponente !== 'Todos' && r.modeloComponente !== filtros.modeloComponente) return false;

      // 5. Filtro de Docente / Tutor
      if (filtros.docente && r.docente !== filtros.docente) return false;

      // 6. Filtro de Unidade Curricular (Disciplina)
      if (filtros.disciplina && r.disciplina !== filtros.disciplina) return false;

      // 7. Filtro de Tema
      if (filtros.tema && r.tema !== filtros.tema) return false;

      return true;
    });
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
      
      {/* Navbar Superior com Título, Status e Botão de Cadastrar */}
      <Navbar
        totalRoteiros={roteiros.length}
        onOpenUploadModal={() => setUploadModalAberto(true)}
      />

      {/* Conteúdo Principal: Apenas Área de Busca, Filtros e Lista de Roteiros */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Componente de Filtros de Pesquisa */}
        <FiltrosBusca
          filtros={filtros}
          opcoes={opcoesFiltros}
          onFiltroChange={setFiltros}
          onLimparFiltros={handleLimparFiltros}
          totalResultados={roteirosFiltrados.length}
        />

        {/* Estado de Carregando */}
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-brand-400 mb-3" />
            <p className="text-sm font-medium">Carregando roteiros de aula prática...</p>
          </div>
        ) : roteirosFiltrados.length > 0 ? (
          
          /* Grid de Roteiros Encontrados */
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
