import * as pdfjsLib from 'pdfjs-dist';
import { TipoCurso, ModeloComponente } from '../types/roteiro';

// Configura o worker do PDFJS de forma resiliente
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedPdfMetadata {
  titulo?: string;
  tema?: string;
  curso?: string;
  tipoCurso?: TipoCurso;
  modeloComponente?: ModeloComponente;
  disciplina?: string;
  docente?: string;
  tutor?: string;
  descricao?: string;
  duracaoMinutos?: number;
  laboratorioTipo?: string;
  textoCompleto: string;
}

export async function extrairMetadadosDoPdf(file: File): Promise<ExtractedPdfMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Carrega o documento PDF
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textContent = '';

  // Extrai o texto das 3 primeiras páginas (onde ficam os cabeçalhos e metadados)
  const maxPages = Math.min(pdf.numPages, 4);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    textContent += pageText + '\n';
  }

  const linhas = textContent.split('\n').map(l => l.trim()).filter(Boolean);
  const textoUnificado = textContent.replace(/\s+/g, ' ');

  const resultado: ExtractedPdfMetadata = {
    textoCompleto: textContent
  };

  // 1. Identificação do Curso
  const cursosConhecidos = [
    'Medicina Veterinária', 'Medicina', 'Enfermagem', 'Biomedicina', 
    'Farmácia', 'Fisioterapia', 'Nutrição', 'Odontologia', 
    'Educação Física', 'Psicologia', 'Engenharia Civil', 'Engenharia'
  ];
  for (const curso of cursosConhecidos) {
    if (new RegExp(`\\b${curso}\\b`, 'i').test(textoUnificado)) {
      resultado.curso = curso;
      break;
    }
  }

  // 2. Identificação do Tipo de Curso (Modalidade)
  if (/semi[- ]?presencial/i.test(textoUnificado)) {
    resultado.tipoCurso = 'Semi-presencial';
  } else if (/presencial/i.test(textoUnificado)) {
    resultado.tipoCurso = 'Presencial';
  }

  // 3. Identificação do Modelo do Componente
  if (/espec[íi]fico/i.test(textoUnificado)) {
    resultado.modeloComponente = 'Específico';
  } else if (/b[áa]sico/i.test(textoUnificado)) {
    resultado.modeloComponente = 'Básico';
  }

  // 4. Identificação da Disciplina / Matéria
  const matchDisciplina = 
    textoUnificado.match(/(?:disciplina|mat[ée]ria|componente curricular)\s*:\s*([^;.\n]+)/i) ||
    textoUnificado.match(/(?:disciplina|mat[ée]ria)\s*[-–]\s*([^;.\n]+)/i);
  if (matchDisciplina?.[1]) {
    resultado.disciplina = limparTexto(matchDisciplina[1]);
  }

  // 5. Identificação do Tema
  const matchTema = 
    textoUnificado.match(/(?:tema|assunto|t[íi]tulo da aula)\s*:\s*([^;.\n]+)/i) ||
    textoUnificado.match(/(?:aula pr[áa]tica)\s*[:–-]\s*([^;.\n]+)/i);
  if (matchTema?.[1]) {
    resultado.tema = limparTexto(matchTema[1]);
  }

  // 6. Identificação do Docente
  const matchDocente = 
    textoUnificado.match(/(?:docente|professor|profª?\.?|respons[áa]vel)\s*:\s*([^;.\n]+)/i);
  if (matchDocente?.[1]) {
    resultado.docente = limparTexto(matchDocente[1]);
  }

  // 7. Identificação do Tutor
  const matchTutor = 
    textoUnificado.match(/(?:tutor|tutora|tutoria)\s*:\s*([^;.\n]+)/i);
  if (matchTutor?.[1]) {
    resultado.tutor = limparTexto(matchTutor[1]);
  }

  // 8. Título do Roteiro (se não achou o tema explicitamente, usa a primeira frase marcante)
  const matchTitulo = 
    textoUnificado.match(/(?:roteiro de aula pr[áa]tica|roteiro)\s*[:–-]?\s*([^;.\n]+)/i) ||
    textoUnificado.match(/(?:pr[áa]tica)\s*[:–-]\s*([^;.\n]+)/i);
  if (matchTitulo?.[1]) {
    resultado.titulo = limparTexto(matchTitulo[1]);
  } else if (resultado.tema) {
    resultado.titulo = `Roteiro Prático: ${resultado.tema}`;
  } else if (linhas.length > 0) {
    resultado.titulo = linhas[0].substring(0, 100);
  }

  // 9. Laboratório Exigido
  const matchLab = textoUnificado.match(/(?:laborat[óo]rio|lab)\s*:\s*([^;.\n]+)/i);
  if (matchLab?.[1]) {
    resultado.laboratorioTipo = limparTexto(matchLab[1]);
  }

  // 10. Duração Estimada em minutos
  const matchMinutos = textoUnificado.match(/(\d+)\s*(?:min|minutos|horas|h)/i);
  if (matchMinutos?.[1]) {
    let valor = parseInt(matchMinutos[1], 10);
    if (textoUnificado.includes('h') && valor <= 8) valor = valor * 60;
    resultado.duracaoMinutos = valor;
  }

  return resultado;
}

function limparTexto(str: string): string {
  return str
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 120);
}
