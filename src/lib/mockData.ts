import { Roteiro } from '../types/roteiro';

export const SAMPLE_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export const MOCK_ROTEIROS: Roteiro[] = [
  {
    id: "rot-001",
    titulo: "Dissecção e Identificação das Estruturas do Sistema Cardiorrespiratório",
    tema: "Anatomia do Coração e Pulmões",
    curso: "Medicina",
    tipoCurso: "Presencial",
    modeloComponente: "Básico",
    disciplina: "Anatomia Humana I",
    docente: "Prof. Dr. Ricardo Mendonça / Dra. Camila Alencar",
    descricao: "Identificação prática das cavidades cardíacas, valvas, grandes vasos e lobos pulmonares em peças anatômicas preservadas.",
    pdfUrl: SAMPLE_PDF_URL,
    dataCriacao: "2026-02-15"
  },
  {
    id: "rot-002",
    titulo: "Técnicas de Assepsia, Paramentação Cirúrgica e Punção Venosa Periférica",
    tema: "Procedimentos Fundamentais de Enfermagem",
    curso: "Enfermagem",
    tipoCurso: "Presencial",
    modeloComponente: "Específico",
    disciplina: "Fundamentos de Enfermagem II",
    docente: "Profª. Dra. Vanessa Santos / Enf. Marcos Vinícius",
    descricao: "Treinamento prático em manequins simuladores para lavagem cirúrgica das mãos, calçamento de luvas estéreis e punção de acesso venoso.",
    pdfUrl: SAMPLE_PDF_URL,
    dataCriacao: "2026-03-10"
  },
  {
    id: "rot-003",
    titulo: "Titulação Ácido-Base e Preparo de Soluções Tampão Biológicas",
    tema: "Equilíbrio Ácido-Base em Sistemas Biológicos",
    curso: "Biomedicina",
    tipoCurso: "Semi-presencial",
    modeloComponente: "Básico",
    disciplina: "Bioquímica Geral e Humana",
    docente: "Prof. Dr. Guilherme Silveira / Bioquím. Juliana Paes",
    descricao: "Medição de pH com potenciômetro digital, curvas de titulação de aminoácidos e verificação do efeito tampão fosfato e bicarbonato.",
    pdfUrl: SAMPLE_PDF_URL,
    dataCriacao: "2026-03-22"
  }
];
