import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw, PlusCircle, FolderTree } from 'lucide-react';
import { FiltrosState, OpcoesFiltros, TipoCurso, ModeloComponente } from '../types/roteiro';

interface FiltrosBuscaProps {
  filtros: FiltrosState;
  opcoes: OpcoesFiltros;
  onFiltroChange: (novosFiltros: FiltrosState) => void;
  onLimparFiltros: () => void;
  totalResultados: number;
  onOpenUploadModal: () => void;
}

export const FiltrosBusca: React.FC<FiltrosBuscaProps> = ({
  filtros,
  opcoes,
  onFiltroChange,
  onLimparFiltros,
  totalResultados,
  onOpenUploadModal
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const temFiltrosAtivos = 
    Boolean(filtros.buscaGeral) ||
    Boolean(filtros.curso) ||
    filtros.tipoCurso !== 'Todos' ||
    filtros.modeloComponente !== 'Todos' ||
    Boolean(filtros.docente) ||
    Boolean(filtros.disciplina) ||
    Boolean(filtros.tema);

  return (
    <div className="space-y-4 mb-6 animate-fade-in">
      
      {/* Linha Superior: Busca + Botão Filtros + Botão Cadastrar Roteiro */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        
        {/* Input de Busca Geral */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por palavra-chave, tema, unidade curricular, docente ou curso..."
            value={filtros.buscaGeral}
            onChange={(e) => onFiltroChange({ ...filtros, buscaGeral: e.target.value })}
            className="w-full pl-11 pr-10 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-inner"
          />
          {filtros.buscaGeral && (
            <button
              onClick={() => onFiltroChange({ ...filtros, buscaGeral: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botão de Toggle para Mostrar/Esconder Filtros */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
            mostrarFiltros || temFiltrosAtivos
              ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtros</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
            {totalResultados}
          </span>
        </button>

        {/* Botão + Cadastrar Roteiro Integrado */}
        <button
          onClick={onOpenUploadModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-teal-400 hover:from-brand-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-brand-500/20 transition-all shrink-0 cursor-pointer w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Roteiro</span>
        </button>

      </div>

      {/* Painel Expansível de Filtros Combinados */}
      {mostrarFiltros && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 animate-fade-in shadow-xl">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Filtro por Curso */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Curso
              </label>
              <select
                value={filtros.curso}
                onChange={(e) => onFiltroChange({ ...filtros, curso: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Todos os Cursos</option>
                {opcoes.cursos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 2. Filtro por Unidade Curricular */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Unidade Curricular (Disciplina)
              </label>
              <select
                value={filtros.disciplina}
                onChange={(e) => onFiltroChange({ ...filtros, disciplina: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Todas as Unidades Curriculares</option>
                {opcoes.disciplinas.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 3. Filtro por Docente / Tutor */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Docente / Tutor
              </label>
              <select
                value={filtros.docente}
                onChange={(e) => onFiltroChange({ ...filtros, docente: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Todos os Docentes / Tutores</option>
                {opcoes.docentes.map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>

            {/* 4. Filtro por Tipo de Curso */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Tipo de Curso
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                {(['Todos', 'Presencial', 'Semi-presencial'] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => onFiltroChange({ ...filtros, tipoCurso: tipo })}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all ${
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

            {/* 5. Filtro por Modelo de Componente */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Modelo Componente
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                {(['Todos', 'Básico', 'Específico'] as const).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => onFiltroChange({ ...filtros, modeloComponente: mod })}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all ${
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

            {/* 6. Filtro por Tema da Aula */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Tema da Aula Prática
              </label>
              <select
                value={filtros.tema}
                onChange={(e) => onFiltroChange({ ...filtros, tema: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Todos os Temas</option>
                {opcoes.temas.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Linha de Limpeza de Filtros se Houver algum ativo */}
          {temFiltrosAtivos && (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Filtros ativos aplicados na busca</span>
              <button
                onClick={onLimparFiltros}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
