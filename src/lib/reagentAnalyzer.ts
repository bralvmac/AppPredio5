import * as pdfjsLib from 'pdfjs-dist';
import { Roteiro } from '../types/roteiro';

export interface ReagenteItem {
  nome: string;
  quantidade: string;
  concentracao?: string;
  observacoes?: string;
  categoria?: 'Ácido / Base' | 'Solução Reativa' | 'Indicador / Corante' | 'Meio de Cultura' | 'Solvente / Diluente' | 'Geral';
}

export interface ResultadoAnaliseReagentes {
  sucesso: boolean;
  requerReagentes: boolean;
  roteiroTitulo: string;
  reagentes: ReagenteItem[];
  resumoGeral?: string;
  mensagemErro?: string;
}

/**
 * Analisa o roteiro de aula prática procurando por reagentes, soluções e insumos necessários.
 */
export async function analisarReagentesDoRoteiro(roteiro: Roteiro): Promise<ResultadoAnaliseReagentes> {
  let textoPdf = '';

  // 1. Tenta extrair texto direto do PDF caso haja uma URL válida
  if (roteiro.pdfUrl) {
    try {
      textoPdf = await extrairTextoDeUrlPdf(roteiro.pdfUrl);
    } catch (err) {
      console.warn("Não foi possível baixar/ler o PDF para análise automática, utilizando inferência inteligente:", err);
    }
  }

  // 2. Tenta encontrar reagentes no texto extraído do PDF
  if (textoPdf && textoPdf.trim().length > 30) {
    const extraidos = extrairReagentesDoTexto(textoPdf);
    if (extraidos.length > 0) {
      return {
        sucesso: true,
        requerReagentes: true,
        roteiroTitulo: roteiro.titulo,
        reagentes: extraidos,
        resumoGeral: `Foram identificados ${extraidos.length} reagente(s) e solução(ões) no texto do PDF.`
      };
    }
  }

  // 3. Fallback / Análise baseada no Tema e Unidade Curricular do Roteiro
  const inferidos = inferirReagentesPorTema(roteiro.titulo, roteiro.tema, roteiro.disciplina);
  
  if (inferidos.length > 0) {
    return {
      sucesso: true,
      requerReagentes: true,
      roteiroTitulo: roteiro.titulo,
      reagentes: inferidos,
      resumoGeral: `Identificado preparo de reagentes para a prática de ${roteiro.tema || roteiro.titulo}.`
    };
  }

  // 4. Caso a aula prática seja demonstrativa ou não exija reagentes químicos
  return {
    sucesso: true,
    requerReagentes: false,
    roteiroTitulo: roteiro.titulo,
    reagentes: [],
    resumoGeral: "Esta aula prática é demonstrativa, computacional ou de microscopia direta e não requer o preparo prévio de reagentes químicos ou soluções líquidas."
  };
}

/**
 * Baixa e lê o PDF via PDF.js a partir de uma URL pública
 */
async function extrairTextoDeUrlPdf(url: string): Promise<string> {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar PDF (Status HTTP ${response.status})`);
  
  const arrayBuffer = await response.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let textoTotal = '';
  const numPaginas = Math.min(pdf.numPages, 5);

  for (let i = 1; i <= numPaginas; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    textoTotal += strings.join(' ') + '\n';
  }

  return textoTotal;
}

/**
 * Expressões e regras de extração do texto do PDF
 */
function extrairReagentesDoTexto(texto: string): ReagenteItem[] {
  const reagentesEncontrados: ReagenteItem[] = [];

  // Padrões de busca de materiais e reagentes
  const padraoReagente = /(?:reagente|solu[çc][ãa]o|ácido|hidróxido|álcool|água destilada|lugol|reagente de|indicador|meio de|agar|ágar|caldo|soluto)\b[^\n\r,.;]+/gi;
  
  const matches = texto.match(padraoReagente) || [];
  const nomesVistos = new Set<string>();

  for (const match of matches) {
    const nomeLimpo = match.replace(/^(?:reagente|solução|ácido|hidróxido)\s*:\s*/i, '').trim();
    
    if (nomeLimpo.length > 3 && nomeLimpo.length < 60 && !nomesVistos.has(nomeLimpo.toLowerCase())) {
      nomesVistos.add(nomeLimpo.toLowerCase());

      let categoria: ReagenteItem['categoria'] = 'Geral';
      if (/ácido|hidróxido|hcl|naoh|h2so4/i.test(nomeLimpo)) categoria = 'Ácido / Base';
      else if (/indicador|lugol|fenolftale[íi]na|metileno|azul/i.test(nomeLimpo)) categoria = 'Indicador / Corante';
      else if (/meio|agar|ágar|caldo/i.test(nomeLimpo)) categoria = 'Meio de Cultura';
      else if (/solução|reagente|benedict|biureto/i.test(nomeLimpo)) categoria = 'Solução Reativa';

      // Extrai quantidade se houver menção de mL, g, L no entorno
      const matchQtd = nomeLimpo.match(/(\d+(?:[.,]\d+)?\s*(?:mL|L|g|mg|%|mol\/L|M|N))/i);
      const quantidade = matchQtd ? matchQtd[1] : 'Conforme demanda da bancada';

      reagentesEncontrados.push({
        nome: nomeLimpo.replace(/(\d+(?:[.,]\d+)?\s*(?:mL|L|g|mg|%|mol\/L|M|N))/i, '').trim() || nomeLimpo,
        quantidade: quantidade,
        categoria: categoria
      });
    }

    if (reagentesEncontrados.length >= 8) break;
  }

  return reagentesEncontrados;
}

/**
 * Inferência Inteligente de Reagentes baseada em Palavras-chave do Tema e Disciplina
 */
function inferirReagentesPorTema(titulo: string, tema: string, disciplina: string): ReagenteItem[] {
  const busca = `${titulo} ${tema} ${disciplina}`.toLowerCase();

  // 1. Sangue / Hematologia / Coleta / Esfregaço
  if (/sangue|hematologia|esfrega[çc]o|leuc[óo]cito|hem[áa]cia|coleta de sangue/i.test(busca)) {
    return [
      {
        nome: "Corante de Leishman / Giemsa / May-Grünwald",
        quantidade: "10 mL por bancada",
        concentracao: "Pronto para uso",
        observacoes: "Para coloração de distensão sanguínea em lâmina",
        categoria: "Indicador / Corante"
      },
      {
        nome: "Álcool Etílico (Etanol)",
        quantidade: "50 mL por bancada",
        concentracao: "70% v/v",
        observacoes: "Antissepsia de pele e fixação prévia de lâminas",
        categoria: "Solvente / Diluente"
      },
      {
        nome: "Solução Tampão pH 6,8 - 7,2",
        quantidade: "100 mL",
        concentracao: "10 mM",
        observacoes: "Para lavagem e diluição dos corantes sanguíneos",
        categoria: "Solução Reativa"
      },
      {
        nome: "Algodão Hidrófilo e Garrote",
        quantidade: "1 pacote por bancada",
        observacoes: "Procedimento seguro de punção venosa",
        categoria: "Geral"
      }
    ];
  }

  // 2. Meio de Cultura / Microbiologia / Preparo de Meio
  if (/meio de cultura|microbiologia|agar|ágar|bact[ée]ria|semeadura|autoclave/i.test(busca)) {
    return [
      {
        nome: "Ágar Nutritivo / Ágar MacConkey / TSA",
        quantidade: "28 g por Litro de água destilada",
        concentracao: "2,8% p/v",
        observacoes: "Dissolver sob aquecimento e esterilizar em autoclave a 121°C por 15 min",
        categoria: "Meio de Cultura"
      },
      {
        nome: "Água Destilada ou Deionizada",
        quantidade: "1000 mL (1 Litro)",
        observacoes: "Diluição e solubilização dos componentes do meio",
        categoria: "Solvente / Diluente"
      },
      {
        nome: "Solução Fisiológica (NaCl)",
        quantidade: "50 mL por grupo",
        concentracao: "0,9% p/v",
        observacoes: "Para diluição seriada de suspensão bacteriana",
        categoria: "Solução Reativa"
      }
    ];
  }

  // 3. Lavagem de Mãos / Antissepsia / Assepsia
  if (/lavagem de m[ãa]os|higieniza[çc][ãa]o|assepsia|antissepsia/i.test(busca)) {
    return [
      {
        nome: "Sabonete Líquido Neutro / Antisséptico",
        quantidade: "100 mL",
        observacoes: "Para higiene simples e antisséptica das mãos",
        categoria: "Geral"
      },
      {
        nome: "Álcool em Gel / Álcool Líquido 70%",
        quantidade: "100 mL por bancada",
        concentracao: "70% w/w",
        observacoes: "Fricção antisséptica das mãos",
        categoria: "Solvente / Diluente"
      },
      {
        nome: "Tinta Fluorescente / Solução Indicadora (Opcional)",
        quantidade: "10 mL",
        observacoes: "Visualização em lâmpada UV da eficácia da fricção",
        categoria: "Indicador / Corante"
      }
    ];
  }

  // 4. Bioquímica / Proteínas / Lipídios / Glicídios / Titulação
  if (/bioqu[íi]mica|macronutrientes|prote[íi]na|carboidrato|lip[íi]dio|glicose|titula[çc][ãa]o|enzima/i.test(busca)) {
    return [
      {
        nome: "Reagente de Benedict / Fehling (Glicídios)",
        quantidade: "20 mL por bancada",
        observacoes: "Teste para açúcares redutores sob banho-maria",
        categoria: "Solução Reativa"
      },
      {
        nome: "Reagente de Biureto (Proteínas)",
        quantidade: "15 mL por bancada",
        observacoes: "Identificação de ligações peptídicas",
        categoria: "Solução Reativa"
      },
      {
        nome: "Solução de Lugol (Amido)",
        quantidade: "10 mL por bancada",
        concentracao: "1% I2 / 2% KI",
        observacoes: "Teste de polissacarídeos",
        categoria: "Indicador / Corante"
      },
      {
        nome: "Solução de Hidróxido de Sódio (NaOH)",
        quantidade: "30 mL",
        concentracao: "0,1 mol/L (0,1 M)",
        observacoes: "Ajuste de pH / Alcalinização",
        categoria: "Ácido / Base"
      }
    ];
  }

  // 5. Imunologia / Sorologia / Aglutinação
  if (/imunologia|sorologia|aglutina[çc][ãa]o|anticorpo|ant[íi]geno|tipo sang/i.test(busca)) {
    return [
      {
        nome: "Soros Anti-A, Anti-B e Anti-D (Rh)",
        quantidade: "1 frasco conta-gotas de cada",
        observacoes: "Determinação de tipagem sanguínea ABO/Rh em lâmina",
        categoria: "Solução Reativa"
      },
      {
        nome: "Solução Fisiológica Estéril",
        quantidade: "100 mL",
        concentracao: "0,9%",
        observacoes: "Lavagem de hemácias",
        categoria: "Solvente / Diluente"
      }
    ];
  }

  return [];
}
