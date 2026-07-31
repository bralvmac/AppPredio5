import { Roteiro } from '../types/roteiro';

// PDF demonstrativo padrão para testes instantâneos sem precisar de servidor externo
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
    docente: "Prof. Dr. Ricardo Mendonça",
    tutor: "Dra. Camila Alencar",
    descricao: "Identificação prática das cavidades cardíacas, valvas, grandes vasos e lobos pulmonares em peças anatômicas preservadas.",
    pdfUrl: SAMPLE_PDF_URL,
    duracaoMinutos: 120,
    laboratorioTipo: "Laboratório de Anatomia e Peças Úmidas",
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
    docente: "Profª. Dra. Vanessa Santos",
    tutor: "Enf. Marcos Vinícius",
    descricao: "Treinamento prático em manequins simuladores para lavagem cirúrgica das mãos, calçamento de luvas estéreis e punção de acesso venoso.",
    pdfUrl: SAMPLE_PDF_URL,
    duracaoMinutos: 180,
    laboratorioTipo: "Laboratório de Habilidades de Enfermagem",
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
    docente: "Prof. Dr. Guilherme Silveira",
    tutor: "Bioquím. Juliana Paes",
    descricao: "Medição de pH com potenciômetro digital, curvas de titulação de aminoácidos e verificação do efeito tampão fosfato e bicarbonato.",
    pdfUrl: SAMPLE_PDF_URL,
    duracaoMinutos: 90,
    laboratorioTipo: "Laboratório de Química e Bioquímica",
    dataCriacao: "2026-03-22"
  },
  {
    id: "rot-004",
    titulo: "Coloração de Gram e Identificação de Morfologia Bacteriana",
    tema: "Microbiologia Clínica Básica",
    curso: "Farmácia",
    tipoCurso: "Semi-presencial",
    modeloComponente: "Específico",
    disciplina: "Microbiologia e Imunologia",
    docente: "Profª. Dra. Helena Castro",
    tutor: "Farm. Rodrigo Lima",
    descricao: "Confecção de esfregaço, fixação em lâmina, aplicação do kit de Coloração de Gram e observação microscópica em imersão (100x).",
    pdfUrl: SAMPLE_PDF_URL,
    duracaoMinutos: 120,
    laboratorioTipo: "Laboratório de Microbiologia",
    dataCriacao: "2026-04-05"
  },
  {
    id: "rot-005",
    titulo: "Avaliação Goniométrica das Articulações do Membro Superior",
    tema: "Cinesiologia e Biomecânica Articular",
    curso: "Fisioterapia",
    tipoCurso: "Presencial",
    modeloComponente: "Específico",
    disciplina: "Cinesioterapia e Avaliação Funcional",
    docente: "Prof. Esp. Bruno Carvalho",
    tutor: "Ft. Beatriz Rocha",
    descricao: "Mensuração da amplitude de movimento (ADM) de ombro, cotovelo e punho utilizando goniômetro universal e goniômetro digital.",
    pdfUrl: SAMPLE_PDF_URL,
    duracaoMinutos: 150,
    laboratorioTipo: "Laboratório de Cinesiologia e Eletroterapia",
    dataCriacao: "2026-04-18"
  },
  {
    id: "rot-006",
    titulo: "Avaliação Antropométrica Completa e Bioimpedância Elétrica",
    tema: "Composição Corporal e Diagnóstico Nutricional",
    curso: "Nutrição",
    tipoCurso: "Semi-presencial",
    modeloComponente: "Básico",
    disciplina: "Avaliação Nutricional",
    docente: "Profª. Msc. Renata Vasconcelos",
    tutor: "Nutr. Thiago Guedes",
    descricao: "Medição de dobras cutâneas com adipômetro de Lange, perímetros corporais e realização de exame de bioimpedância octapolar.",
    pdfUrl: SAMPLE_PDF_URL,
    duracaoMinutos: 100,
    laboratorioTipo: "Laboratório de Avaliação Antropométrica",
    dataCriacao: "2026-05-02"
  }
];
