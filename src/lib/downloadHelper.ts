import { Roteiro } from '../types/roteiro';

/**
 * Força o download direto de um arquivo PDF no navegador com o nome especificado.
 */
export async function baixarPdfRoteiro(url: string, tituloRoteiro: string): Promise<void> {
  if (!url) return;

  const nomeLimpo = tituloRoteiro
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim();

  const nomeComExtensao = nomeLimpo.toLowerCase().endsWith('.pdf')
    ? nomeLimpo
    : `${nomeLimpo}.pdf`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha no download via HTTP');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = nomeComExtensao;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (err) {
    console.warn('Fallback: abrindo PDF para download direto no navegador.', err);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = nomeComExtensao;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Abre o WhatsApp (Web ou App Mobile) com os metadados do roteiro e o link do PDF pré-formatados.
 */
export function compartilharNoWhatsApp(roteiro: Roteiro): void {
  if (!roteiro) return;

  const mensagem = 
    `🧪 *Roteiro de Aula Prática*\n\n` +
    `📌 *Título:* ${roteiro.titulo}\n` +
    `🎯 *Tema:* ${roteiro.tema}\n` +
    `📖 *Unidade Curricular:* ${roteiro.disciplina}\n` +
    `🎓 *Curso:* ${roteiro.curso} (${roteiro.tipoCurso || 'Presencial'})\n` +
    (roteiro.docente && roteiro.docente !== 'Não informado' ? `👨‍🏫 *Docente/Tutor:* ${roteiro.docente}\n` : '') +
    `\n📄 *Acesse ou baixe o PDF do Roteiro aqui:* \n${roteiro.pdfUrl}`;

  const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
  window.open(urlWhatsApp, '_blank');
}
