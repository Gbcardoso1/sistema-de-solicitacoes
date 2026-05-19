"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Plus, Trash2, Send, FileText, X, Download, Search, Clock, CheckCircle2, Loader2, Building2, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getSolicitacoes, fetchSolicitacoes, addInventario, addInventarioSetor, type InventarioItem, type Solicitacao } from "@/lib/solicitacoes-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

export default function InventarioPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [escola, setEscola] = useState("");
  const [secretaria, setSecretaria] = useState("SMECICT");
  const [solicitante, setSolicitante] = useState("");
  const [matricula, setMatricula] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  
  const [enviado, setEnviado] = useState(false);
  const [pdfInventarioBaixado, setPdfInventarioBaixado] = useState(false);
  const [itensInventario, setItensInventario] = useState<InventarioItem[]>([
    { id: "1", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    { id: "2", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    { id: "3", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    { id: "4", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    { id: "5", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
  ]);

  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [mostrarFormularioSetor, setMostrarFormularioSetor] = useState(false);
  const [invSetorSecretaria, setInvSetorSecretaria] = useState("");
  const [invSetorDenominacao, setInvSetorDenominacao] = useState("");
  const [invSetorEndereco, setInvSetorEndereco] = useState("");
  const [invSetorRespNome, setInvSetorRespNome] = useState("");
  const [invSetorRespCPF, setInvSetorRespCPF] = useState("");
  const [invSetorRespMatricula, setInvSetorRespMatricula] = useState("");
  const [invSetorAgenteNome, setInvSetorAgenteNome] = useState("");
  const [invSetorAgenteCPF, setInvSetorAgenteCPF] = useState("");
  const [invSetorAgenteMatricula, setInvSetorAgenteMatricula] = useState("");
  const [invSetorItens, setInvSetorItens] = useState<{ codigo: string; descricao: string }[]>([]);
  const [invSetorNovoItem, setInvSetorNovoItem] = useState({ codigo: "", descricao: "" });
  const [invSetorSalaResponsavel, setInvSetorSalaResponsavel] = useState("");
  const [invSetorEnviado, setInvSetorEnviado] = useState(false);
  const [invSetorPdfBaixado, setInvSetorPdfBaixado] = useState(false);
  const [buscaNome, setBuscaNome] = useState("");
  const [buscaMatricula, setBuscaMatricula] = useState("");
  const [buscaInstituicao, setBuscaInstituicao] = useState("");
  const [solicitacoesEncontradas, setSolicitacoesEncontradas] = useState<Solicitacao[]>([]);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const prePopularItensParaEscola = async (escolaSelecionada: string) => {
    const todasSolicitacoes = (await fetchSolicitacoes()).filter((s) => s.tipo === "patrimonio");
    const solicitacoesFinalizadas = todasSolicitacoes.filter(
      (s) =>
        s.instituicao.toLowerCase() === escolaSelecionada.toLowerCase() &&
        s.status === "Finalizado" &&
        s.itens &&
        s.itens.some((i) => i.numeroLacre)
    );

    const itensPrePopulados: InventarioItem[] = [];
    solicitacoesFinalizadas.forEach((solicitacao) => {
      (solicitacao.itens || []).forEach((item) => {
        if (item.numeroLacre) {
          if (item.lacresIndividuais && item.lacresIndividuais.length > 0) {
            item.lacresIndividuais.forEach((lacre) => {
              itensPrePopulados.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                numeroPlaca: lacre,
                caracteristica: item.tipo,
                setor: "",
                marcaModelo: "",
                numeroSerie: "",
                medidas: "",
                observacao: "",
              });
            });
          } else {
            for (let i = 0; i < item.quantidade; i++) {
              itensPrePopulados.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                numeroPlaca: item.numeroLacre + (item.quantidade > 1 ? `-${i + 1}` : ""),
                caracteristica: item.tipo,
                setor: "",
                marcaModelo: "",
                numeroSerie: "",
                medidas: "",
                observacao: "",
              });
            }
          }
        }
      });
    });

    if (itensPrePopulados.length > 0) {
      const linhasExtras = 3;
      for (let i = 0; i < linhasExtras; i++) {
        itensPrePopulados.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
          numeroPlaca: "",
          caracteristica: "",
          setor: "",
          marcaModelo: "",
          numeroSerie: "",
          medidas: "",
          observacao: "",
        });
      }
      setItensInventario(itensPrePopulados);
    } else {
      setItensInventario([
        { id: "1", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
        { id: "2", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
        { id: "3", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
        { id: "4", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
        { id: "5", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
      ]);
    }
  };

  const handleEscolaChange = (value: string) => {
    setEscola(value);
    prePopularItensParaEscola(value);
  };

  const adicionarItemInventario = () => {
    setItensInventario([
      ...itensInventario,
      { id: Date.now().toString(), numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    ]);
  };

  const removerItemInventario = (id: string) => {
    if (itensInventario.length > 1) {
      setItensInventario(itensInventario.filter((item) => item.id !== id));
    }
  };

  const atualizarItemInventario = (id: string, campo: keyof InventarioItem, valor: string) => {
    setItensInventario(itensInventario.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)));
  };

  const handleEnviarInventario = async () => {
    if (!escola || !solicitante || !matricula) {
      alert("Por favor, preencha todos os campos obrigatorios.");
      return;
    }

    const itensPreenchidos = itensInventario.filter((item) => item.numeroPlaca || item.caracteristica);
    if (itensPreenchidos.length === 0) {
      alert("Por favor, preencha pelo menos um item do inventario.");
      return;
    }

    await addInventario({
      instituicao: escola,
      solicitante,
      matricula,
      ano,
      itens: itensPreenchidos,
    });

    setEnviado(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setEnviado(false);
    setEscola("");
    setSecretaria("SMECICT");
    setSolicitante("");
    setMatricula("");
    setItensInventario([
      { id: "1", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
      { id: "2", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
      { id: "3", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
      { id: "4", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
      { id: "5", numeroPlaca: "", caracteristica: "", marcaModelo: "", numeroSerie: "", medidas: "", observacao: "", setor: "" },
    ]);
  };

  const buscarMinhasSolicitacoes = async () => {
    if (!buscaInstituicao) {
      alert("Por favor, selecione a instituicao para buscar.");
      return;
    }

    const todasSolicitacoes = await fetchSolicitacoes();
    const normalizar = (str: string) => {
      return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
    };

    const buscaInstNormalizada = normalizar(buscaInstituicao);
    const solicitacoesPatrimonio = todasSolicitacoes.filter((s) => {
      const matchTipo = s.tipo === "patrimonio";
      const instNormalizada = normalizar(s.instituicao);
      const matchInstituicao = instNormalizada.includes(buscaInstNormalizada) ||
        buscaInstNormalizada.includes(instNormalizada);
      const matchNome = !buscaNome || normalizar(s.nome).includes(normalizar(buscaNome));
      const matchMatricula = !buscaMatricula || s.matricula.includes(buscaMatricula.trim());

      return matchTipo && matchInstituicao && matchNome && matchMatricula;
    });

    setSolicitacoesEncontradas(solicitacoesPatrimonio);
    setBuscaRealizada(true);
  };

  const limparBusca = () => {
    setBuscaNome("");
    setBuscaMatricula("");
    setBuscaInstituicao("");
    setSolicitacoesEncontradas([]);
    setBuscaRealizada(false);
  };

  const getStatusLabel = (solicitacao: Solicitacao) => {
    if (solicitacao.encaminhadoLogistica) {
      return { label: "Em Processamento", color: "bg-[#10b981]", icon: CheckCircle2 };
    }
    if (solicitacao.status === "Processamento") {
      return { label: "Em Processamento", color: "bg-[#f59e0b]", icon: Loader2 };
    }
    if (solicitacao.status === "Finalizado") {
      return { label: "Finalizado", color: "bg-[#10b981]", icon: CheckCircle2 };
    }
    return { label: "Pendente", color: "bg-[#6b7280]", icon: Clock };
  };

  const handleBaixarPDFInventario = () => {
    const itensPreenchidos = itensInventario.filter((item) => item.numeroPlaca || item.caracteristica);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 10;
    let y = 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Estado do Rio de Janeiro", 45, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("PREFEITURA MUNICIPAL DE SAQUAREMA", 45, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text("Secretaria Municipal de Educacao - SME", 45, y);
    y += 4;
    doc.text("Av. Saquarema, n 4299, Porto da Roca - Saquarema - RJ", 45, y);
    y += 10;

    doc.setDrawColor(0, 0, 0);
    doc.line(m, y, pw - m, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`ESCOLA: ${escola}`, m, y);
    y += 6;
    doc.text(`BENS PATRIMONIAIS - ARROLAMENTO DAS EXISTENCIAS EM 31/12/${ano}`, m, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Secretaria: ${secretaria}`, m, y);
    doc.text(`Solicitante: ${solicitante}`, m + 60, y);
    doc.text(`Matricula: ${matricula}`, m + 130, y);
    y += 5;
    doc.text(`Folha: 1`, pw - m - 20, y);
    y += 8;

    const cols = [m, m + 25, m + 75, m + 100, m + 125, m + 145, m + 165];
    const colHeaders = ["N Placa", "Caracteristica", "Marca/Modelo", "N Serie", "Medidas", "Obs.", "Sala Resp."];
    doc.setFillColor(240, 240, 240);
    doc.rect(m, y - 3, pw - m * 2, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    colHeaders.forEach((h, i) => {
      doc.text(h, cols[i], y + 1);
    });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    itensPreenchidos.forEach((item) => {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.setDrawColor(200, 200, 200);
      doc.line(m, y + 3, pw - m, y + 3);
      doc.text(item.numeroPlaca || "-", cols[0], y);
      doc.text((item.caracteristica || "-").substring(0, 30), cols[1], y);
      doc.text((item.marcaModelo || "-").substring(0, 12), cols[2], y);
      doc.text((item.numeroSerie || "-").substring(0, 10), cols[3], y);
      doc.text((item.medidas || "-").substring(0, 10), cols[4], y);
      doc.text((item.observacao || "-").substring(0, 10), cols[5], y);
      doc.text((item.setor || "-").substring(0, 12), cols[6], y);
      y += 7;
    });

    for (let i = 0; i < 5; i++) {
      if (y > 270) break;
      doc.setDrawColor(200, 200, 200);
      doc.line(m, y + 3, pw - m, y + 3);
      y += 7;
    }

    y = 280;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Assinatura do Responsavel: ________________________________", m, y);
    doc.text(`Data: ____/____/${ano}`, pw - m - 40, y);

    doc.save(`inventario_${escola.replace(/\s+/g, "_")}_${ano}.pdf`);
    setPdfInventarioBaixado(true);
  };

  const itensPreenchidos = itensInventario.filter(i => i.numeroPlaca || i.caracteristica);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <ClipboardList className="w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold tracking-wide">INVENTARIO ANUAL</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        {/* Botoes de opcoes */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <h2 className="text-base font-semibold text-[#1e293b]">Inventario Patrimonial</h2>
            </div>
            <p className="text-sm text-[#64748b] mb-5">
              Clique no botao abaixo para solicitar o inventario anual. Os itens de patrimonio ja aprovados serao preenchidos automaticamente.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => { setMostrarFormulario(true); setMostrarBusca(false); setMostrarFormularioSetor(false); setPdfInventarioBaixado(false); }}
                className="h-11 text-sm bg-[#111c44] hover:bg-[#0e1735] text-white"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Inventario Geral
              </Button>
              <Button
                onClick={() => { setMostrarFormularioSetor(true); setMostrarFormulario(false); setMostrarBusca(false); setInvSetorPdfBaixado(false); setInvSetorEnviado(false); }}
                variant="outline"
                className="h-11 text-sm border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff]"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Agente Patrimonial
              </Button>
            </div>
          </div>
        </div>

        {/* Formulario de Solicitacao de Inventario */}
        {mostrarFormulario && (
          <div className="mt-6">
            {enviado ? (
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-[#1e293b] mb-2">Inventario Enviado!</h2>
                <p className="text-sm text-[#64748b] mb-6">
                  Sua solicitacao de inventario foi enviada com sucesso para a equipe de Patrimonio.
                </p>
                <Button onClick={fecharFormulario} className="bg-[#111c44] hover:bg-[#0e1735] text-white">
                  Fechar
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#111c44] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#1e293b]">Solicitar Inventario Patrimonial</h2>
                      <p className="text-sm text-[#64748b]">Arrolamento de Bens - Preencha os dados do inventario anual</p>
                    </div>
                  </div>
                  <button onClick={fecharFormulario} className="p-2 hover:bg-[#f8fafc] rounded-lg transition-colors">
                    <X className="w-5 h-5 text-[#64748b]" />
                  </button>
                </div>

                <div className="px-6 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                    <div className="md:col-span-2 lg:col-span-1 space-y-2">
                      <label className="block text-sm text-[#475569]">Escola *</label>
                      <Select value={escola} onValueChange={handleEscolaChange}>
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
                      <Input value={secretaria} onChange={(e) => setSecretaria(e.target.value)} placeholder="SMECICT" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Nome do Solicitante *</label>
                      <Input value={solicitante} onChange={(e) => setSolicitante(e.target.value)} placeholder="Seu nome completo" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Matricula *</label>
                      <Input value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Sua matricula" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                    </div>
                  </div>

                  {/* Tabela de itens */}
                  <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mb-5">
                    <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                        <span className="text-sm font-medium text-[#1e293b]">Itens do Inventario</span>
                      </div>
                      <span className="text-sm text-[#64748b]">Folha: 1</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                          <tr>
                            <th className="px-3 py-3 text-left font-medium text-[#475569] w-24">N Placa</th>
                            <th className="px-3 py-3 text-left font-medium text-[#475569] min-w-[120px]">Caracteristica</th>
                            <th className="px-3 py-3 text-left font-medium text-[#475569] w-24">Marca/Modelo</th>
                            <th className="px-3 py-3 text-left font-medium text-[#475569] w-20">N Serie</th>
                            <th className="px-3 py-3 text-left font-medium text-[#475569] w-16">Medidas</th>
                            <th className="px-3 py-3 text-left font-medium text-[#475569] w-20">Obs.</th>
                            <th className="px-3 py-3 text-left font-medium text-[#475569] w-28">Sala Resp.</th>
                            <th className="px-3 py-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {itensInventario.map((item, idx) => (
                            <tr key={item.id} className={`border-b border-[#e2e8f0] ${idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}`}>
                              <td className="px-2 py-2">
                                <Input value={item.numeroPlaca} onChange={(e) => atualizarItemInventario(item.id, "numeroPlaca", e.target.value)} className="h-9 text-sm border-[#e2e8f0] px-2" />
                              </td>
                              <td className="px-2 py-2">
                                <Input value={item.caracteristica} onChange={(e) => atualizarItemInventario(item.id, "caracteristica", e.target.value)} className="h-9 text-sm border-[#e2e8f0] px-2" />
                              </td>
                              <td className="px-2 py-2">
                                <Input value={item.marcaModelo} onChange={(e) => atualizarItemInventario(item.id, "marcaModelo", e.target.value)} className="h-9 text-sm border-[#e2e8f0] px-2" />
                              </td>
                              <td className="px-2 py-2">
                                <Input value={item.numeroSerie} onChange={(e) => atualizarItemInventario(item.id, "numeroSerie", e.target.value)} className="h-9 text-sm border-[#e2e8f0] px-2" />
                              </td>
                              <td className="px-2 py-2">
                                <Input value={item.medidas} onChange={(e) => atualizarItemInventario(item.id, "medidas", e.target.value)} className="h-9 text-sm border-[#e2e8f0] px-2" />
                              </td>
                              <td className="px-2 py-2">
                                <Input value={item.observacao} onChange={(e) => atualizarItemInventario(item.id, "observacao", e.target.value)} className="h-9 text-sm border-[#e2e8f0] px-2" />
                              </td>
                              <td className="px-2 py-2">
                                <Input value={item.setor} onChange={(e) => atualizarItemInventario(item.id, "setor", e.target.value)} placeholder="Ex: Secretaria" className="h-9 text-sm border-[#e2e8f0] px-2" />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button onClick={() => removerItemInventario(item.id)} className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" disabled={itensInventario.length === 1}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-sm text-[#64748b]">
                        {itensPreenchidos.length} {itensPreenchidos.length === 1 ? 'item preenchido' : 'itens preenchidos'}
                      </span>
                      <Button onClick={adicionarItemInventario} variant="outline" size="sm" className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
                        <Plus className="w-4 h-4 mr-1.5" /> Adicionar linha
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 flex-wrap">
                    {!pdfInventarioBaixado && (
                      <div className="w-full flex items-center gap-2 bg-[#fef9c3] border border-[#d4a017] rounded-lg px-3 py-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-[#d4a017] shrink-0" />
                        <p className="text-sm text-[#92400e] font-medium">{"E necessario baixar o PDF antes de enviar o inventario."}</p>
                      </div>
                    )}
                    <Button variant="outline" onClick={fecharFormulario} className="border-[#e2e8f0] text-[#64748b] h-11">
                      Cancelar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBaixarPDFInventario}
                      className="border-[#111c44] text-[#111c44] hover:bg-[#111c44]/5 h-11"
                      disabled={!escola || itensPreenchidos.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" /> Baixar PDF
                    </Button>
                    <Button onClick={handleEnviarInventario} disabled={!pdfInventarioBaixado} className={`px-6 h-11 text-white disabled:opacity-60 disabled:cursor-not-allowed ${pdfInventarioBaixado ? "bg-[#111c44] hover:bg-[#0e1735]" : "bg-[#6b7280]"}`}>
                      <Send className="w-4 h-4 mr-2" /> Enviar Inventario
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulario Inventario por Setor */}
      {mostrarFormularioSetor && (
        <div className="mt-6 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#111c44] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1e293b]">Gerar Inventario por Setor</h2>
                  <p className="text-sm text-[#64748b]">Preencha os dados do inventario por setor</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMostrarFormularioSetor(false);
                  setInvSetorSecretaria(""); setInvSetorDenominacao(""); setInvSetorEndereco(""); setInvSetorSalaResponsavel("");
                  setInvSetorRespNome(""); setInvSetorRespCPF(""); setInvSetorRespMatricula("");
                  setInvSetorAgenteNome(""); setInvSetorAgenteCPF(""); setInvSetorAgenteMatricula("");
                  setInvSetorItens([]); setInvSetorEnviado(false); setInvSetorPdfBaixado(false);
                }}
                className="p-2 hover:bg-[#f8fafc] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#64748b]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Secretaria + Orgao Responsavel *</label>
                  <Input value={invSetorSecretaria} onChange={(e) => setInvSetorSecretaria(e.target.value)} placeholder="Ex: SECRETARIA DE EDUCACAO - PATRIMONIO" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Instituicao Responsavel *</label>
                  <Select value={invSetorDenominacao} onValueChange={setInvSetorDenominacao}>
                    <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione a instituicao" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {getInstituicoesAtivas().map((inst) => (
                        <SelectItem key={inst} value={inst} className="text-sm">{inst}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Endereco (Rua, n, complemento, bairro) *</label>
                  <Input value={invSetorEndereco} onChange={(e) => setInvSetorEndereco(e.target.value)} placeholder="Ex: AVENIDA LITORANEA S/N" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Sala Responsavel *</label>
                  <Input value={invSetorSalaResponsavel} onChange={(e) => setInvSetorSalaResponsavel(e.target.value)} placeholder="Ex: Sala dos professores, Secretaria, Refeitorio" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                </div>
              </div>

              <div className="bg-[#f8fafc] rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  <p className="text-sm font-medium text-[#1e293b]">Responsavel pelo Orgao</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Nome *</label>
                    <Input value={invSetorRespNome} onChange={(e) => setInvSetorRespNome(e.target.value)} placeholder="Nome completo" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">CPF *</label>
                    <Input value={invSetorRespCPF} onChange={(e) => setInvSetorRespCPF(e.target.value)} placeholder="000.000.000-00" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Matricula *</label>
                    <Input value={invSetorRespMatricula} onChange={(e) => setInvSetorRespMatricula(e.target.value)} placeholder="00000-0" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#f8fafc] rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  <p className="text-sm font-medium text-[#1e293b]">Agente Patrimonial</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Nome *</label>
                    <Input value={invSetorAgenteNome} onChange={(e) => setInvSetorAgenteNome(e.target.value)} placeholder="Nome completo" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">CPF *</label>
                    <Input value={invSetorAgenteCPF} onChange={(e) => setInvSetorAgenteCPF(e.target.value)} placeholder="000.000.000-00" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Matricula *</label>
                    <Input value={invSetorAgenteMatricula} onChange={(e) => setInvSetorAgenteMatricula(e.target.value)} placeholder="00000-0" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  <p className="text-sm font-medium text-[#1e293b]">Bens Moveis ({invSetorItens.length} itens)</p>
                </div>
                <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-end">
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Codigo Bem</label>
                    <Input value={invSetorNovoItem.codigo} onChange={(e) => setInvSetorNovoItem({ ...invSetorNovoItem, codigo: e.target.value })} placeholder="Ex: 54296" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Descricao Generica</label>
                    <Input value={invSetorNovoItem.descricao} onChange={(e) => setInvSetorNovoItem({ ...invSetorNovoItem, descricao: e.target.value })} placeholder="Ex: Ar condicionado" className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                  <Button variant="outline" onClick={() => {
                    if (invSetorNovoItem.descricao.trim()) {
                      setInvSetorItens([...invSetorItens, { ...invSetorNovoItem }]);
                      setInvSetorNovoItem({ codigo: "", descricao: "" });
                    }
                  }} className="h-11 w-11 border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {invSetorItens.length > 0 && (
                  <div className="border border-[#e2e8f0] rounded-xl max-h-[150px] overflow-y-auto">
                    {invSetorItens.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-2.5 border-b border-[#f1f5f9] last:border-b-0 text-sm">
                        <span className="text-[#64748b] w-[80px]">{item.codigo || "-"}</span>
                        <span className="flex-1 text-[#1e293b]">{item.descricao}</span>
                        <button onClick={() => setInvSetorItens(invSetorItens.filter((_, i) => i !== idx))} className="text-[#94a3b8] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {invSetorEnviado && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">Inventario enviado com sucesso!</p>
                    <p className="text-sm text-green-600">O patrimonio recebeu sua solicitacao e vai analisar em breve.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-5 border-t border-[#e2e8f0] flex-wrap">
                {!invSetorPdfBaixado && !invSetorEnviado && (
                  <div className="w-full flex items-center gap-2 bg-[#fef9c3] border border-[#d4a017] rounded-lg px-3 py-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-[#d4a017] shrink-0" />
                    <p className="text-sm text-[#92400e] font-medium">{"E necessario gerar o PDF antes de enviar para o patrimonio."}</p>
                  </div>
                )}
                <Button variant="outline" onClick={() => {
                  setMostrarFormularioSetor(false);
                  setInvSetorSecretaria(""); setInvSetorDenominacao(""); setInvSetorEndereco(""); setInvSetorSalaResponsavel("");
                  setInvSetorRespNome(""); setInvSetorRespCPF(""); setInvSetorRespMatricula("");
                  setInvSetorAgenteNome(""); setInvSetorAgenteCPF(""); setInvSetorAgenteMatricula("");
                  setInvSetorItens([]); setInvSetorEnviado(false); setInvSetorPdfBaixado(false);
                }} className="border-[#e2e8f0] text-[#64748b] h-11">
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    if (!invSetorSecretaria || !invSetorDenominacao || !invSetorEndereco || !invSetorSalaResponsavel || !invSetorRespNome || !invSetorRespCPF || !invSetorRespMatricula || !invSetorAgenteNome || !invSetorAgenteCPF || !invSetorAgenteMatricula) {
                      alert("Preencha todos os campos obrigatorios antes de enviar.");
                      return;
                    }
                    if (invSetorItens.length === 0) {
                      alert("Adicione pelo menos um item ao inventario antes de enviar.");
                      return;
                    }
                    await addInventarioSetor({
                      secretaria: invSetorSecretaria,
                      denominacao: invSetorDenominacao,
                      endereco: invSetorEndereco,
                      salaResponsavel: invSetorSalaResponsavel,
                      respNome: invSetorRespNome,
                      respCPF: invSetorRespCPF,
                      respMatricula: invSetorRespMatricula,
                      agenteNome: invSetorAgenteNome,
                      agenteCPF: invSetorAgenteCPF,
                      agenteMatricula: invSetorAgenteMatricula,
                      itens: invSetorItens,
                    });
                    setInvSetorEnviado(true);
                  }}
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50 gap-2 disabled:opacity-60 disabled:cursor-not-allowed h-11"
                  disabled={invSetorEnviado || !invSetorPdfBaixado}
                >
                  <Send className="w-4 h-4" /> Enviar para o Patrimonio
                </Button>
                <Button onClick={() => {
                  if (!invSetorSecretaria || !invSetorDenominacao || !invSetorEndereco || !invSetorRespNome || !invSetorRespCPF || !invSetorRespMatricula || !invSetorAgenteNome || !invSetorAgenteCPF || !invSetorAgenteMatricula) {
                    alert("Preencha todos os campos obrigatorios");
                    return;
                  }

                  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                  const pw = doc.internal.pageSize.getWidth();
                  const ph = doc.internal.pageSize.getHeight();
                  const m = 15;
                  const cw = pw - m * 2;
                  let y = 10;
                  const anoAtual = new Date().getFullYear();

                  const gerarPagina = (itensPage: { codigo: string; descricao: string }[], pageNum: number, isFirst: boolean) => {
                    y = 10;

                    doc.setFontSize(9);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(0, 0, 0);
                    doc.text("ESTADO DO RIO DE JANEIRO", pw / 2, y, { align: "center" });
                    y += 4;
                    doc.text("PREFEITURA MUNICIPAL DE SAQUAREMA", pw / 2, y, { align: "center" });
                    y += 4;
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.text("Secretaria Municipal de Administracao, Receita e Tributacao", pw / 2, y, { align: "center" });
                    y += 3;
                    doc.text("Setor de Patrimonio", pw / 2, y, { align: "center" });
                    y += 8;

                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.5);
                    doc.line(m, y, pw - m, y);
                    y += 6;

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(11);
                    doc.text(`LEVANTAMENTO PRELIMINAR PARA INVENTARIO ANUAL - ${anoAtual}/${anoAtual + 1}`, pw / 2, y, { align: "center" });
                    y += 5;
                    doc.text("= PATRIMONIO MOBILIARIO =", pw / 2, y, { align: "center" });
                    y += 8;

                    if (isFirst) {
                      doc.setFont("helvetica", "normal");
                      doc.setFontSize(7);
                      doc.text("Base Legal:    C. F. 1988: Art. 5, II e LXXIII e Art. 23, I; C. Estadual: Art. 11; Art. 73, I e Art. 360, e Lei", m, y);
                      y += 3;
                      doc.text("Organica: Art. 10, X, XVIII; Art. 11, I e III", m, y);
                      y += 3;
                      doc.text("Base Administrativa/Contabil: Deliberacao TCE-RJ n. 277 de 24/08/2017 e MCASP - Parte Geral 2.b e 3.1.b", m, y);
                      y += 6;

                      doc.setDrawColor(0, 0, 0);
                      doc.setLineWidth(0.3);
                      doc.rect(m, y, cw, 10);
                      doc.setFont("helvetica", "bold");
                      doc.setFontSize(8);
                      doc.text("Secretaria + Orgao Responsavel:", m + 2, y + 4);
                      doc.setFont("helvetica", "normal");
                      doc.text(invSetorSecretaria.toUpperCase(), m + 2, y + 8);
                      y += 10;

                      doc.rect(m, y, cw, 10);
                      doc.setFont("helvetica", "bold");
                      doc.text("Denominacao do Imovel + Setor de Responsabilidade:", m + 2, y + 4);
                      doc.setFont("helvetica", "normal");
                      doc.text(invSetorDenominacao.toUpperCase(), m + 2, y + 8);
                      y += 10;

                      doc.rect(m, y, cw, 10);
                      doc.setFont("helvetica", "bold");
                      doc.text("Endereco (Rua, n, complemento, bairro):", m + 2, y + 4);
                      doc.setFont("helvetica", "normal");
                      doc.text(invSetorEndereco.toUpperCase(), m + 2, y + 8);
                      y += 10;

                      doc.rect(m, y, cw, 14);
                      doc.setFont("helvetica", "bold");
                      doc.setFontSize(7);
                      doc.text("Responsavel pelo Orgao", m + cw / 2, y + 3, { align: "center" });
                      doc.line(m, y + 5, pw - m, y + 5);
                      doc.setFont("helvetica", "normal");
                      doc.text("Nome:", m + 2, y + 9);
                      doc.text(invSetorRespNome.toUpperCase(), m + 15, y + 9);
                      doc.text("CPF:", m + cw / 2, y + 9);
                      doc.text(invSetorRespCPF, m + cw / 2 + 12, y + 9);
                      doc.text("Matricula:", m + cw * 0.75, y + 9);
                      doc.text(invSetorRespMatricula, m + cw * 0.75 + 18, y + 9);
                      y += 14;

                      doc.rect(m, y, cw, 14);
                      doc.setFont("helvetica", "bold");
                      doc.text("Agente Patrimonial", m + cw / 2, y + 3, { align: "center" });
                      doc.line(m, y + 5, pw - m, y + 5);
                      doc.setFont("helvetica", "normal");
                      doc.text("Nome:", m + 2, y + 9);
                      doc.text(invSetorAgenteNome.toUpperCase(), m + 15, y + 9);
                      doc.text("CPF:", m + cw / 2, y + 9);
                      doc.text(invSetorAgenteCPF, m + cw / 2 + 12, y + 9);
                      doc.text("Matricula:", m + cw * 0.75, y + 9);
                      doc.text(invSetorAgenteMatricula, m + cw * 0.75 + 18, y + 9);
                      y += 14;

                      doc.rect(m, y, cw, 28);
                      doc.setFont("helvetica", "bold");
                      doc.setFontSize(8);
                      doc.text("TERMO DE RESPONSABILIDADE", m + cw / 2, y + 5, { align: "center" });
                      doc.setFont("helvetica", "normal");
                      doc.setFontSize(6);
                      const termoText = "Na qualidade de responsavel, comprometo-me pela guarda dos bens arrolados descritos na(s) folha(s) anexa(s) numerada(s) de 01 ate 02 e por mim rubricada(s), obrigando-me a responder pela posse, sujeitando-me a responder perante a Municipalidade em caso de extravio ou semelhante, a zelar pela sua conservacao, bem como, informar ao orgao gestor responsavel pelo Patrimonio Municipal toda e qualquer movimentacao/ocorrencia ou baixa dos respectivos bens.";
                      const termoText2 = "Declaro que conferi os bens da relacao anexa e que os mesmos se encontram em perfeitas condicoes de uso, salvo observacoes.";
                      doc.text(termoText, m + 2, y + 10, { maxWidth: cw - 4 });
                      doc.text(termoText2, m + 2, y + 22, { maxWidth: cw - 4 });
                      y += 28;

                      doc.setFontSize(6);
                      doc.text("(Utilize tantas relacoes conforme o necessario para enumerar todos os Bens)", m + cw / 2, y + 4, { align: "center" });
                      y += 6;
                    } else {
                      doc.setFont("helvetica", "bold");
                      doc.setFontSize(8);
                      doc.text("Denominacao do Imovel + Setor de Responsabilidade:", m, y);
                      y += 4;
                      doc.setFont("helvetica", "normal");
                      doc.text(invSetorDenominacao.toUpperCase(), m, y);
                      y += 6;
                      doc.text(`Continuacao, folha anexa n. 0${pageNum}`, m + cw / 2, y, { align: "center" });
                      y += 6;
                      doc.setFont("helvetica", "bold");
                      doc.text("Bens Moveis sob a Responsabilidade do Agente Patrimonial", m + cw / 2, y, { align: "center" });
                      y += 4;
                      doc.setFont("helvetica", "normal");
                      doc.setFontSize(6);
                      doc.text("(Utilize tantas relacoes conforme o necessario para enumerar todos os Bens)", m + cw / 2, y, { align: "center" });
                      y += 6;
                    }

                    const colW = cw / 4;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.3);

                    doc.rect(m, y, cw, 6);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(7);
                    doc.text("Codigo Bem", m + 2, y + 4);
                    doc.text("Descricao Generica", m + colW, y + 4);
                    doc.text("Codigo Bem", m + colW * 2, y + 4);
                    doc.text("Descricao Generica", m + colW * 3, y + 4);
                    doc.line(m + colW, y, m + colW, y + 6);
                    doc.line(m + colW * 2, y, m + colW * 2, y + 6);
                    doc.line(m + colW * 3, y, m + colW * 3, y + 6);
                    y += 6;

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(7);
                    const rowHeight = 6;
                    const maxRows = isFirst ? 10 : 20;

                    for (let i = 0; i < maxRows; i++) {
                      doc.rect(m, y, cw, rowHeight);
                      doc.line(m + colW, y, m + colW, y + rowHeight);
                      doc.line(m + colW * 2, y, m + colW * 2, y + rowHeight);
                      doc.line(m + colW * 3, y, m + colW * 3, y + rowHeight);

                      const leftIdx = i * 2;
                      const rightIdx = i * 2 + 1;

                      if (itensPage[leftIdx]) {
                        doc.text(itensPage[leftIdx].codigo || "", m + 2, y + 4);
                        doc.text(itensPage[leftIdx].descricao.substring(0, 25), m + colW + 2, y + 4);
                      }
                      if (itensPage[rightIdx]) {
                        doc.text(itensPage[rightIdx].codigo || "", m + colW * 2 + 2, y + 4);
                        doc.text(itensPage[rightIdx].descricao.substring(0, 25), m + colW * 3 + 2, y + 4);
                      }
                      y += rowHeight;
                    }

                    y += 8;
                    if (isFirst) {
                      doc.rect(m, y, cw / 2 - 2, 25);
                      doc.rect(m + cw / 2 + 2, y, cw / 2 - 2, 25);
                      doc.setFont("helvetica", "bold");
                      doc.setFontSize(7);
                      doc.text("Indicacao do Agente Patrimonial pelo", m + 2, y + 4);
                      doc.text("Responsavel", m + 2, y + 8);
                      doc.text("Aceite da Indicacao do Agente Patrimonial", m + cw / 2 + 4, y + 4);
                      doc.setFont("helvetica", "normal");
                      doc.text("Em      /      /", m + 10, y + 16);
                      doc.text("Em      /      /", m + cw / 2 + 12, y + 16);
                      doc.text("Assinatura:", m + 2, y + 22);
                      doc.text("Assinatura:", m + cw / 2 + 4, y + 22);
                    } else {
                      doc.text(`(   ) Continua na folha anexa n.      /`, m + cw / 2, y, { align: "center" });
                      y += 10;
                      doc.line(m + 20, y, m + cw / 2 - 10, y);
                      doc.text("Agente Patrimonial", m + cw / 4 + 5, y + 4, { align: "center" });
                      y += 10;
                      doc.text("Em      /      /", m + cw / 4, y, { align: "center" });
                      y += 5;
                      doc.text("Assinatura:", m + cw / 4, y, { align: "center" });
                    }

                    doc.setFontSize(6);
                    doc.text("Rua Coronel Madureira, 77 - Centro - Saquarema - RJ - CEP: 28990-756", pw / 2, ph - 10, { align: "center" });
                    doc.text("CNPJ / MF: 32.147.670/0001-21", pw / 2, ph - 6, { align: "center" });
                  };

                  const itensPerFirstPage = 20;
                  const itensPerPage = 40;
                  gerarPagina(invSetorItens.slice(0, itensPerFirstPage), 1, true);

                  if (invSetorItens.length > itensPerFirstPage) {
                    let remaining = invSetorItens.slice(itensPerFirstPage);
                    let pageNum = 2;
                    while (remaining.length > 0) {
                      doc.addPage();
                      gerarPagina(remaining.slice(0, itensPerPage), pageNum, false);
                      remaining = remaining.slice(itensPerPage);
                      pageNum++;
                    }
                  }

                  doc.save(`Inventario_Setor_${invSetorDenominacao.replace(/\s+/g, "_").substring(0, 30)}_${anoAtual}.pdf`);
                  setInvSetorPdfBaixado(true);
                }} className="bg-[#111c44] hover:bg-[#0e1735] text-white gap-2 h-11">
                  <Download className="w-4 h-4" /> Gerar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
