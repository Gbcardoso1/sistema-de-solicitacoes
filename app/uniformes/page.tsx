"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Shirt,
  Footprints,
  Download,
  AlertTriangle,
  X,
  Minus,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSolicitacao } from "@/lib/solicitacoes-store";
import { gerarComprovantePDF } from "@/lib/gerar-comprovante-pdf";
import { getNomesAtivos } from "@/lib/itens-catalogo-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

const generos = ["Masculino", "Feminino"];

interface UniformeItem { id: number; tipo: string; genero: string; tamanho: string; quantidade: number }
interface CalcadoItem { id: number; tamanho: string; quantidade: number }
interface PoloItem { id: number; tamanho: string; quantidade: number }

export default function UniformesPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [uniformes, setUniformes] = useState<UniformeItem[]>([{ id: 1, tipo: "", genero: "", tamanho: "", quantidade: 0 }]);
  const [calcados, setCalcados] = useState<CalcadoItem[]>([{ id: 1, tamanho: "", quantidade: 0 }]);
  const [polos, setPolos] = useState<PoloItem[]>([{ id: 1, tamanho: "", quantidade: 0 }]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);

  const tiposUniforme = getNomesAtivos("uniforme");
  const tamanhosRoupas = getNomesAtivos("tamanhosRoupas");
  const tamanhosCalcados = getNomesAtivos("calcado");
  const tamanhosPolo = getNomesAtivos("tamanhosPolo");

  const addUniforme = () => setUniformes([...uniformes, { id: Date.now(), tipo: "", genero: "", tamanho: "", quantidade: 0 }]);
  const removeUniforme = (id: number) => { if (uniformes.length > 1) setUniformes(uniformes.filter((u) => u.id !== id)); };
  const incrementUniformeQuantidade = (id: number) => {
    setUniformes(uniformes.map(u => u.id === id ? { ...u, quantidade: u.quantidade + 1 } : u));
  };
  const decrementUniformeQuantidade = (id: number) => {
    setUniformes(uniformes.map(u => u.id === id ? { ...u, quantidade: Math.max(0, u.quantidade - 1) } : u));
  };

  const addCalcado = () => setCalcados([...calcados, { id: Date.now(), tamanho: "", quantidade: 0 }]);
  const removeCalcado = (id: number) => { if (calcados.length > 1) setCalcados(calcados.filter((c) => c.id !== id)); };
  const incrementCalcadoQuantidade = (id: number) => {
    setCalcados(calcados.map(c => c.id === id ? { ...c, quantidade: c.quantidade + 1 } : c));
  };
  const decrementCalcadoQuantidade = (id: number) => {
    setCalcados(calcados.map(c => c.id === id ? { ...c, quantidade: Math.max(0, c.quantidade - 1) } : c));
  };

  const addPolo = () => setPolos([...polos, { id: Date.now(), tamanho: "", quantidade: 0 }]);
  const removePolo = (id: number) => { if (polos.length > 1) setPolos(polos.filter((p) => p.id !== id)); };
  const incrementPoloQuantidade = (id: number) => {
    setPolos(polos.map(p => p.id === id ? { ...p, quantidade: p.quantidade + 1 } : p));
  };
  const decrementPoloQuantidade = (id: number) => {
    setPolos(polos.map(p => p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade - 1) } : p));
  };

  const uniformesFiltrados = uniformes.filter(u => u.quantidade > 0);
  const calcadosFiltrados = calcados.filter(c => c.quantidade > 0);
  const polosFiltrados = polos.filter(p => p.tamanho && p.quantidade > 0);

  const totalItens = uniformesFiltrados.length + calcadosFiltrados.length + polosFiltrados.length;
  const totalUnidades =
    uniformesFiltrados.reduce((a, u) => a + u.quantidade, 0) +
    calcadosFiltrados.reduce((a, c) => a + c.quantidade, 0) +
    polosFiltrados.reduce((a, p) => a + p.quantidade, 0);

  const getDadosComprovante = () => {
    const dataHora = new Date().toLocaleString("pt-BR");
    const itensComprovante = [
      ...uniformesFiltrados.map(u => ({ descricao: `Uniforme ${u.tipo} - ${u.genero} - Tam: ${u.tamanho}`, quantidade: u.quantidade })),
      ...calcadosFiltrados.map(c => ({ descricao: `Calcado - Tam: ${c.tamanho}`, quantidade: c.quantidade })),
      ...polosFiltrados.map(p => ({ descricao: `Polo Professor - Tam: ${p.tamanho}`, quantidade: p.quantidade })),
    ];
    return { tipo: "uniformes", nome, matricula, instituicao, dataHora, itens: itensComprovante };
  };

  const handleFinalizar = () => {
    if (!nome || !matricula || !instituicao) { alert("Preencha todos os dados do solicitante"); return; }
    if (uniformesFiltrados.length === 0 && calcadosFiltrados.length === 0 && polosFiltrados.length === 0) { alert("Adicione pelo menos um item com quantidade maior que zero"); return; }
    setModalAberto(true);
    setPdfBaixado(false);
  };

  const handleBaixarPDF = async () => { await gerarComprovantePDF(getDadosComprovante()); setPdfBaixado(true); };

  const handleConfirmarEnvio = async () => {
    await addSolicitacao({
      tipo: "uniformes", nome, matricula, instituicao,
      dados: { uniformes, calcados, polos },
      uniformes: uniformes.reduce((a, u) => a + u.quantidade, 0),
      calcados: calcados.reduce((a, c) => a + c.quantidade, 0),
      polosProf: polos.reduce((a, p) => a + p.quantidade, 0),
      uniformesDetalhes: uniformesFiltrados.map(u => ({ tipo: u.tipo, genero: u.genero, tamanho: u.tamanho, quantidade: u.quantidade })),
      calcadosDetalhes: calcadosFiltrados.map(c => ({ tamanho: c.tamanho, quantidade: c.quantidade })),
      polosProfDetalhes: polosFiltrados.map(p => ({ tipo: "Polo Professor", tamanho: p.tamanho, quantidade: p.quantidade })),
    });
    setModalAberto(false);
    alert("Solicitacao enviada com sucesso!");
    router.push("/");
  };

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
              <Shirt className="w-5 h-5 text-[#22d3ab]" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-wide">Solicitar Uniformes</h1>
              <p className="text-xs text-white/60">Adicione uniformes, calçados e polos</p>
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
                <Input placeholder="Digite seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="h-11 text-sm border-[#e2e8f0] focus-visible:ring-[#0fb992] placeholder:text-[#94a3b8]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#475569]">Matrícula</label>
                <Input placeholder="Ex: 00123456" value={matricula} onChange={(e) => setMatricula(e.target.value)} className="h-11 text-sm border-[#e2e8f0] focus-visible:ring-[#0fb992] placeholder:text-[#94a3b8]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#475569]">Instituição de Ensino</label>
                <Select value={instituicao} onValueChange={setInstituicao}>
                  <SelectTrigger className="h-11 text-sm border-[#e2e8f0] focus:ring-[#0fb992]">
                    <SelectValue placeholder="Selecione a instituição" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getInstituicoesAtivas().map(inst => <SelectItem key={inst} value={inst} className="text-sm">{inst}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Uniformes */}
        <section className="mb-6 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#111c44]" />
                <h2 className="text-sm font-semibold text-[#1e293b]">Uniformes</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addUniforme} className="h-9 text-sm border-[#0fb992] text-[#0f9a7a] bg-white hover:bg-[#0fb992]/[0.08] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar
              </Button>
            </div>
            <div className="space-y-4">
              {uniformes.map((uniforme, index) => (
                <div key={uniforme.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#475569]">Tipo</label>
                      <Select value={uniforme.tipo} onValueChange={(v) => { const u = [...uniformes]; u[index].tipo = v; setUniformes(u); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] focus:ring-[#0fb992]"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{tiposUniforme.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#475569]">Gênero</label>
                      <Select value={uniforme.genero} onValueChange={(v) => { const u = [...uniformes]; u[index].genero = v; setUniformes(u); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] focus:ring-[#0fb992]"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{generos.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#475569]">Tamanho</label>
                      <Select value={uniforme.tamanho} onValueChange={(v) => { const u = [...uniformes]; u[index].tamanho = v; setUniformes(u); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] focus:ring-[#0fb992]"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{tamanhosRoupas.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#475569]">Qtd.</label>
                      <div className="flex items-center gap-1 rounded-lg bg-[#f1f5f9] p-1">
                        <button type="button" onClick={() => decrementUniformeQuantidade(uniforme.id)} disabled={uniforme.quantidade === 0} className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#475569] shadow-sm transition-colors hover:text-[#111c44] disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Diminuir">
                          <Minus className="w-4 h-4" />
                        </button>
                        <input type="number" min="0" value={uniforme.quantidade} onChange={(e) => { const u = [...uniformes]; u[index].quantidade = parseInt(e.target.value) || 0; setUniformes(u); }} className={`h-9 w-12 rounded-md bg-transparent text-sm text-center font-semibold outline-none ${uniforme.quantidade > 0 ? "text-[#0f9a7a]" : "text-[#334155]"}`} aria-label="Quantidade" />
                        <button type="button" onClick={() => incrementUniformeQuantidade(uniforme.id)} className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#111c44] shadow-sm transition-colors hover:bg-[#111c44] hover:text-white" aria-label="Aumentar">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {uniformes.length > 1 && (
                      <div className="pb-0.5">
                        <Button variant="outline" size="icon" onClick={() => removeUniforme(uniforme.id)} className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {index < uniformes.length - 1 && <div className="border-t border-[#f1f5f9] mt-4" />}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-xs font-medium text-[#64748b]">
                {uniformesFiltrados.length} {uniformesFiltrados.length === 1 ? "item adicionado" : "itens adicionados"}
              </span>
            </div>
          </div>
        </section>

        {/* Calcados */}
        <section className="mb-6 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-[#111c44]" />
                <h2 className="text-sm font-semibold text-[#1e293b]">Calçados</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addCalcado} className="h-9 text-sm border-[#0fb992] text-[#0f9a7a] bg-white hover:bg-[#0fb992]/[0.08] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar
              </Button>
            </div>
            <div className="space-y-4">
              {calcados.map((calcado, index) => (
                <div key={calcado.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#475569]">Tamanho</label>
                      <Select value={calcado.tamanho} onValueChange={(v) => { const c = [...calcados]; c[index].tamanho = v; setCalcados(c); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] focus:ring-[#0fb992]"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{tamanhosCalcados.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#475569]">Qtd.</label>
                      <div className="flex items-center gap-1 rounded-lg bg-[#f1f5f9] p-1">
                        <button type="button" onClick={() => decrementCalcadoQuantidade(calcado.id)} disabled={calcado.quantidade === 0} className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#475569] shadow-sm transition-colors hover:text-[#111c44] disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Diminuir">
                          <Minus className="w-4 h-4" />
                        </button>
                        <input type="number" min="0" value={calcado.quantidade} onChange={(e) => { const c = [...calcados]; c[index].quantidade = parseInt(e.target.value) || 0; setCalcados(c); }} className={`h-9 w-12 rounded-md bg-transparent text-sm text-center font-semibold outline-none ${calcado.quantidade > 0 ? "text-[#0f9a7a]" : "text-[#334155]"}`} aria-label="Quantidade" />
                        <button type="button" onClick={() => incrementCalcadoQuantidade(calcado.id)} className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#111c44] shadow-sm transition-colors hover:bg-[#111c44] hover:text-white" aria-label="Aumentar">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {calcados.length > 1 && (
                      <div className="pb-0.5">
                        <Button variant="outline" size="icon" onClick={() => removeCalcado(calcado.id)} className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {index < calcados.length - 1 && <div className="border-t border-[#f1f5f9] mt-4" />}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-xs font-medium text-[#64748b]">
                {calcadosFiltrados.length} {calcadosFiltrados.length === 1 ? "item adicionado" : "itens adicionados"}
              </span>
            </div>
          </div>
        </section>

        {/* Polo Professor */}
        <section className="mb-6 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#111c44]" />
                <h2 className="text-sm font-semibold text-[#1e293b]">Polo Professor</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addPolo} className="h-9 text-sm border-[#0fb992] text-[#0f9a7a] bg-white hover:bg-[#0fb992]/[0.08] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar
              </Button>
            </div>
            <div className="space-y-4">
              {polos.map((polo, index) => (
                <div key={polo.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#475569]">Tamanho da Polo</label>
                      <Select value={polo.tamanho} onValueChange={(v) => { const p = [...polos]; p[index].tamanho = v; setPolos(p); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] focus:ring-[#0fb992]"><SelectValue placeholder="Selecione o tamanho" /></SelectTrigger>
                        <SelectContent>{tamanhosPolo.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#475569]">Quantidade</label>
                      <div className="flex items-center gap-1 rounded-lg bg-[#f1f5f9] p-1">
                        <button type="button" onClick={() => decrementPoloQuantidade(polo.id)} disabled={polo.quantidade === 0} className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#475569] shadow-sm transition-colors hover:text-[#111c44] disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Diminuir">
                          <Minus className="w-4 h-4" />
                        </button>
                        <input type="number" min="0" value={polo.quantidade} onChange={(e) => { const p = [...polos]; p[index].quantidade = parseInt(e.target.value) || 0; setPolos(p); }} className={`h-9 w-12 rounded-md bg-transparent text-sm text-center font-semibold outline-none ${polo.quantidade > 0 ? "text-[#0f9a7a]" : "text-[#334155]"}`} aria-label="Quantidade" />
                        <button type="button" onClick={() => incrementPoloQuantidade(polo.id)} className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#111c44] shadow-sm transition-colors hover:bg-[#111c44] hover:text-white" aria-label="Aumentar">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {polos.length > 1 && (
                      <div className="pb-0.5">
                        <Button variant="outline" size="icon" onClick={() => removePolo(polo.id)} className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {index < polos.length - 1 && <div className="border-t border-[#f1f5f9] mt-4" />}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-xs font-medium text-[#64748b]">
                {polosFiltrados.length} {polosFiltrados.length === 1 ? "item adicionado" : "itens adicionados"}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* BARRA DE ACAO FIXA */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-[#e2e8f0] bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#111c44] px-2.5 text-sm font-bold text-white">
              {totalItens}
            </span>
            <div className="leading-tight">
              <p className="font-medium text-[#1e293b]">
                {totalItens === 1 ? "item adicionado" : "itens adicionados"}
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

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <div>
                <h2 className="text-base font-bold text-[#1e293b]">Resumo da Solicitacao</h2>
                <p className="text-xs text-[#6b7280]">Verifique os dados da sua solicitacao abaixo</p>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-[#9ca3af] hover:text-[#374151] transition-colors" aria-label="Fechar"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Dados do Solicitante</h3>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p><span className="font-medium">Nome:</span> {nome}</p>
                  <p><span className="font-medium">Matricula:</span> {matricula}</p>
                  <p><span className="font-medium">Instituicao:</span> {instituicao}</p>
                </div>
              </div>
              {uniformesFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Uniformes</h3>
                  <div className="space-y-1.5">
                    {uniformesFiltrados.map((item, i) => (
                      <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                        <p className="font-medium">Item {i + 1}</p>
                        <p>Tipo: {item.tipo} | Genero: {item.genero} | Tamanho: {item.tamanho} | Quantidade: {item.quantidade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {calcadosFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Calcados (Tenis)</h3>
                  <div className="space-y-1.5">
                    {calcadosFiltrados.map((item, i) => (
                      <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                        <p className="font-medium">Item {i + 1}</p>
                        <p>Tamanho: {item.tamanho} | Quantidade: {item.quantidade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {polosFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Polo Professor</h3>
                  <div className="space-y-1.5">
                    {polosFiltrados.map((item, i) => (
                      <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                        <p className="font-medium">Item {i + 1}</p>
                        <p>Tamanho: {item.tamanho} | Quantidade: {item.quantidade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-[#e5e7eb] space-y-3">
              <div className="bg-[#fef9c3] border border-[#d4a017] rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#d4a017] shrink-0 mt-0.5" />
                <p className="text-sm text-[#92400e] font-medium">{"E necessario baixar o PDF antes de confirmar o envio."}</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={() => setModalAberto(false)} className="px-6 h-10 text-sm font-medium border-[#d1d5db] text-[#374151] bg-white hover:bg-[#f3f4f6]">Voltar</Button>
                <Button onClick={handleBaixarPDF} className="px-6 h-10 text-sm font-medium bg-[#16a34a] hover:bg-[#15803d] text-white"><Download className="w-4 h-4 mr-2" /> Baixar PDF</Button>
                <Button onClick={handleConfirmarEnvio} disabled={!pdfBaixado} className={`px-6 h-10 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed ${pdfBaixado ? "bg-[#111c44] hover:bg-[#0e1735]" : "bg-[#6b7280] hover:bg-[#4b5563]"}`}>Confirmar Envio</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
