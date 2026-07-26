"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Download,
  AlertTriangle,
  X,
  Minus,
  Plus,
  Search,
  FileText,
  UtensilsCrossed,
  Baby,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSolicitacao, gerarNumeroSolicitacao } from "@/lib/solicitacoes-store";
import { gerarComprovantePDF } from "@/lib/gerar-comprovante-pdf";
import { getNomesAtivos } from "@/lib/itens-catalogo-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

type CategoriaTab = "papelaria" | "cozinha" | "creche";

const TABS: { id: CategoriaTab; label: string; icon: typeof FileText }[] = [
  { id: "papelaria", label: "Papelaria", icon: FileText },
  { id: "cozinha", label: "Cozinha", icon: UtensilsCrossed },
  { id: "creche", label: "Creche", icon: Baby },
];

interface ItemSelecionado {
  tipo: string;
  quantidade: number;
}

export default function AlmoxarifadoPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<CategoriaTab>("papelaria");
  const [busca, setBusca] = useState("");
  // Mapa de quantidades: chave = "categoria::nomeItem"
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [modalAberto, setModalAberto] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);
  const [numeroSolicitacao, setNumeroSolicitacao] = useState("");

  // Listas completas de itens de cada categoria (fonte unica: catalogo)
  const itensPorCategoria = useMemo<Record<CategoriaTab, string[]>>(
    () => ({
      papelaria: getNomesAtivos("papelaria"),
      cozinha: getNomesAtivos("cozinha"),
      creche: getNomesAtivos("creche"),
    }),
    [],
  );

  const chave = (cat: CategoriaTab, item: string) => `${cat}::${item}`;
  const getQtd = (cat: CategoriaTab, item: string) => quantidades[chave(cat, item)] || 0;

  const setQtd = (cat: CategoriaTab, item: string, valor: number) => {
    const q = Math.max(0, valor);
    setQuantidades((prev) => ({ ...prev, [chave(cat, item)]: q }));
  };
  const increment = (cat: CategoriaTab, item: string) => setQtd(cat, item, getQtd(cat, item) + 1);
  const decrement = (cat: CategoriaTab, item: string) => setQtd(cat, item, getQtd(cat, item) - 1);

  // Contagem de itens selecionados por categoria
  const contarSelecionados = (cat: CategoriaTab) =>
    itensPorCategoria[cat].filter((item) => getQtd(cat, item) > 0).length;

  const totalSelecionados =
    contarSelecionados("papelaria") + contarSelecionados("cozinha") + contarSelecionados("creche");

  // Soma total de unidades (todas as categorias)
  const totalUnidades = useMemo(
    () => Object.values(quantidades).reduce((soma, q) => soma + (q || 0), 0),
    [quantidades],
  );

  // Itens filtrados pela busca (apenas da aba ativa)
  const itensVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = itensPorCategoria[abaAtiva];
    if (!termo) return lista;
    return lista.filter((item) => item.toLowerCase().includes(termo));
  }, [busca, abaAtiva, itensPorCategoria]);

  // Constroi a lista final de itens selecionados de uma categoria
  const construirSelecionados = (cat: CategoriaTab): ItemSelecionado[] =>
    itensPorCategoria[cat]
      .filter((item) => getQtd(cat, item) > 0)
      .map((item) => ({ tipo: item, quantidade: getQtd(cat, item) }));

  const getDadosComprovante = (numSol: string) => {
    const dataHora = new Date().toLocaleString("pt-BR");
    const itensComprovante = [
      ...construirSelecionados("papelaria"),
      ...construirSelecionados("cozinha"),
      ...construirSelecionados("creche"),
    ].map((i) => ({ descricao: i.tipo, quantidade: i.quantidade }));
    return { tipo: "almoxarifado", nome, matricula, instituicao, dataHora, itens: itensComprovante, numeroSolicitacao: numSol };
  };

  const handleFinalizar = () => {
    if (!nome || !matricula || !instituicao) {
      alert("Preencha todos os dados do solicitante");
      return;
    }
    if (totalSelecionados === 0) {
      alert("Informe a quantidade de pelo menos um item");
      return;
    }
    const novoNumero = gerarNumeroSolicitacao();
    setNumeroSolicitacao(novoNumero);
    setModalAberto(true);
    setPdfBaixado(false);
  };

  const handleBaixarPDF = async () => {
    await gerarComprovantePDF(getDadosComprovante(numeroSolicitacao));
    setPdfBaixado(true);
  };

  const handleConfirmarEnvio = async () => {
    await addSolicitacao(
      {
        tipo: "almoxarifado",
        nome,
        matricula,
        instituicao,
        dados: {
          papelaria: construirSelecionados("papelaria"),
          cozinha: construirSelecionados("cozinha"),
          creche: construirSelecionados("creche"),
        },
      },
      numeroSolicitacao,
    );
    setModalAberto(false);
    alert("Solicitacao finalizada");
    router.push("/");
  };

  const selecionadosPapelaria = construirSelecionados("papelaria");
  const selecionadosCozinha = construirSelecionados("cozinha");
  const selecionadosCreche = construirSelecionados("creche");

  const abaLabel = TABS.find((t) => t.id === abaAtiva)?.label;

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-28">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#0e1735] via-[#111c44] to-[#16225a] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0fb992]/25 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#22d3ab]" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-wide">Solicitar Almoxarifado</h1>
              <p className="text-xs text-white/60">Selecione os itens e informe as quantidades</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* DADOS DO SOLICITANTE */}
        <section className="mb-6 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardList className="w-4 h-4 text-[#111c44]" />
              <h2 className="text-sm font-semibold text-[#1e293b]">Dados do Solicitante</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#475569]">Nome completo</label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  className="h-11 text-sm border-[#e2e8f0] focus-visible:ring-[#0fb992]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#475569]">Matrícula</label>
                <Input
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 00123456"
                  className="h-11 text-sm border-[#e2e8f0] focus-visible:ring-[#0fb992]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#475569]">Instituição</label>
                <Select value={instituicao} onValueChange={setInstituicao}>
                  <SelectTrigger className="h-11 text-sm border-[#e2e8f0] focus:ring-[#0fb992]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {getInstituicoesAtivas().map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* ABAS DE CATEGORIA (STICKY) */}
        <div className="sticky top-16 z-20 -mx-4 px-4 py-3 bg-[#f1f5f9]/90 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-1.5 shadow-sm">
            <div className="grid grid-cols-3 gap-1.5">
              {TABS.map((tab) => {
                const Icone = tab.icon;
                const ativa = abaAtiva === tab.id;
                const qtd = contarSelecionados(tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setAbaAtiva(tab.id);
                      setBusca("");
                    }}
                    className={`relative flex items-center justify-center gap-2 rounded-xl py-3 px-2 text-sm font-medium transition-all duration-200 ${
                      ativa
                        ? "bg-[#111c44] text-white shadow-md"
                        : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#111c44]"
                    }`}
                  >
                    <Icone className={`w-4 h-4 ${ativa ? "text-[#22d3ab]" : ""}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label}</span>
                    {qtd > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0fb992] px-1.5 text-xs font-semibold text-white">
                        {qtd}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* LISTA COMPLETA DE ITENS DA ABA ATIVA */}
        <section className="mt-3 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#1e293b]">Itens de {abaLabel}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-xs font-medium text-[#64748b]">
                  {itensVisiveis.length} {itensVisiveis.length === 1 ? "item" : "itens"}
                </span>
              </div>
              {contarSelecionados(abaAtiva) > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0f9a7a]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {contarSelecionados(abaAtiva)} selecionado{contarSelecionados(abaAtiva) > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* BUSCA */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar item..."
                className="h-11 pl-9 text-sm border-[#e2e8f0] bg-[#f8fafc] focus-visible:ring-[#0fb992] focus-visible:bg-white placeholder:text-[#94a3b8]"
              />
            </div>

            {/* LISTA */}
            {itensVisiveis.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-[#94a3b8]" />
                </div>
                <p className="text-sm text-[#64748b]">
                  Nenhum item encontrado para {'"'}
                  {busca}
                  {'"'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {itensVisiveis.map((item) => {
                  const q = getQtd(abaAtiva, item);
                  const ativo = q > 0;
                  return (
                    <div
                      key={item}
                      className={`flex items-center gap-3 rounded-xl border pl-4 pr-2 py-2.5 transition-all duration-200 ${
                        ativo
                          ? "border-[#0fb992] bg-[#0fb992]/[0.06] shadow-sm"
                          : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                      }`}
                    >
                      <span
                        className={`flex-1 text-sm leading-snug ${
                          ativo ? "font-medium text-[#0f172a]" : "text-[#334155]"
                        }`}
                      >
                        {item}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 rounded-lg bg-[#f1f5f9] p-1">
                        <button
                          type="button"
                          onClick={() => decrement(abaAtiva, item)}
                          disabled={q === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#475569] shadow-sm transition-colors hover:text-[#111c44] disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Diminuir ${item}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={q}
                          onChange={(e) => setQtd(abaAtiva, item, parseInt(e.target.value) || 0)}
                          className={`h-8 w-12 rounded-md bg-transparent text-sm text-center font-semibold outline-none ${
                            ativo ? "text-[#0f9a7a]" : "text-[#334155]"
                          }`}
                          aria-label={`Quantidade de ${item}`}
                        />
                        <button
                          type="button"
                          onClick={() => increment(abaAtiva, item)}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#111c44] shadow-sm transition-colors hover:bg-[#111c44] hover:text-white"
                          aria-label={`Aumentar ${item}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* BARRA DE ACAO FIXA */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-[#e2e8f0] bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#111c44] px-2.5 text-sm font-bold text-white">
              {totalSelecionados}
            </span>
            <div className="leading-tight">
              <p className="font-medium text-[#1e293b]">
                {totalSelecionados === 1 ? "item selecionado" : "itens selecionados"}
              </p>
              <p className="text-xs text-[#64748b]">{totalUnidades} unidades no total</p>
            </div>
          </div>
          <Button
            onClick={handleFinalizar}
            className="px-8 h-11 bg-[#0fb992] hover:bg-[#0f9a7a] text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Finalizar Solicitação
          </Button>
        </div>
      </div>

      {/* Modal de Confirmacao */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <div>
                <h2 className="text-base font-bold text-[#1e293b]">Resumo da Solicitacao</h2>
                <p className="text-xs text-[#6b7280]">Verifique os dados da sua solicitacao abaixo</p>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="text-[#9ca3af] hover:text-[#374151] transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Dados do Solicitante</h3>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p>
                    <span className="font-medium">Nome:</span> {nome}
                  </p>
                  <p>
                    <span className="font-medium">Matricula:</span> {matricula}
                  </p>
                  <p>
                    <span className="font-medium">Instituicao:</span> {instituicao}
                  </p>
                  <p>
                    <span className="font-medium">N. Solicitacao:</span> {numeroSolicitacao}
                  </p>
                </div>
              </div>
              {selecionadosPapelaria.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Papelaria</h3>
                  <div className="space-y-1.5">
                    {selecionadosPapelaria.map((item) => (
                      <div
                        key={item.tipo}
                        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]"
                      >
                        <p>
                          {item.tipo} - Quantidade: {item.quantidade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selecionadosCozinha.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Cozinha</h3>
                  <div className="space-y-1.5">
                    {selecionadosCozinha.map((item) => (
                      <div
                        key={item.tipo}
                        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]"
                      >
                        <p>
                          {item.tipo} - Quantidade: {item.quantidade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selecionadosCreche.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Creche</h3>
                  <div className="space-y-1.5">
                    {selecionadosCreche.map((item) => (
                      <div
                        key={item.tipo}
                        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]"
                      >
                        <p>
                          {item.tipo} - Quantidade: {item.quantidade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-[#e5e7eb] space-y-3">
              <div className="bg-[#fef9c3] border border-[#d4a017] rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#d4a017] shrink-0 mt-0.5" />
                <p className="text-sm text-[#92400e] font-medium">
                  {"E necessario baixar o PDF antes de confirmar o envio."}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setModalAberto(false)}
                  className="px-6 h-10 text-sm font-medium border-[#d1d5db] text-[#374151] bg-white hover:bg-[#f3f4f6]"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleBaixarPDF}
                  className="px-6 h-10 text-sm font-medium bg-[#16a34a] hover:bg-[#15803d] text-white"
                >
                  <Download className="w-4 h-4 mr-2" /> Baixar PDF
                </Button>
                <Button
                  onClick={handleConfirmarEnvio}
                  disabled={!pdfBaixado}
                  className={`px-6 h-10 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed ${
                    pdfBaixado ? "bg-[#111c44] hover:bg-[#0e1735]" : "bg-[#6b7280] hover:bg-[#4b5563]"
                  }`}
                >
                  Confirmar Envio
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
