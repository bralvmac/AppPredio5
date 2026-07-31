import * as pdfjsLib from 'pdfjs-dist';

// Configura o worker do PDFJS de forma resiliente
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedPdfMetadata {
  titulo: string;
  unidadeCurricular?: string; // Disciplina / Matéria
  tema?: string;
  textoCompleto: string;
}

export async function extrairMetadadosDoPdf(file: File): Promise<ExtractedPdfMetadata> {
  // 1. Título é o nome do arquivo sem a extensão .pdf
  const tituloLimpo = file.name
    .replace(/\.pdf$/i, '')
    .replace(/_/g, ' ')
    .trim();

  let textContent = '';

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Extrai o texto das 3 primeiras páginas
    const maxPages = Math.min(pdf.numPages, 3);
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      textContent += pageText + '\n';
    }
  } catch (err) {
    console.warn("Não foi possível extrair o texto interno do PDF:", err);
  }

  const resultado: ExtractedPdfMetadata = {
    titulo: tituloLimpo,
    textoCompleto: textContent
  };

  if (textContent) {
    // Busca exata para "Unidade Curricular:"
    const matchUnidade = 
      textContent.match(/Unidade\s+Curricular\s*:\s*([^\n\r;]+)/i) ||
      textContent.match(/(?:disciplina|mat[ée]ria|componente curricular)\s*:\s*([^\n\r;]+)/i);

    if (matchUnidade?.[1]) {
      resultado.unidadeCurricular = limparTexto(matchUnidade[1]);
    }

    // Busca exata para "Tema:"
    const matchTema = 
      textContent.match(/Tema\s*:\s*([^\n\r;]+)/i) ||
      textContent.match(/Tema\s+da\s+Aula\s*:\s*([^\n\r;]+)/i);

    if (matchTema?.[1]) {
      resultado.tema = limparTexto(matchTema[1]);
    }
  }

  return resultado;
}

function limparTexto(str: string): string {
  return str
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^(?:aula pr[áa]tica|tema|unidade curricular)\s*:\s*/i, '')
    .trim()
    .substring(0, 150);
}
