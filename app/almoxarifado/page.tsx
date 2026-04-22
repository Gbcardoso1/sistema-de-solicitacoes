"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Package, Download, AlertTriangle, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSolicitacao, gerarNumeroSolicitacao } from "@/lib/solicitacoes-store";
import { gerarComprovantePDF } from "@/lib/gerar-comprovante-pdf";
import { getNomesAtivos } from "@/lib/itens-catalogo-store";
import { INSTITUICOES } from "@/lib/instituicoes";

interface PapelariaItem { id: number; tipo: string; quantidade: number }
interface CozinhaItem { id: number; tipo: string; quantidade: number }

export default function AlmoxarifadoPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [papelaria, setPapelaria] = useState<PapelariaItem[]>([{ id: 1, tipo: "", quantidade: 0 }]);
  const [cozinha, setCozinha] = useState<CozinhaItem[]>([{ id: 1, tipo: "", quantidade: 0 }]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);
  const [numeroSolicitacao, setNumeroSolicitacao] = useState("");

  // Memoizar listas de itens para evitar recálculos a cada render
  const tiposPapelaria = useMemo(() => getNomesAtivos("papelaria"), []);
  const tiposCozinha = useMemo(() => getNomesAtivos("cozinha"), []);

  const addPapelaria = () => setPapelaria([...papelaria, { id: Date.now(), tipo: "", quantidade: 0 }]);
  const removePapelaria = (id: number) => { if (papelaria.length > 1) setPapelaria(papelaria.filter(p => p.id !== id)); };
  const incrementPapelaria = (id: number) => setPapelaria(papelaria.map(p => p.id === id ? { ...p, quantidade: p.quantidade + 1 } : p));
  const decrementPapelaria = (id: number) => setPapelaria(papelaria.map(p => p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade - 1) } : p));
  
  const addCozinha = () => setCozinha([...cozinha, { id: Date.now(), tipo: "", quantidade: 0 }]);
  const removeCozinha = (id: number) => { if (cozinha.length > 1) setCozinha(cozinha.filter(c => c.id !== id)); };
  const incrementCozinha = (id: number) => setCozinha(cozinha.map(c => c.id === id ? { ...c, quantidade: c.quantidade + 1 } : c));
  const decrementCozinha = (id: number) => setCozinha(cozinha.map(c => c.id === id ? { ...c, quantidade: Math.max(0, c.quantidade - 1) } : c));

  const itensFiltradosPapelaria = papelaria.filter(p => p.tipo && p.quantidade > 0);
  const itensFiltradosCozinha = cozinha.filter(c => c.tipo && c.quantidade > 0);

  const getDadosComprovante = (numSol: string) => {
    const dataHora = new Date().toLocaleString("pt-BR");
    const itensComprovante = [
      ...itensFiltradosPapelaria.map(p => ({ descricao: p.tipo, quantidade: p.quantidade })),
      ...itensFiltradosCozinha.map(c => ({ descricao: c.tipo, quantidade: c.quantidade })),
    ];
    return { tipo: "almoxarifado", nome, matricula, instituicao, dataHora, itens: itensComprovante, numeroSolicitacao: numSol };
  };

  const handleFinalizar = () => {
    if (!nome || !matricula || !instituicao) { alert("Preencha todos os dados do solicitante"); return; }
    const temItens = itensFiltradosPapelaria.length > 0 || itensFiltradosCozinha.length > 0;
    if (!temItens) { alert("Adicione pelo menos um item com quantidade maior que zero"); return; }
    const novoNumero = gerarNumeroSolicitacao();
    setNumeroSolicitacao(novoNumero);
    setModalAberto(true);
    setPdfBaixado(false);
  };

  const handleBaixarPDF = () => {
    gerarComprovantePDF(getDadosComprovante(numeroSolicitacao));
    setPdfBaixado(true);
  };

  const handleConfirmarEnvio = () => {
    addSolicitacao({ tipo: "almoxarifado", nome, matricula, instituicao, dados: { papelaria, cozinha } }, numeroSolicitacao);
    setModalAberto(false);
    alert("Solicitacao finalizada");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold tracking-wide">
          SOLICITAR ALMOXARIFADO
        </h1>
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
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <h2 className="text-base font-semibold text-[#1e293b]">
                Dados do Solicitante
              </h2>
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
                <label className="text-sm text-[#475569]">
                  Instituição
                </label>
                <Select value={instituicao} onValueChange={setInstituicao}>
                  <SelectTrigger className="h-11 text-sm border-[#e2e8f0]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUICOES.map((inst) => (
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

        {/* PAPELARIA */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">
                  Itens de Papelaria
                </h2>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={addPapelaria}
                className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar item
              </Button>
            </div>

            <div className="space-y-4">
              {papelaria.map((item, i) => (
                <div key={item.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Item</label>
                      <Select
                        value={item.tipo}
                        onValueChange={(v) => {
                          const p = [...papelaria];
                          p[i].tipo = v;
                          setPapelaria(p);
                        }}
                      >
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white">
                          <SelectValue placeholder="Selecione o item" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {tiposPapelaria.map((t) => (
                            <SelectItem key={t} value={t} className="text-sm">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Quantidade</label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrementPapelaria(item.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantidade}
                          onChange={(e) => {
                            const p = [...papelaria];
                            p[i].quantidade = parseInt(e.target.value) || 0;
                            setPapelaria(p);
                          }}
                          className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => incrementPapelaria(item.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        {papelaria.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removePapelaria(item.id)}
                            className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {i < papelaria.length - 1 && <div className="border-t border-[#f1f5f9] pt-4" />}
                </div>
              ))}
            </div>

            {papelaria.length > 0 && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                  {itensFiltradosPapelaria.length} {itensFiltradosPapelaria.length === 1 ? 'item adicionado' : 'itens adicionados'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* COZINHA */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">
                  Itens de Cozinha
                </h2>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={addCozinha}
                className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar item
              </Button>
            </div>

            <div className="space-y-4">
              {cozinha.map((item, i) => (
                <div key={item.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Item</label>
                      <Select
                        value={item.tipo}
                        onValueChange={(v) => {
                          const c = [...cozinha];
                          c[i].tipo = v;
                          setCozinha(c);
                        }}
                      >
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white">
                          <SelectValue placeholder="Selecione o item" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {tiposCozinha.map((t) => (
                            <SelectItem key={t} value={t} className="text-sm">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Quantidade</label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrementCozinha(item.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantidade}
                          onChange={(e) => {
                            const c = [...cozinha];
                            c[i].quantidade = parseInt(e.target.value) || 0;
                            setCozinha(c);
                          }}
                          className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => incrementCozinha(item.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        {cozinha.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeCozinha(item.id)}
                            className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {i < cozinha.length - 1 && <div className="border-t border-[#f1f5f9] pt-4" />}
                </div>
              ))}
            </div>

            {cozinha.length > 0 && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                  {itensFiltradosCozinha.length} {itensFiltradosCozinha.length === 1 ? 'item adicionado' : 'itens adicionados'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BOTÃO FINAL */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleFinalizar}
            className="px-14 h-11 bg-[#111c44] hover:bg-[#0e1735] text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Finalizar Solicitação
          </Button>
        </div>
      </div>
    </div>
  );
}
