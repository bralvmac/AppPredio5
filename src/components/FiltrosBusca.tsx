import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw, PlusCircle, Sun, Moon, FlaskConical } from 'lucide-react';
import { FiltrosState, OpcoesFiltros } from '../types/roteiro';

interface FiltrosBuscaProps {
  filtros: FiltrosState;
  opcoes: OpcoesFiltros;
  onFiltroChange: (novosFiltros: FiltrosState) => void;
  onLimparFiltros: () => void;
  totalResultados: number;
  onOpenUploadModal: () => void;
  onOpenRelatorioGeralReagentes: () => void;
  tema: 'dark' | 'light';
  onToggleTema: () => void;
}

export const FiltrosBusca: React.FC<FiltrosBuscaProps> = ({
  filtros,
  opcoes,
  onFiltroChange,
  onLimparFiltros,
  totalResultados,
  onOpenUploadModal,
  onOpenRelatorioGeralReagentes,
  tema,
  onToggleTema
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

  const isDark = tema === 'dark';

  return (
    <div className="space-y-4 mb-6 animate-fade-in">
      
      {/* Linha Superior: Busca + Botão Filtros + Botão Tema + Botão Todos Reagentes + Botão Cadastrar Roteiro */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        
        {/* Input de Busca Geral */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por palavra-chave, tema, unidade curricular, docente ou curso..."
            value={filtros.buscaGeral}
            onChange={(e) => onFiltroChange({ ...filtros, buscaGeral: e.target.value })}
            className={`w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
              isDark
                ? 'bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-400'
                : 'bg-white border border-slate-300 text-slate-950 placeholder-slate-500 shadow-sm'
            }`}
          />
          {filtros.buscaGeral && (
            <button
              onClick={() => onFiltroChange({ ...filtros, buscaGeral: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grupo de Botões Principais */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          
          {/* Botão de Toggle de Filtros */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl border text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
              mostrarFiltros || temFiltrosAtivos
                ? 'bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-500/30'
                : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
            }`}>
              {totalResultados}
            </span>
          </button>

          {/* Botão Alternador de Tema (Claro / Escuro) */}
          <button
            type="button"
            onClick={onToggleTema}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-amber-600 hover:bg-slate-100'
            }`}
            title={isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Botão NOVO: 🧪 Todos os Reagentes (ao lado de Cadastrar Roteiro) */}
          <button
            onClick={onOpenRelatorioGeralReagentes}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-sm shrink-0 cursor-pointer border"
            style={
              isDark
                ? { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }
                : { backgroundColor: '#fef3c7', color: '#78350f', borderColor: '#fde68a' }
            }
            title="Relatório Geral de Reagentes do Laboratório"
          >
            <FlaskConical className="w-4 h-4 shrink-0" />
            <span>Todos os Reagentes</span>
          </button>

          {/* Botão Cadastrar Roteiro */}
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-brand-500 to-teal-400 hover:from-brand-400 hover:to-teal-300 transition-all shadow-md shadow-brand-500/20 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Roteiro</span>
          </button>

        </div>

      </div>

      {/* Painel Expansível de Filtros Avançados */}
      {mostrarFiltros && (
        <div className={`p-4 rounded-2xl border transition-all animate-fade-in ${
          isDark
            ? 'glass-panel border-slate-800'
            : 'bg-white border-slate-300 text-slate-900 shadow-md'
        }`}>
          
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className={`text-xs font-extrabold uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-900'
            }`}>
              Filtros Avançados
            </span>

            {temFiltrosAtivos && (
              <button
                onClick={onLimparFiltros}
                className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400 font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* 1. Curso */}
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${
                isDark ? 'text-slate-400' : 'text-slate-900'
              }`}>
                Curso
              </label>
              <select
                value={filtros.curso}
                onChange={(e) => onFiltroChange({ ...filtros, curso: e.target.value })}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-slate-100 border border-slate-300 text-slate-950 font-extrabold'
                }`}
              >
                <option value="">Todos os Cursos</option>
                {opcoes.cursos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 2. Modalidade / Tipo de Curso */}
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${
                isDark ? 'text-slate-400' : 'text-slate-900'
              }`}>
                Modalidade
              </label>
              <select
                value={filtros.tipoCurso}
                onChange={(e) => onFiltroChange({ ...filtros, tipoCurso: e.target.value as any })}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-slate-100 border border-slate-300 text-slate-950 font-extrabold'
                }`}
              >
                <option value="Todos">Todas as Modalidades</option>
                <option value="Presencial">Presencial</option>
                <option value="Semi-presencial">Semi-presencial</option>
              </select>
            </div>

            {/* 3. Modelo do Componente */}
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${
                isDark ? 'text-slate-400' : 'text-slate-900'
              }`}>
                Modelo
              </label>
              <select
                value={filtros.modeloComponente}
                onChange={(e) => onFiltroChange({ ...filtros, modeloComponente: e.target.value as any })}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-slate-100 border border-slate-300 text-slate-950 font-extrabold'
                }`}
              >
                <option value="Todos">Todos os Modelos</option>
                <option value="Básico">Básico</option>
                <option value="Específico">Específico</option>
              </select>
            </div>

            {/* 4. Unidade Curricular (Disciplina) */}
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${
                isDark ? 'text-slate-400' : 'text-slate-900'
              }`}>
                Unidade Curricular
              </label>
              <select
                value={filtros.disciplina}
                onChange={(e) => onFiltroChange({ ...filtros, disciplina: e.target.value })}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-slate-100 border border-slate-300 text-slate-950 font-extrabold'
                }`}
              >
                <option value="">Todas as Unidades</option>
                {opcoes.disciplinas.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 5. Tema da Aula */}
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${
                isDark ? 'text-slate-400' : 'text-slate-900'
              }`}>
                Tema da Aula
              </label>
              <select
                value={filtros.tema}
                onChange={(e) => onFiltroChange({ ...filtros, tema: e.target.value })}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-slate-100 border border-slate-300 text-slate-950 font-extrabold'
                }`}
              >
                <option value="">Todos os Temas</option>
                {opcoes.temas.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 6. Docente / Tutor */}
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${
                isDark ? 'text-slate-400' : 'text-slate-900'
              }`}>
                Docente / Tutor
              </label>
              <select
                value={filtros.docente}
                onChange={(e) => onFiltroChange({ ...filtros, docente: e.target.value })}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-slate-100 border border-slate-300 text-slate-950 font-extrabold'
                }`}
              >
                <option value="">Todos os Docentes</option>
                {opcoes.docentes.map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
