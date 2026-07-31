export type TipoCurso = 'Presencial' | 'Semi-presencial';
export type ModeloComponente = 'Básico' | 'Específico';

export interface Roteiro {
  id: string;
  titulo: string;
  tema: string;
  curso: string;
  tipoCurso: TipoCurso;
  modeloComponente: ModeloComponente;
  disciplina: string;
  docente: string;
  tutor: string;
  descricao?: string;
  pdfUrl: string;
  arquivoPath?: string;
  duracaoMinutos?: number;
  laboratorioTipo?: string;
  dataCriacao: string;
}

export interface FiltrosState {
  buscaGeral: string;
  curso: string;
  tipoCurso: string; // 'Todos' | 'Presencial' | 'Semi-presencial'
  modeloComponente: string; // 'Todos' | 'Básico' | 'Específico'
  docente: string;
  tutor: string;
  disciplina: string;
  tema: string;
}

export interface OpcoesFiltros {
  cursos: string[];
  docentes: string[];
  tutores: string[];
  disciplinas: string[];
  temas: string[];
}
