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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HEADER */}
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold tracking-wide">SOLICITAR ALMOXARIFADO</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* VOLTAR */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        {/* DADOS DO SOLICITANTE */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <h2 className="text-base font-semibold text-[#1e293b]">Dados do Solicitante</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-sm text-[#475569]">Nome completo</label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  className="h-11 text-sm border-[#e2e8f0]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#475569]">Matrícula</label>
                <Input
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 00123456"
                  className="h-11 text-sm border-[#e2e8f0]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#475569]">Instituição</label>
                <Select value={instituicao} onValueChange={setInstituicao}>
                  <SelectTrigger className="h-11 text-sm border-[#e2e8f0]">
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
        </div>

        {/* ABAS DE CATEGORIA */}
        <div className="mb-4 bg-white rounded-xl border border-[#e2e8f0] p-1.5 shadow-sm">
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
                  className={`relative flex flex-col items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-medium transition-colors ${
                    ativa
                      ? "bg-[#111c44] text-white"
                      : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#111c44]"
                  }`}
                >
                  <Icone className="w-5 h-5" />
                  {tab.label}
                  {qtd > 0 && (
                    <span
                      className={`absolute top-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                        ativa ? "bg-[#0fb992] text-white" : "bg-[#0fb992] text-white"
                      }`}
                    >
                      {qtd}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTA COMPLETA DE ITENS DA ABA ATIVA */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">
                  Itens de {TABS.find((t) => t.id === abaAtiva)?.label}
                </h2>
              </div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                {itensVisiveis.length} {itensVisiveis.length === 1 ? "item" : "itens"}
              </span>
            </div>

            {/* BUSCA */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar item..."
                className="h-11 pl-9 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
              />
            </div>

            {/* LISTA */}
            {itensVisiveis.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#94a3b8]">
                Nenhum item encontrado para {'"'}
                {busca}
                {'"'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {itensVisiveis.map((item) => {
                  const q = getQtd(abaAtiva, item);
                  return (
                    <div
                      key={item}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                        q > 0 ? "border-[#0fb992] bg-[#0fb992]/5" : "border-[#e2e8f0] bg-white"
                      }`}
                    >
                      <span className="flex-1 text-sm text-[#1e293b] leading-snug">{item}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrement(abaAtiva, item)}
                          className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                          aria-label={`Diminuir ${item}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={q}
                          onChange={(e) => setQtd(abaAtiva, item, parseInt(e.target.value) || 0)}
                          className="h-9 w-14 text-sm text-center border-[#e2e8f0] bg-white"
                          aria-label={`Quantidade de ${item}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => increment(abaAtiva, item)}
                          className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                          aria-label={`Aumentar ${item}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RESUMO / BOTAO FINAL */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
            {totalSelecionados} {totalSelecionados === 1 ? "item selecionado" : "itens selecionados"}
          </span>
          <Button
            onClick={handleFinalizar}
            className="px-14 h-11 bg-[#111c44] hover:bg-[#0e1735] text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Finalizar Solicitação
          </Button>
        </div>
      </div>

      {/* Modal de Confirmacao */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
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
