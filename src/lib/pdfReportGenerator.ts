import { ReagenteItem } from './reagentAnalyzer';

export interface ItemConsolidadoPDF {
  nome: string;
  categoria?: ReagenteItem['categoria'];
  concentracao?: string;
  quantidades: { roteiroTitulo: string; curso: string; quantidade: string; origemBancada?: string }[];
  totalOcorrencias: number;
}

/**
 * Gera um PDF / Janela de Impressão formatada em alta resolução para o Relatório de Reagentes.
 */
export function gerarPdfRelatorioReagentes(
  itens: ItemConsolidadoPDF[],
  tituloContexto: string = 'Relatório Geral do Laboratório',
  totalRoteiros: number = 0
): void {
  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups no seu navegador para gerar o PDF de impressão.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Reagentes Químicos - ${tituloContexto}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0f172a;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.4;
        }
        .header-container {
          border-bottom: 2px solid #059669;
          padding-bottom: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .title-brand {
          font-size: 18px;
          font-weight: 900;
          color: #065f46;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .subtitle-context {
          font-size: 13px;
          font-weight: 700;
          color: #047857;
          margin-top: 4px;
        }
        .meta-info {
          font-size: 10px;
          color: #475569;
          text-align: right;
        }
        .summary-box {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          display: flex;
          gap: 20px;
        }
        .summary-item {
          display: flex;
          flex-direction: column;
        }
        .summary-label {
          font-size: 10px;
          font-weight: 700;
          color: #166534;
          text-transform: uppercase;
        }
        .summary-value {
          font-size: 14px;
          font-weight: 900;
          color: #064e3b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background-color: #f1f5f9;
          color: #0f172a;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          text-align: left;
        }
        td {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .reagent-name {
          font-weight: 800;
          font-size: 12px;
          color: #0f172a;
        }
        .tag-cat {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 800;
          margin-left: 6px;
        }
        .tag-acid { background-color: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
        .tag-reactive { background-color: #fef3c7; color: #78350f; border: 1px solid #fde68a; }
        .tag-indicator { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .tag-kit { background-color: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
        .script-list {
          margin: 4px 0 0 0;
          padding-left: 14px;
          font-size: 11px;
          color: #334155;
        }
        .script-item {
          margin-bottom: 2px;
        }
        .footer {
          margin-top: 24px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
          font-size: 9px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>

      <div class="no-print" style="background: #0f172a; color: #fff; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #059669;">
        <span style="font-weight: 800; font-size: 13px;">🔬 Visualização de Impressão do Relatório de Reagentes</span>
        <button onclick="window.print()" style="background: #10b981; color: #000; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 900; cursor: pointer; font-size: 12px;">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      <div style="padding: 16px;">
        <div class="header-container">
          <div>
            <h1 class="title-brand">Relatório de Reagentes e Produtos Químicos</h1>
            <div class="subtitle-context">${tituloContexto}</div>
          </div>
          <div class="meta-info">
            <div>Emissão: <strong>${dataHoje}</strong></div>
            <div>Sistema: <strong>Gestor de Roteiros USF</strong></div>
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-item">
            <span class="summary-label">Produtos Químicos Distintos</span>
            <span class="summary-value">${itens.length} reagentes</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total de Roteiros Analisados</span>
            <span class="summary-value">${totalRoteiros} aulas práticas</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 45%;">Produto Químico / Reagente</th>
              <th style="width: 15%;">Concentração</th>
              <th style="width: 35%;">Aulas Práticas & Quantidade Solicitada</th>
            </tr>
          </thead>
          <tbody>
            ${itens.map((item, idx) => `
              <tr>
                <td><strong>${idx + 1}</strong></td>
                <td>
                  <span class="reagent-name">${item.nome}</span>
                  ${item.categoria ? `<span class="tag-cat ${item.categoria === 'Kit de Ensaio / Diagnóstico' ? 'tag-kit' : item.categoria === 'Ácido / Base' ? 'tag-acid' : item.categoria === 'Indicador / Corante' ? 'tag-indicator' : 'tag-reactive'}">${item.categoria}</span>` : ''}
                </td>
                <td>
                  <strong>${item.concentracao || 'Não inf.'}</strong>
                </td>
                <td>
                  <ul class="script-list">
                    ${item.quantidades.map(q => `
                      <li class="script-item">
                        <strong>${q.roteiroTitulo}</strong> (${q.curso}): 
                        <span style="color: #d97706; font-weight: 800;">${q.quantidade}</span>
                        ${q.origemBancada ? `<small style="color: #64748b;">[${q.origemBancada}]</small>` : ''}
                      </li>
                    `).join('')}
                  </ul>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <span>Relatório oficial compilado das seções de Disponibilização de Bancada do Aluno e Apoio.</span>
          <span>Página 1 de 1</span>
        </div>
      </div>

    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
