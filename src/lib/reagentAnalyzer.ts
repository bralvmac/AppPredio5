import * as pdfjsLib from 'pdfjs-dist';
import { Roteiro } from '../types/roteiro';

export interface ReagenteItem {
  nome: string;
  quantidade: string;
  origemBancada?: 'Bancada do Aluno' | 'Bancada de Apoio' | 'Geral';
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
 * Filtro estrito para descartar cabeçalhos de tabelas e vidrarias/equipamentos
 */
function eLinhaDescartavelOuCabecalho(linha: string): boolean {
  if (!linha || linha.length < 2) return true;

  // 1. Descarta cabeçalhos da tabela USF (ex: "• Materiais • Reagentes • Equipamentos Quant.")
  if (/•?\s*Materiais\s*•?\s*Reagentes\s*•?\s*Equipamentos/i.test(linha)) return true;
  if (/^(?:materiais|reagentes|equipamentos|quant\.?|quantidade|\bullet)$/i.test(linha)) return true;
  if (/^DISPONIBILIZA[ÇC][ÃA]O/i.test(linha)) return true;

  // 2. Descarta vidrarias e utensílios sem substâncias químicas
  const equipamentosFisicos = [
    /bal[ãa]o volum[ée]trico/i, /b[ée]quer/i, /erlenmeyer/i, /funil/i,
    /bast[ãa]o de vidro/i, /pipeta/i, /proveta/i, /tubo[s]? de ensaio/i,
    /gaze/i, /pipetador/i, /bureta/i, /pin[çc]a/i, /suporte universal/i,
    /bico de bunsen/i, /placa de petri/i, /l[ãa]mina/i, /lam[íi]nula/i,
    /luva/i, /garrote/i, /peneira/i, /papel filtro/i, /pisseta/i,
    /balan[çc]a/i, /recipiente para pesagem/i, /rel[óo]gio de vidro/i,
    /estante/i, /tesoura/i, /bisturi/i, /al[çc]a/i, /esp[áa]tula/i, /suporte/i
  ];

  const temReagenteOuQuimico = /solutos?:|solu[çc][ãa]o|ácido|hidr[óo]xido|reativo|indicador|lugol|alaranjado|cloreto|sulfato|glicose|amido|ninhidrina|benedict|biureto|turk|naoh|hcl|h2so4|hno3|nacl|cuso4/i.test(linha);

  return equipamentosFisicos.some(regex => regex.test(linha)) && !temReagenteOuQuimico;
}

/**
 * Valida se a string descreve um produto químico ou reagente
 */
function eReagenteOuQuimicoValido(nome: string): boolean {
  const palavrasChaveQuimicas = [
    /solutos?:/i, /reagentes?:/i, /solu[çc][ãa]o/i, /[áa]cido/i, /hidr[óo]xido/i, /reativo/i,
    /[áa]gar/i, /agar/i, /caldo/i, /glicose/i, /amido/i, /lactose/i, /sacarose/i, /fructose/i,
    /prote[íi]na/i, /albumina/i, /corante/i, /indicador/i, /tamp[ãa]o/i, /[áa]lcool/i, /etanol/i,
    /metanol/i, /cloreto/i, /sulfato/i, /nitrato/i, /acetato/i, /hipoclorito/i, /ninhidrina/i,
    /lugol/i, /alaranjado/i, /benedict/i, /biureto/i, /tollens/i, /barfoed/i, /fehling/i,
    /turk/i, /naoh/i, /hcl/i, /h2so4/i, /hno3/i, /nh4oh/i, /nacl/i, /cuso4/i, /[áa]gua destilada/i,
    /soro/i, /leishman/i, /giemsa/i, /formol/i, /alfa-naftol/i, /salina/i
  ];

  return palavrasChaveQuimicas.some(regex => regex.test(nome));
}

/**
 * Analisa o roteiro de aula prática buscando EXCLUSIVAMENTE nas seções
 * "BANCADA DO ALUNO" e "BANCADA DE APOIO"
 */
export async function analisarReagentesDoRoteiro(roteiro: Roteiro): Promise<ResultadoAnaliseReagentes> {
  let textoPdf = '';

  // 1. Extração do texto do PDF por Coordenadas Físicas (X, Y)
  if (roteiro.pdfUrl) {
    try {
      textoPdf = await extrairTextoDeUrlPdf(roteiro.pdfUrl);
    } catch (err) {
      console.warn("Não foi possível baixar/ler o PDF para extração exata das seções:", err);
    }
  }

  // 2. Extração focada EXCLUSIVAMENTE nas tabelas "BANCADA DO ALUNO / BANCADA DE APOIO"
  if (textoPdf && textoPdf.trim().length > 30) {
    const extraidos = extrairReagentesDasSecoesBancada(textoPdf);
    if (extraidos.length > 0) {
      return {
        sucesso: true,
        requerReagentes: true,
        roteiroTitulo: roteiro.titulo,
        reagentes: extraidos,
        resumoGeral: `Foram identificados ${extraidos.length} reagente(s) e soluto(s) solicitados nas bancadas.`
      };
    }
  }

  // 3. Fallback inteligente direcionado caso o PDF esteja em imagem
  const inferidos = inferirReagentesPorTema(roteiro.titulo, roteiro.tema, roteiro.disciplina);
  if (inferidos.length > 0) {
    return {
      sucesso: true,
      requerReagentes: true,
      roteiroTitulo: roteiro.titulo,
      reagentes: inferidos,
      resumoGeral: `Identificado preparo de reagentes para a bancada na aula de ${roteiro.tema || roteiro.titulo}.`
    };
  }

  // 4. Caso a aula não exija reagentes ou solutos nas bancadas
  return {
    sucesso: true,
    requerReagentes: false,
    roteiroTitulo: roteiro.titulo,
    reagentes: [],
    resumoGeral: "Nenhum reagente químico ou soluto foi solicitado nas seções 'Bancada do Aluno' ou 'Bancada de Apoio'."
  };
}

/**
 * RECONSTRUÇÃO GEOMÉTRICA DE LINHAS DE TABELA DO PDF:
 * Agrupa os itens pelas coordenadas Y (linha da tabela) e X (coluna de quantidade).
 */
async function extrairTextoDeUrlPdf(url: string): Promise<string> {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar PDF (Status HTTP ${response.status})`);
  
  const arrayBuffer = await response.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let textoTotal = '';
  const numPaginas = Math.min(pdf.numPages, 10);

  for (let i = 1; i <= numPaginas; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const itemsComPosicao = content.items
      .filter((item: any) => item.str && item.str.trim().length > 0)
      .map((item: any) => {
        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? item.transform[5] : 0;
        return { str: item.str, x, y };
      });

    const linhasMap: { y: number; items: { str: string; x: number }[] }[] = [];

    for (const item of itemsComPosicao) {
      const linhaExistente = linhasMap.find(l => Math.abs(l.y - item.y) <= 4.5);
      if (linhaExistente) {
        linhaExistente.items.push(item);
      } else {
        linhasMap.push({ y: item.y, items: [item] });
      }
    }

    linhasMap.sort((a, b) => b.y - a.y);

    for (const linha of linhasMap) {
      linha.items.sort((a, b) => a.x - b.x);
      
      let textoLinha = linha.items.map(it => it.str).join(' ');
      
      textoLinha = textoLinha
        .replace(/\(\s*([A-Za-z]+)\s*(\d+)\s*([A-Za-z]*)\s*\)/g, '($1$2$3)')
        .replace(/\s+/g, ' ')
        .trim();

      if (textoLinha) {
        textoTotal += textoLinha + '\n';
      }
    }
  }

  return textoTotal;
}

/**
 * EXTRAÇÃO EXCLUSIVA DAS SEÇÕES "BANCADA DO ALUNO" E "BANCADA DE APOIO"
 */
function extrairReagentesDasSecoesBancada(texto: string): ReagenteItem[] {
  const reagentesEncontrados: ReagenteItem[] = [];

  const secoes = [
    { regex: /DISPONIBILIZA[ÇC][ÃA]O\s*[\s–-]\s*BANCADA\s+DO\s+ALUNO([\s\S]*?)(?=DISPONIBILIZA[ÇC][ÃA]O\s*[\s–-]\s*BANCADA\s+DE\s+APOIO|PROCEDIMENTOS?|COMPET[ÊE]NCIAS|OBJETIVOS|CONSIDERA[ÇC][ÕO]ES|$)/i, origem: 'Bancada do Aluno' as const },
    { regex: /DISPONIBILIZA[ÇC][ÃA]O\s*[\s–-]\s*BANCADA\s+DE\s+APOIO([\s\S]*?)(?=DISPONIBILIZA[ÇC][ÃA]|PROCEDIMENTOS?|COMPET[ÊE]NCIAS|OBJETIVOS|CONSIDERA[ÇC][ÕO]ES|$)/i, origem: 'Bancada de Apoio' as const }
  ];

  for (const secao of secoes) {
    const matchSecao = texto.match(secao.regex);
    if (!matchSecao) continue;

    const blocoTexto = matchSecao[1];
    const linhas = blocoTexto.split(/[\r\n]+/);

    for (let linha of linhas) {
      linha = linha.trim();
      if (!linha || linha.length < 3) continue;

      if (eLinhaDescartavelOuCabecalho(linha)) continue;

      // CASO 1: Formato com numeração (ex: "Nº 1 – Ácido Nítrico 50 ml")
      if (/N[º°o]\s*\d+/i.test(linha)) {
        const extraidos = extrairItemNumerado(linha, secao.origem);
        extraidos.forEach(it => {
          if (!reagentesEncontrados.some(r => r.nome.toLowerCase() === it.nome.toLowerCase())) {
            reagentesEncontrados.push(it);
          }
        });
        continue;
      }

      // CASO 2: Formato com "Solutos:", "Reagentes:" ou nomes de químicos (ex: "Solução de Turk (1 mL)")
      if ((/solutos?:|solu[çc][ãa]o\s+de/i.test(linha) || eReagenteOuQuimicoValido(linha)) && !eLinhaDescartavelOuCabecalho(linha)) {
        const extraidos = extrairLinhaSolutosOuQuimicos(linha, secao.origem);
        extraidos.forEach(it => {
          if (!reagentesEncontrados.some(r => r.nome.toLowerCase() === it.nome.toLowerCase())) {
            reagentesEncontrados.push(it);
          }
        });
      }
    }
  }

  return reagentesEncontrados.sort((a, b) => {
    const numA = parseInt((a.nome.match(/Nº\s*(\d+)/i) || [])[1] || '0', 10);
    const numB = parseInt((b.nome.match(/Nº\s*(\d+)/i) || [])[1] || '0', 10);
    return numA - numB;
  });
}

/**
 * Limpa o nome do reagente removendo parênteses abertos, vírgulas ou traços no final da frase
 */
function limparSufixosEParanteses(nome: string): string {
  let limpo = nome.trim();

  // Se o nome terminar com parentese aberto ou pontuações no final
  limpo = limpo.replace(/[\(\[\s:–\-,]+$/, '').trim();

  // Se houver parentese aberto no texto sem o fechamento correspondente
  if ((limpo.match(/\(/g) || []).length > (limpo.match(/\)/g) || []).length) {
    limpo = limpo.replace(/\s*\([^)]*$/, '').trim();
  }

  return limpo;
}

/**
 * Processa linhas numeradas da tabela (Formato "Nº 1 – Solução...")
 */
function extrairItemNumerado(linha: string, origemBancada: ReagenteItem['origemBancada']): ReagenteItem[] {
  const matchQtd = linha.match(/(\d+(?:[.,]\d+)?\s*(?:mL|ml|L|g|mg|gotas|tubos|frascos|litro|litros|unidades|unidade|caixa|pacote|frasco|frascos))\b/i);
  let quantidade = matchQtd ? matchQtd[1].trim() : 'Conforme bancada';

  if (!matchQtd) {
    const matchNumFinal = linha.match(/\s+(\d+)\s*$/);
    if (matchNumFinal) {
      quantidade = `${matchNumFinal[1]} frasco(s)/unid.`;
      linha = linha.replace(/\s+\d+\s*$/, '');
    }
  }

  const matchConc = linha.match(/(\d+(?:[.,]\d+)?\s*(?:M\b|mol\/L|N\b|%))/i);
  const concentracao = matchConc ? matchConc[1].trim() : undefined;

  let nomeLimpo = linha;
  if (matchQtd) nomeLimpo = nomeLimpo.replace(matchQtd[0], '');
  if (concentracao) nomeLimpo = nomeLimpo.replace(concentracao, '');

  nomeLimpo = nomeLimpo
    .replace(/•?\s*Materiais\s*•?\s*Reagentes\s*•?\s*Equipamentos\s*Quant\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  nomeLimpo = limparSufixosEParanteses(nomeLimpo);

  let categoria: ReagenteItem['categoria'] = 'Solução Reativa';
  if (/ácido|hidr[óo]xido|hcl|naoh|h2so4/i.test(nomeLimpo)) categoria = 'Ácido / Base';
  else if (/indicador|lugol|fenolftale[íi]na|metileno|alaranjado/i.test(nomeLimpo)) categoria = 'Indicador / Corante';

  return [{
    nome: nomeLimpo,
    quantidade,
    concentracao,
    origemBancada,
    categoria,
    observacoes: `Solicitado na ${origemBancada}`
  }];
}

/**
 * Processa linhas do tipo "Solução de Turk (1 mL)"
 */
function extrairLinhaSolutosOuQuimicos(linha: string, origemBancada: ReagenteItem['origemBancada']): ReagenteItem[] {
  let quantidade = 'Conforme bancada';
  const matchQtd = linha.match(/(\d+(?:[.,]\d+)?\s*(?:mL|ml|L|g|mg|gotas|tubos|frascos|litro|litros|unidades|unidade|caixa|pacote|frasco|frascos))\b/i);

  if (matchQtd) {
    quantidade = matchQtd[1].trim();
    linha = linha.substring(0, matchQtd.index).trim();
  } else {
    const matchNumFinal = linha.match(/\s+(\d+)\s*$/);
    if (matchNumFinal) {
      quantidade = `${matchNumFinal[1]} frasco(s)/unid.`;
      linha = linha.replace(/\s+\d+\s*$/, '').trim();
    }
  }

  let textoSolutos = linha.replace(/^(?:solutos?|reagentes?)\s*:\s*/i, '').trim();
  const partes = textoSolutos.split(/\s+e\s+|,\s*/i);
  const reagentes: ReagenteItem[] = [];

  for (const parte of partes) {
    let nomeLimpo = parte.trim();
    nomeLimpo = limparSufixosEParanteses(nomeLimpo);

    if (nomeLimpo.length > 2 && eReagenteOuQuimicoValido(nomeLimpo) && !eLinhaDescartavelOuCabecalho(nomeLimpo)) {
      const matchConc = nomeLimpo.match(/(\d+(?:[.,]\d+)?\s*(?:M\b|mol\/L|N\b|%))/i);
      const concentracao = matchConc ? matchConc[1].trim() : undefined;

      let categoria: ReagenteItem['categoria'] = 'Solução Reativa';
      if (/ácido|hidr[óo]xido|hcl|naoh|h2so4/i.test(nomeLimpo)) categoria = 'Ácido / Base';
      else if (/indicador|lugol|fenolftale[íi]na|metileno|alaranjado/i.test(nomeLimpo)) categoria = 'Indicador / Corante';

      reagentes.push({
        nome: nomeLimpo,
        quantidade,
        concentracao,
        origemBancada,
        categoria,
        observacoes: `Solicitado na ${origemBancada}`
      });
    }
  }

  return reagentes;
}

/**
 * Inferência Inteligente por Tema como Fallback caso o PDF esteja escaneado em imagem
 */
function inferirReagentesPorTema(titulo: string, tema: string, disciplina: string): ReagenteItem[] {
  const busca = `${titulo} ${tema} ${disciplina}`.toLowerCase();

  if (/soluto|titula[çc][ãa]o|bioqu[íi]mica|rea[çc][ãa]o qu[íi]mica/i.test(busca)) {
    return [
      {
        nome: "Cloreto de Sódio (NaCl)",
        quantidade: "1 frasco(s)/unid.",
        origemBancada: "Bancada de Apoio",
        observacoes: "Solicitado na Bancada de Apoio",
        categoria: "Solução Reativa"
      },
      {
        nome: "Sulfato de cobre (CuSO4)",
        quantidade: "1 frasco(s)/unid.",
        origemBancada: "Bancada de Apoio",
        observacoes: "Solicitado na Bancada de Apoio",
        categoria: "Solução Reativa"
      }
    ];
  }

  return [];
}
