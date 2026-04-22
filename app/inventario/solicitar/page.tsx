"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, Send, ClipboardList, FileText, Download, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addInventario, type InventarioItem } from "@/lib/solicitacoes-store";
import jsPDF from "jspdf";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

export default function SolicitarInventarioPage() {
  const [escola, setEscola] = useState("");
  const [secretaria, setSecretaria] = useState("SMECICT");
  const [setor, setSetor] = useState("");
  const [solicitante, setSolicitante] = useState("");
  const [matricula, setMatricula] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [assinatura, setAssinatura] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);

  const [itens, setItens] = useState<InventarioItem[]>([
    { id: "1", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    { id: "2", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    { id: "3", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    { id: "4", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    { id: "5", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
  ]);

  const adicionarItem = () => {
    setItens([
      ...itens,
      { id: Date.now().toString(), numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    ]);
  };

  const removerItem = (id: string) => {
    if (itens.length > 1) {
      setItens(itens.filter((item) => item.id !== id));
    }
  };

  const atualizarItem = (id: string, campo: keyof InventarioItem, valor: string) => {
    setItens(itens.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)));
  };

  const itensPreenchidos = itens.filter((item) => item.numeroPlaca || item.caracteristica);

  const handleBaixarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 10;
    let y = 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PREFEITURA MUNICIPAL DE SAQUAREMA", pw / 2, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(`BENS PATRIMONIAIS - ARROLAMENTO DAS EXISTENCIAS EM 31/12/${ano}`, pw / 2, y, { align: "center" });
    y += 5;
    doc.text(`Escola: ${escola} | Secretaria: ${secretaria} | Setor: ${setor}`, m, y);
    y += 4;
    doc.text(`Solicitante: ${solicitante} | Matricula: ${matricula}`, m, y);
    y += 8;
    doc.setDrawColor(0, 0, 0);
    doc.line(m, y, pw - m, y);
    y += 5;
    const cols = [m, m + 25, m + 85, m + 105, m + 130, m + 150, m + 170];
    const colHeaders = ["N Placa", "Caracteristica", "Setor", "Marca/Modelo", "N Serie", "Medidas", "Obs."];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    colHeaders.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6;
    doc.setFont("helvetica", "normal");
    itensPreenchidos.forEach((item) => {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.text(item.numeroPlaca || "-", cols[0], y);
      doc.text((item.caracteristica || "-").substring(0, 35), cols[1], y);
      doc.text((item.setor || "-").substring(0, 12), cols[2], y);
      doc.text((item.marcaModelo || "-").substring(0, 12), cols[3], y);
      doc.text((item.numeroSerie || "-").substring(0, 10), cols[4], y);
      doc.text((item.medidas || "-").substring(0, 10), cols[5], y);
      doc.text((item.observacao || "-").substring(0, 12), cols[6], y);
      y += 6;
    });
    doc.save(`inventario_${escola.replace(/\s+/g, "_")}_${ano}.pdf`);
    setPdfBaixado(true);
  };

  const handleEnviar = () => {
    if (!escola || !setor || !solicitante || !matricula) {
      alert("Por favor, preencha todos os campos obrigatorios.");
      return;
    }

    if (itensPreenchidos.length === 0) {
      alert("Por favor, preencha pelo menos um item do inventario.");
      return;
    }

    addInventario({
      escola,
      secretaria,
      setor,
      solicitante,
      matricula,
      assinatura,
      ano,
      itens: itensPreenchidos,
    });

    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-[#1e293b] mb-2">Inventario Enviado!</h2>
          <p className="text-sm text-[#64748b] mb-6">
            Sua solicitacao de inventario foi enviada com sucesso para a equipe de Patrimonio.
          </p>
          <Link href="/">
            <Button className="bg-[#111c44] hover:bg-[#0e1735] text-white">
              Voltar ao Inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-[#f8fafc] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#64748b]" />
            </Link>
            <Image
              src="/images/logo-prefeitura-clean.png"
              alt="Prefeitura de Saquarema"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-sm font-bold text-[#1e293b]">Inventario Patrimonial</h1>
              <p className="text-xs text-[#64748b]">Arrolamento de Bens</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Cabecalho do formulario */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <h2 className="text-base font-semibold text-[#1e293b]">Dados do Inventario - BENS PATRIMONIAIS - ARROLAMENTO DAS EXISTENCIAS EM 31/12/{ano}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm text-[#475569]">Escola *</label>
              <Select value={escola} onValueChange={setEscola}>
                <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white">
                  <SelectValue placeholder="Selecione a escola" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {getInstituicoesAtivas().map((inst) => (
                    <SelectItem key={inst} value={inst} className="text-sm">{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-[#475569]">Secretaria</label>
              <Input
                value={secretaria}
                onChange={(e) => setSecretaria(e.target.value)}
                placeholder="SMECICT"
                className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-[#475569]">Setor *</label>
              <Input
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                placeholder="Ex: Secretaria, Sala de Aula"
                className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-[#475569]">Ano do Inventario</label>
              <Select value={ano} onValueChange={setAno}>
                <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-[#475569]">Nome do Solicitante *</label>
              <Input
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                placeholder="Seu nome completo"
                className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-[#475569]">Matricula *</label>
              <Input
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Sua matricula"
                className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-[#475569]">Assinatura Digital</label>
              <Input
                value={assinatura}
                onChange={(e) => setAssinatura(e.target.value)}
                placeholder="Nome completo"
                className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
              />
            </div>
          </div>
        </div>

        {/* Tabela de itens */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <h2 className="text-base font-semibold text-[#1e293b]">Itens do Inventario</h2>
            </div>
            <span className="text-sm text-[#64748b]">Folha: 1</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-3 py-3 text-left font-medium text-[#475569] w-24">Numero Placa</th>
                  <th className="px-3 py-3 text-left font-medium text-[#475569] min-w-[180px]">Caracteristica de identificacao</th>
                  <th className="px-3 py-3 text-left font-medium text-[#475569] w-28">Marca/Modelo</th>
                  <th className="px-3 py-3 text-left font-medium text-[#475569] w-24">N de Serie</th>
                  <th className="px-3 py-3 text-left font-medium text-[#475569] w-20">Medidas</th>
                  <th className="px-3 py-3 text-left font-medium text-[#475569] w-28">Observacao</th>
                  <th className="px-3 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, idx) => (
                  <tr key={item.id} className={`border-b border-[#e2e8f0] ${idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}`}>
                    <td className="px-2 py-2">
                      <Input
                        value={item.numeroPlaca}
                        onChange={(e) => atualizarItem(item.id, "numeroPlaca", e.target.value)}
                        placeholder=""
                        className="h-9 text-sm border-[#e2e8f0] px-2"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.caracteristica}
                        onChange={(e) => atualizarItem(item.id, "caracteristica", e.target.value)}
                        placeholder=""
                        className="h-9 text-sm border-[#e2e8f0] px-2"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.marcaModelo}
                        onChange={(e) => atualizarItem(item.id, "marcaModelo", e.target.value)}
                        placeholder=""
                        className="h-9 text-sm border-[#e2e8f0] px-2"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.numeroSerie}
                        onChange={(e) => atualizarItem(item.id, "numeroSerie", e.target.value)}
                        placeholder=""
                        className="h-9 text-sm border-[#e2e8f0] px-2"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.medidas}
                        onChange={(e) => atualizarItem(item.id, "medidas", e.target.value)}
                        placeholder=""
                        className="h-9 text-sm border-[#e2e8f0] px-2"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.observacao}
                        onChange={(e) => atualizarItem(item.id, "observacao", e.target.value)}
                        placeholder=""
                        className="h-9 text-sm border-[#e2e8f0] px-2"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removerItem(item.id)}
                        className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={itens.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-sm text-[#64748b]">
              {itensPreenchidos.length} {itensPreenchidos.length === 1 ? 'item preenchido' : 'itens preenchidos'}
            </span>
            <Button onClick={adicionarItem} variant="outline" size="sm" className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
              <Plus className="w-4 h-4 mr-1.5" /> Adicionar linha
            </Button>
          </div>
        </div>

        {/* Botao de envio */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link href="/">
            <Button variant="outline" className="border-[#e2e8f0] text-[#64748b] h-11">
              Cancelar
            </Button>
          </Link>
          {!pdfBaixado && (
            <div className="flex items-center gap-2 bg-[#fef9c3] border border-[#d4a017] rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-[#d4a017] shrink-0" />
              <p className="text-sm text-[#92400e] font-medium">{"Baixe o PDF antes de enviar."}</p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleBaixarPDF}
            disabled={!escola || itensPreenchidos.length === 0}
            className="border-[#111c44] text-[#111c44] hover:bg-[#111c44]/5 h-11"
          >
            <Download className="w-4 h-4 mr-2" /> Baixar PDF
          </Button>
          <Button onClick={handleEnviar} disabled={!pdfBaixado} className={`px-8 h-11 text-white disabled:opacity-60 disabled:cursor-not-allowed ${pdfBaixado ? "bg-[#111c44] hover:bg-[#0e1735]" : "bg-[#6b7280]"}`}>
            <Send className="w-4 h-4 mr-2" /> Enviar Inventario
          </Button>
        </div>
      </main>
    </div>
  );
}
