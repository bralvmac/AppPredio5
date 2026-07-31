export type TipoCurso = 'Presencial' | 'Semi-presencial';
export type ModeloComponente = 'Básico' | 'Específico';

export interface Roteiro {
  id: string;
  titulo: string;
  tema: string;
  curso: string;
  tipoCurso: TipoCurso;
  modeloComponente: ModeloComponente;
  disciplina: string; // Unidade Curricular
  docente: string; // Docente / Tutor
  tutor?: string;
  descricao?: string;
  pdfUrl: string;
  arquivoPath?: string;
  dataCriacao: string;
}

export interface FiltrosState {
  buscaGeral: string;
  curso: string;
  tipoCurso: string; // 'Todos' | 'Presencial' | 'Semi-presencial'
  modeloComponente: string; // 'Todos' | 'Básico' | 'Específico'
  docente: string; // Docente / Tutor
  disciplina: string; // Unidade Curricular / Matéria
  tema: string;
}

export interface OpcoesFiltros {
  cursos: string[];
  docentes: string[]; // Docentes / Tutores
  disciplinas: string[]; // Unidades Curriculares
  temas: string[];
}
