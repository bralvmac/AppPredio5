import React, { useState } from 'react';
import { Search, Filter, X, RefreshCw, GraduationCap, BookOpen, Layers, Monitor, Building2, User } from 'lucide-react';
import { FiltrosState, OpcoesFiltros } from '../types/roteiro';

interface FiltrosBuscaProps {
  filtros: FiltrosState;
  opcoes: OpcoesFiltros;
  onFiltroChange: (novosFiltros: FiltrosState) => void;
  onLimparFiltros: () => void;
  totalResultados: number;
}

export const FiltrosBusca: React.FC<FiltrosBuscaProps> = ({
  filtros,
  opcoes,
  onFiltroChange,
  onLimparFiltros,
  totalResultados
}) => {
  const [expandidoMobile, setExpandidoMobile] = useState<boolean>(false);

  const temFiltrosAtivos = 
    filtros.buscaGeral !== '' ||
    filtros.curso !== '' ||
    filtros.tipoCurso !== 'Todos' ||
    filtros.modeloComponente !== 'Todos' ||
    filtros.docente !== '' ||
    filtros.disciplina !== '' ||
    filtros.tema !== '';

  const handleCampoChange = (campo: keyof FiltrosState, valor: string) => {
    onFiltroChange({
      ...filtros,
      [campo]: valor
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 mb-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
      
      {/* Brilho decorativo no topo */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      {/* Linha Superior: Busca Textual + Ações */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        
        {/* Input de Pesquisa Global */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={filtros.buscaGeral}
            onChange={(e) => handleCampoChange('buscaGeral', e.target.value)}
            placeholder="Buscar por palavra-chave, tema, unidade curricular, docente ou curso..."
            className="block w-full pl-11 pr-10 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-inner"
          />
          {filtros.buscaGeral && (
            <button
              onClick={() => handleCampoChange('buscaGeral', '')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Botões de Ação Rápida no Mobile e Desktop */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          
          <button
            onClick={() => setExpandidoMobile(!expandidoMobile)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              expandidoMobile || temFiltrosAtivos
                ? 'bg-slate-800 border-brand-500/40 text-brand-400'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros {temFiltrosAtivos && '✦'}</span>
          </button>

          {temFiltrosAtivos && (
            <button
              onClick={onLimparFiltros}
              className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all"
              title="Limpar todos os filtros"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}

          <div className="px-3.5 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 font-medium whitespace-nowrap">
            <span className="text-emerald-400 font-bold text-sm mr-1">{totalResultados}</span>
            {totalResultados === 1 ? 'roteiro' : 'roteiros'}
          </div>

        </div>

      </div>

      {/* Grid de Filtros Avançados */}
      <div className={`mt-5 pt-5 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
        expandidoMobile ? 'block' : 'hidden md:grid'
      }`}>

        {/* 1. Seleção de Curso */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Curso
          </label>
          <select
            value={filtros.curso}
            onChange={(e) => handleCampoChange('curso', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="">Todos os Cursos</option>
            {opcoes.cursos.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* 2. Seleção de Unidade Curricular (Disciplina) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            Unidade Curricular (Disciplina)
          </label>
          <select
            value={filtros.disciplina}
            onChange={(e) => handleCampoChange('disciplina', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="">Todas as Unidades Curriculares</option>
            {opcoes.disciplinas.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* 3. Seleção de Docente / Tutor (Unificados) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Docente / Tutor
          </label>
          <select
            value={filtros.docente}
            onChange={(e) => handleCampoChange('docente', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="">Todos os Docentes / Tutores</option>
            {opcoes.docentes.map((doc) => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
        </div>

        {/* 4. Tipo de Curso (Modalidade: Presencial / Semi-presencial) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Tipo de Curso
          </label>
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            {['Todos', 'Presencial', 'Semi-presencial'].map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => handleCampoChange('tipoCurso', tipo)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  filtros.tipoCurso === tipo
                    ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Modelo do Componente (Básico / Específico) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            Modelo do Componente
          </label>
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            {['Todos', 'Básico', 'Específico'].map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => handleCampoChange('modeloComponente', mod)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  filtros.modeloComponente === mod
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Tema da Aula Prática */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-teal-400" />
            Tema da Aula Prática
          </label>
          <select
            value={filtros.tema}
            onChange={(e) => handleCampoChange('tema', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="">Todos os Temas</option>
            {opcoes.temas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
};
