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
      
      let pageStr = '';
      for (let j = 0; j < content.items.length; j++) {
        const item = content.items[j] as any;
        const prevItem = j > 0 ? (content.items[j - 1] as any) : null;

        if (prevItem && prevItem.str && item.str) {
          const prevEndsAlpha = /[a-zA-Záéíóúâêîôûãõç]$/.test(prevItem.str);
          const currStartsAlpha = /^[a-zA-Záéíóúâêîôûãõç]/.test(item.str);

          // Se forem pedaços da mesma palavra recortados pelo PDF, junta sem espaço extra
          if (prevEndsAlpha && currStartsAlpha && !prevItem.str.endsWith(' ') && !item.str.startsWith(' ')) {
            pageStr += item.str;
            continue;
          }
        }

        const precisaEspaco = pageStr.length > 0 && !pageStr.endsWith(' ') && !item.str.startsWith(' ');
        pageStr += (precisaEspaco ? ' ' : '') + item.str;
      }

      textContent += pageStr + '\n';
    }
  } catch (err) {
    console.warn("Não foi possível extrair o texto interno do PDF:", err);
  }

  // Aplica correção inteligente de quebras de palavras
  const textoTratado = corrigirEspacosPDF(textContent);

  const resultado: ExtractedPdfMetadata = {
    titulo: tituloLimpo,
    textoCompleto: textoTratado
  };

  if (textoTratado) {
    // 2. Extração da Unidade Curricular
    const matchUnidade = 
      textoTratado.match(/Unidade\s+Curricular\s*:\s*([^\n\r]+)/i) ||
      textoTratado.match(/Componente\s+Curricular\s*:\s*([^\n\r]+)/i) ||
      textoTratado.match(/(?:disciplina|mat[ée]ria)\s*:\s*([^\n\r]+)/i);

    if (matchUnidade?.[1]) {
      resultado.unidadeCurricular = isolarValorCampo(matchUnidade[1]);
    }

    // 3. Extração do Tema da Aula
    const matchTema = 
      textoTratado.match(/Tema\s*:\s*([^\n\r]+)/i) ||
      textoTratado.match(/Tema\s+da\s+Aula\s*:\s*([^\n\r]+)/i);

    if (matchTema?.[1]) {
      resultado.tema = isolarValorCampo(matchTema[1]);
    }
  }

  return resultado;
}

/**
 * Corrige quebras de palavras e espaços parasitas causados por fontes/glifos de PDF.
 */
function corrigirEspacosPDF(texto: string): string {
  if (!texto) return '';

  let limpo = texto;

  // 1. Remove quebras de linha com hífen (ex: "nutri-\nentes" -> "nutrientes")
  limpo = limpo.replace(/(\w+)-\s*[\r\n]+\s*(\w+)/g, '$1$2');

  // 2. Correções conhecidas de fragmentos de palavras acadêmicas/científicas
  const correcoesEspecifcas: [RegExp, string][] = [
    [/Macron\s*u\s*trientes/gi, 'Macronutrientes'],
    [/Micron\s*u\s*trientes/gi, 'Micronutrientes'],
    [/Microb\s*iologia/gi, 'Microbiologia'],
    [/Ateroscler\s*ose/gi, 'Aterosclerose'],
    [/Nutric\s*ionais/gi, 'Nutricionais'],
    [/Cardiorresp\s*irat[óo]ria/gi, 'Cardiorrespiratória'],
    [/Histopat\s*ol[óo]gicos/gi, 'Histopatológicos'],
    [/Bioqu\s*[íi]mica/gi, 'Bioquímica'],
    [/Fisiot\s*erapia/gi, 'Fisioterapia'],
    [/Enferm\s*agem/gi, 'Enfermagem'],
    [/Biomed\s*icina/gi, 'Biomedicina'],
    [/Farm\s*[áa]cia/gi, 'Farmácia']
  ];

  for (const [regex, substituicao] of correcoesEspecifcas) {
    limpo = limpo.replace(regex, substituicao);
  }

  return limpo;
}

/**
 * Isola estritamente o valor do campo interrompendo assim que encontrar
 * delimitadores conhecidos de seções seguintes como "Tema:", "Aula Prática:", "COMPETÊNCIAS", etc.
 */
function isolarValorCampo(textoBruto: string): string {
  if (!textoBruto) return '';

  // Interrompe o texto antes de seções como "Tema:", "Aula Prática", "COMPETÊNCIAS", "Unidade Curricular:", etc.
  const textoCortado = textoBruto.split(/\s+(?:Tema\s*:|Aula\s+Pr[áa]tica|COMPET[ÊE]NCIAS|Unidade\s+Curricular\s*:|OBJETIV|INTRODU|DESCRIT|MATERIA|EQUIPAM|PROCEDIM|1\.)/i)[0];

  const resultado = textoCortado
    .replace(/^[\s:–-]+/, '')
    .replace(/[\s:–-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  return corrigirEspacosPDF(resultado);
}
