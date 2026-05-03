import jsPDF from "jspdf";

interface ItemComprovante {
  descricao: string;
  quantidade: number;
}

interface DadosComprovante {
  tipo: string;
  nome: string;
  matricula: string;
  instituicao: string;
  dataHora: string;
  itens: ItemComprovante[];
  numeroSolicitacao?: string;
}

interface ItemTransferencia {
  id: number;
  numeroPatrimonio: string;
  descricaoItem: string;
}

interface DadosTransferencia {
  unidadeOrigem: string;
  responsavelOrigem: string;
  matriculaOrigem: string;
  unidadeDestino: string;
  responsavelDestino: string;
  matriculaDestino: string;
  tmbpPms: string;
  data: string;
  situacao: string;
  itens: ItemTransferencia[];
}

const tipoLabels: Record<string, string> = {
  almoxarifado: "Almoxarifado",
  patrimonio: "Patrimonio",
  "kits-uniformes": "Kits e Uniformes",
  transferencia: "Transferencia de Itens",
  uniformes: "Uniformes",
  kits: "Kits",
};

export function gerarComprovantePDF(dados: DadosComprovante) {
  const tipoLabel = tipoLabels[dados.tipo] || dados.tipo;
  const totalItens = dados.itens.reduce((acc, item) => acc + item.quantidade, 0);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // --- Header ---
  doc.setFillColor(13, 59, 140);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("COMPROVANTE DE SOLICITACAO", pageWidth / 2, 15, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 230);
  doc.text(tipoLabel, pageWidth / 2, 24, { align: "center" });

  y = 42;

  // --- Dados do Solicitante ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(13, 59, 140);
  doc.text("DADOS DO SOLICITANTE", margin, y);
  y += 2;
  doc.setDrawColor(13, 59, 140);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 7;

  const campos = [
    { label: "N Solicitacao:", valor: dados.numeroSolicitacao || "N/A" },
    { label: "Nome:", valor: dados.nome },
    { label: "Matricula:", valor: dados.matricula },
    { label: "Instituicao:", valor: dados.instituicao },
    { label: "Data/Hora:", valor: dados.dataHora },
  ];

  doc.setFontSize(10);
  for (const campo of campos) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(campo.label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(campo.valor, margin + 32, y);
    y += 6;
  }

  y += 6;

  // --- Itens Solicitados ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(13, 59, 140);
  doc.text("ITENS SOLICITADOS", margin, y);
  y += 2;
  doc.setDrawColor(13, 59, 140);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  // Table header
  const colNum = margin;
  const colDesc = margin + 12;
  const colQtd = margin + contentWidth - 15;

  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 3, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("#", colNum + 1, y + 2);
  doc.text("Descricao", colDesc, y + 2);
  doc.text("Qtd", colQtd + 5, y + 2, { align: "center" });
  y += 9;

  // Table rows
  doc.setFontSize(9);
  for (let i = 0; i < dados.itens.length; i++) {
    const item = dados.itens[i];

    // Check page break
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    // Alternate row background
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y - 4, contentWidth, 7, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.text(String(i + 1), colNum + 1, y);

    // Wrap long descriptions
    const maxDescWidth = colQtd - colDesc - 5;
    const lines = doc.splitTextToSize(item.descricao, maxDescWidth);
    doc.text(lines[0], colDesc, y);

    doc.setFont("helvetica", "bold");
    doc.text(String(item.quantidade), colQtd + 5, y, { align: "center" });

    if (lines.length > 1) {
      doc.setFont("helvetica", "normal");
      for (let l = 1; l < lines.length; l++) {
        y += 5;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(lines[l], colDesc, y);
      }
    }

    // Row separator
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    y += 2;
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
  }

  // Total row
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 3, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text("Total de Itens", colDesc, y + 2);
  doc.setTextColor(13, 59, 140);
  doc.text(String(totalItens), colQtd + 5, y + 2, { align: "center" });
  y += 18;

  // Check if we need a new page for signatures
  if (y > 200) {
    doc.addPage();
    y = 30;
  }

  // --- Assinaturas ---
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 4, contentWidth, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 59, 140);
  doc.text("ASSINATURAS", margin + 4, y + 3);
  y += 20;

  const assinaturaWidth = (contentWidth - 10) / 2;

  // Assinatura 1 - Responsavel
  doc.setDrawColor(13, 59, 140);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + assinaturaWidth, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("Assinatura do Responsavel", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(dados.nome || "Nome do Responsavel", margin, y);
  y += 4;
  doc.text(`Matricula: ${dados.matricula || "N/A"}`, margin, y);

  // Reset Y for second signature (same line)
  y -= 13;

  // Assinatura 2 - Instituicao
  const x2 = margin + assinaturaWidth + 10;
  doc.setDrawColor(13, 59, 140);
  doc.setLineWidth(0.5);
  doc.line(x2, y, x2 + assinaturaWidth, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("Assinatura da Instituicao", x2, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(dados.instituicao || "Nome da Instituicao", x2, y);
  y += 4;
  doc.text("Carimbo e Assinatura", x2, y);

  y += 20;

  // Check if we need a new page for date field
  if (y > 260) {
    doc.addPage();
    y = 30;
  }

  // Campo de Data
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("Data: ______ / ______ / __________", margin, y);

  y += 14;

  // --- Footer ---
  const footerY = Math.max(y + 10, 275);
  if (footerY < 290) {
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Prefeitura Municipal de Saquarema - Sistema de Solicitacoes", pageWidth / 2, footerY, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 200);
    doc.text("Este documento e um comprovante de solicitacao e nao garante o atendimento imediato.", pageWidth / 2, footerY + 5, { align: "center" });
  }

  // Download
  const fileName = `comprovante-${tipoLabel.toLowerCase().replace(/\s+/g, "-")}-${dados.matricula}-${Date.now()}.pdf`;
  doc.save(fileName);
}

export function gerarPDFTransferencia(dados: DadosTransferencia) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const itensFiltrados = dados.itens.filter(i => i.descricaoItem);

  // --- Header ---
  doc.setFillColor(13, 59, 140);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("TERMO DE TRANSFERENCIA DE BENS", pageWidth / 2, 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 230);
  doc.text("Prefeitura Municipal de Saquarema", pageWidth / 2, 26, { align: "center" });
  doc.setFontSize(9);
  doc.text("Secretaria de Patrimonio", pageWidth / 2, 33, { align: "center" });

  y = 48;

  // --- Informacoes do Documento ---
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 4, contentWidth, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 59, 140);
  doc.text("INFORMACOES DO DOCUMENTO", margin + 4, y + 3);
  y += 14;

  doc.setFontSize(9);
  const infoDoc = [
    { label: "TMBP/PMS N:", valor: dados.tmbpPms || "N/A" },
    { label: "Data da Transferencia:", valor: dados.data },
    { label: "Situacao dos Itens:", valor: dados.situacao || "N/A" },
  ];

  for (const info of infoDoc) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(info.label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(info.valor, margin + 45, y);
    y += 6;
  }

  y += 6;

  // --- Unidade de Origem ---
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 4, contentWidth, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 59, 140);
  doc.text("UNIDADE DE ORIGEM (CEDENTE)", margin + 4, y + 3);
  y += 14;

  const camposOrigem = [
    { label: "Unidade:", valor: dados.unidadeOrigem },
    { label: "Responsavel:", valor: dados.responsavelOrigem },
    { label: "Matricula:", valor: dados.matriculaOrigem },
  ];

  doc.setFontSize(9);
  for (const campo of camposOrigem) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(campo.label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(campo.valor || "N/A", margin + 28, y);
    y += 6;
  }

  y += 6;

  // --- Unidade de Destino ---
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 4, contentWidth, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 59, 140);
  doc.text("UNIDADE DE DESTINO (RECEBEDORA)", margin + 4, y + 3);
  y += 14;

  const camposDestino = [
    { label: "Unidade:", valor: dados.unidadeDestino },
    { label: "Responsavel:", valor: dados.responsavelDestino },
    { label: "Matricula:", valor: dados.matriculaDestino },
  ];

  doc.setFontSize(9);
  for (const campo of camposDestino) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(campo.label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(campo.valor || "N/A", margin + 28, y);
    y += 6;
  }

  y += 8;

  // --- Itens Transferidos ---
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 4, contentWidth, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 59, 140);
  doc.text("RELACAO DE BENS TRANSFERIDOS", margin + 4, y + 3);
  y += 14;

  // Table header
  const colNum = margin;
  const colPatrimonio = margin + 12;
  const colDesc = margin + 50;

  doc.setFillColor(13, 59, 140);
  doc.rect(margin, y - 4, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("ITEM", colNum + 1, y + 1);
  doc.text("N PATRIMONIO", colPatrimonio, y + 1);
  doc.text("DESCRICAO DO BEM", colDesc, y + 1);
  y += 8;

  // Table rows
  doc.setFontSize(8);
  for (let i = 0; i < itensFiltrados.length; i++) {
    const item = itensFiltrados[i];

    // Check page break
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    // Alternate row background
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y - 4, contentWidth, 8, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.text(String(i + 1).padStart(2, "0"), colNum + 1, y);
    doc.text(item.numeroPatrimonio || "N/A", colPatrimonio, y);

    // Wrap long descriptions
    const maxDescWidth = pageWidth - margin - colDesc - 5;
    const lines = doc.splitTextToSize(item.descricaoItem, maxDescWidth);
    doc.text(lines[0], colDesc, y);

    if (lines.length > 1) {
      for (let l = 1; l < lines.length; l++) {
        y += 5;
        if (y > 200) {
          doc.addPage();
          y = 20;
        }
        doc.text(lines[l], colDesc, y);
      }
    }

    // Row separator
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    y += 3;
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
  }

  // Total row
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 3, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("TOTAL DE ITENS TRANSFERIDOS:", margin + 4, y + 2);
  doc.setTextColor(13, 59, 140);
  doc.text(String(itensFiltrados.length), margin + 70, y + 2);

  y += 18;

  // Check if we need a new page for signatures
  if (y > 210) {
    doc.addPage();
    y = 30;
  }

  // --- Declaracao ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  const declaracao = "Declaro que os bens acima relacionados foram transferidos da unidade de origem para a unidade de destino, conforme autorizado pela Secretaria de Patrimonio da Prefeitura Municipal de Saquarema. A unidade recebedora assume total responsabilidade pela guarda, conservacao e uso adequado dos bens transferidos.";
  const linhasDeclaracao = doc.splitTextToSize(declaracao, contentWidth);
  doc.text(linhasDeclaracao, margin, y);
  y += linhasDeclaracao.length * 4 + 10;

  // --- Assinaturas ---
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 4, contentWidth, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 59, 140);
  doc.text("ASSINATURAS", margin + 4, y + 3);
  y += 20;

  const assinaturaWidth = (contentWidth - 10) / 2;

  // Assinatura 1 - Responsavel da Unidade (Cedente)
  doc.setDrawColor(13, 59, 140);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + assinaturaWidth, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("Responsavel da Unidade Cedente", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(dados.responsavelOrigem || "Nome do Responsavel", margin, y);
  y += 4;
  doc.text(`Matricula: ${dados.matriculaOrigem || "N/A"}`, margin, y);
  y += 4;
  doc.text(dados.unidadeOrigem || "Unidade de Origem", margin, y);

  // Reset Y for second signature (same line)
  y -= 17;

  // Assinatura 2 - Responsavel da Unidade (Recebedora)
  const x2 = margin + assinaturaWidth + 10;
  doc.setDrawColor(13, 59, 140);
  doc.setLineWidth(0.5);
  doc.line(x2, y, x2 + assinaturaWidth, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("Responsavel da Unidade Recebedora", x2, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(dados.responsavelDestino || "Nome do Responsavel", x2, y);
  y += 4;
  doc.text(`Matricula: ${dados.matriculaDestino || "N/A"}`, x2, y);
  y += 4;
  doc.text(dados.unidadeDestino || "Unidade de Destino", x2, y);

  y += 25;

  // Check if we need a new page for patrimonio signature
  if (y > 260) {
    doc.addPage();
    y = 30;
  }

  // Assinatura 3 - Secretaria de Patrimonio (centralizada)
  const assinaturaCentralWidth = contentWidth * 0.6;
  const assinaturaCentralX = margin + (contentWidth - assinaturaCentralWidth) / 2;

  doc.setDrawColor(13, 59, 140);
  doc.setLineWidth(0.5);
  doc.line(assinaturaCentralX, y, assinaturaCentralX + assinaturaCentralWidth, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("Secretaria de Patrimonio - Autorizacao", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Prefeitura Municipal de Saquarema", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text("Carimbo e Assinatura", pageWidth / 2, y, { align: "center" });

  // --- Footer ---
  const footerY = 285;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 8, margin + contentWidth, footerY - 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text("Prefeitura Municipal de Saquarema - Sistema de Gestao de Patrimonio", pageWidth / 2, footerY - 3, { align: "center" });
  doc.text(`Documento gerado em: ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, footerY + 1, { align: "center" });

  // Download
  const fileName = `termo-transferencia-${dados.tmbpPms || "sem-numero"}-${Date.now()}.pdf`;
  doc.save(fileName);
}
