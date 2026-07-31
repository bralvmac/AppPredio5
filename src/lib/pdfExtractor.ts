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
    // 2. Extração da Unidade Curricular
    const matchUnidade = 
      textContent.match(/Unidade\s+Curricular\s*:\s*([^\n\r]+)/i) ||
      textContent.match(/Componente\s+Curricular\s*:\s*([^\n\r]+)/i) ||
      textContent.match(/(?:disciplina|mat[ée]ria)\s*:\s*([^\n\r]+)/i);

    if (matchUnidade?.[1]) {
      resultado.unidadeCurricular = isolarValorCampo(matchUnidade[1]);
    }

    // 3. Extração do Tema da Aula
    const matchTema = 
      textContent.match(/Tema\s*:\s*([^\n\r]+)/i) ||
      textContent.match(/Tema\s+da\s+Aula\s*:\s*([^\n\r]+)/i);

    if (matchTema?.[1]) {
      resultado.tema = isolarValorCampo(matchTema[1]);
    }
  }

  return resultado;
}

/**
 * Isola estritamente o valor do campo interrompendo assim que encontrar
 * delimitadores conhecidos de seções seguintes como "Tema:", "Aula Prática:", "COMPETÊNCIAS", etc.
 */
function isolarValorCampo(textoBruto: string): string {
  if (!textoBruto) return '';

  // Interrompe o texto antes de seções como "Tema:", "Aula Prática", "COMPETÊNCIAS", "Unidade Curricular:", etc.
  const textoCortado = textoBruto.split(/\s+(?:Tema\s*:|Aula\s+Pr[áa]tica|COMPET[ÊE]NCIAS|Unidade\s+Curricular\s*:|OBJETIV|INTRODU|DESCRIT|MATERIA|EQUIPAM|PROCEDIM|1\.)/i)[0];

  return textoCortado
    .replace(/^[\s:–-]+/, '')
    .replace(/[\s:–-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}
