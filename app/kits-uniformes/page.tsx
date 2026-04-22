"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Download, AlertTriangle, X, Package, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSolicitacao, gerarNumeroSolicitacao } from "@/lib/solicitacoes-store";
import { gerarComprovantePDF } from "@/lib/gerar-comprovante-pdf";
import { getNomesAtivos } from "@/lib/itens-catalogo-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

interface UniformeItem { id: number; tipo: string; genero: string; tamanho: string; quantidade: number }
interface KitAlunoItem { id: number; tipo: string; quantidade: number }
interface CalcadoItem { id: number; tamanho: string; quantidade: number }
interface MochilaItem { id: number; tamanho: string; quantidade: number }
interface KitProfessorItem { id: number; kit: string; quantidade: number; tamanhoPolo: string; quantidadePolo: number }

const generos = ["Masculino", "Feminino"];

export default function KitsUniformesPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);
  const [numeroSolicitacao, setNumeroSolicitacao] = useState("");

  const tiposUniforme = useMemo(() => getNomesAtivos("uniforme"), []);
  const tamanhosRoupas = useMemo(() => getNomesAtivos("tamanhosRoupas"), []);
  const tiposKitAluno = useMemo(() => getNomesAtivos("kitAluno"), []);
  const tamanhosCalcados = useMemo(() => getNomesAtivos("calcado"), []);
  const tamanhosMochila = useMemo(() => getNomesAtivos("mochila"), []);
  const tamanhosPolo = useMemo(() => getNomesAtivos("tamanhosPolo"), []);

  const [uniformes, setUniformes] = useState<UniformeItem[]>([{ id: 1, tipo: "", genero: "", tamanho: "", quantidade: 0 }]);
  const [kitsAluno, setKitsAluno] = useState<KitAlunoItem[]>([{ id: 1, tipo: "", quantidade: 0 }]);
  const [calcados, setCalcados] = useState<CalcadoItem[]>([{ id: 1, tamanho: "", quantidade: 0 }]);
  const [mochilas, setMochilas] = useState<MochilaItem[]>([{ id: 1, tamanho: "", quantidade: 0 }]);
  const [kitsProfessor, setKitsProfessor] = useState<KitProfessorItem[]>([{ id: 1, kit: "Kit Professor", quantidade: 0, tamanhoPolo: "", quantidadePolo: 0 }]);

  const addUniforme = () => setUniformes([...uniformes, { id: Date.now(), tipo: "", genero: "", tamanho: "", quantidade: 0 }]);
  const removeUniforme = (id: number) => { if (uniformes.length > 1) setUniformes(uniformes.filter((u) => u.id !== id)); };
  const incrementUniforme = (id: number) => setUniformes(uniformes.map(u => u.id === id ? { ...u, quantidade: u.quantidade + 1 } : u));
  const decrementUniforme = (id: number) => setUniformes(uniformes.map(u => u.id === id ? { ...u, quantidade: Math.max(0, u.quantidade - 1) } : u));

  const addKitAluno = () => setKitsAluno([...kitsAluno, { id: Date.now(), tipo: "", quantidade: 0 }]);
  const removeKitAluno = (id: number) => { if (kitsAluno.length > 1) setKitsAluno(kitsAluno.filter((k) => k.id !== id)); };
  const incrementKitAluno = (id: number) => setKitsAluno(kitsAluno.map(k => k.id === id ? { ...k, quantidade: k.quantidade + 1 } : k));
  const decrementKitAluno = (id: number) => setKitsAluno(kitsAluno.map(k => k.id === id ? { ...k, quantidade: Math.max(0, k.quantidade - 1) } : k));

  const addCalcado = () => setCalcados([...calcados, { id: Date.now(), tamanho: "", quantidade: 0 }]);
  const removeCalcado = (id: number) => { if (calcados.length > 1) setCalcados(calcados.filter((c) => c.id !== id)); };
  const incrementCalcado = (id: number) => setCalcados(calcados.map(c => c.id === id ? { ...c, quantidade: c.quantidade + 1 } : c));
  const decrementCalcado = (id: number) => setCalcados(calcados.map(c => c.id === id ? { ...c, quantidade: Math.max(0, c.quantidade - 1) } : c));

  const addMochila = () => setMochilas([...mochilas, { id: Date.now(), tamanho: "", quantidade: 0 }]);
  const removeMochila = (id: number) => { if (mochilas.length > 1) setMochilas(mochilas.filter((m) => m.id !== id)); };
  const incrementMochila = (id: number) => setMochilas(mochilas.map(m => m.id === id ? { ...m, quantidade: m.quantidade + 1 } : m));
  const decrementMochila = (id: number) => setMochilas(mochilas.map(m => m.id === id ? { ...m, quantidade: Math.max(0, m.quantidade - 1) } : m));

  const addKitProfessor = () => setKitsProfessor([...kitsProfessor, { id: Date.now(), kit: "Kit Professor", quantidade: 0, tamanhoPolo: "", quantidadePolo: 0 }]);
  const removeKitProfessor = (id: number) => { if (kitsProfessor.length > 1) setKitsProfessor(kitsProfessor.filter((k) => k.id !== id)); };
  const incrementKitProfessor = (id: number) => setKitsProfessor(kitsProfessor.map(k => k.id === id ? { ...k, quantidade: k.quantidade + 1 } : k));
  const decrementKitProfessor = (id: number) => setKitsProfessor(kitsProfessor.map(k => k.id === id ? { ...k, quantidade: Math.max(0, k.quantidade - 1) } : k));
  const incrementPoloProfessor = (id: number) => setKitsProfessor(kitsProfessor.map(k => k.id === id ? { ...k, quantidadePolo: k.quantidadePolo + 1 } : k));
  const decrementPoloProfessor = (id: number) => setKitsProfessor(kitsProfessor.map(k => k.id === id ? { ...k, quantidadePolo: Math.max(0, k.quantidadePolo - 1) } : k));

  const uniformesFiltrados = uniformes.filter(u => u.quantidade > 0);
  const calcadosFiltrados = calcados.filter(c => c.quantidade > 0);
  const kitsFiltrados = kitsAluno.filter(k => k.quantidade > 0);
  const profFiltrados = kitsProfessor.filter(k => k.quantidade > 0 || k.quantidadePolo > 0);
  const mochilasFiltradas = mochilas.filter(m => m.quantidade > 0);

  const getDadosComprovante = (numSol: string) => {
    const dataHora = new Date().toLocaleString("pt-BR");
    const itensComprovante = [
      ...uniformesFiltrados.map(u => ({ descricao: `Uniforme ${u.tipo} - ${u.genero} - Tam: ${u.tamanho}`, quantidade: u.quantidade })),
      ...calcadosFiltrados.map(c => ({ descricao: `Calcado - Tam: ${c.tamanho}`, quantidade: c.quantidade })),
      ...kitsFiltrados.map(k => ({ descricao: `Kit Aluno: ${k.tipo}`, quantidade: k.quantidade })),
      ...kitsProfessor.filter(k => k.quantidadePolo > 0).map(k => ({ descricao: `Polo Professor: ${k.tamanhoPolo}`, quantidade: k.quantidadePolo })),
      ...mochilasFiltradas.map(m => ({ descricao: `Mochila: ${m.tamanho}`, quantidade: m.quantidade })),
    ];
    return { tipo: "kits-uniformes", nome, matricula, instituicao, dataHora, itens: itensComprovante, numeroSolicitacao: numSol };
  };

  const handleFinalizar = () => {
    if (!nome || !matricula || !instituicao) { alert("Preencha todos os dados do solicitante"); return; }
    const temItens = uniformesFiltrados.length > 0 || calcadosFiltrados.length > 0 || kitsFiltrados.length > 0 || profFiltrados.length > 0 || mochilasFiltradas.length > 0;
    if (!temItens) { alert("Adicione pelo menos um item com quantidade maior que zero"); return; }
    const novoNumero = gerarNumeroSolicitacao();
    setNumeroSolicitacao(novoNumero);
    setModalAberto(true);
    setPdfBaixado(false);
  };

  const handleBaixarPDF = () => { gerarComprovantePDF(getDadosComprovante(numeroSolicitacao)); setPdfBaixado(true); };

  const handleConfirmarEnvio = () => {
    addSolicitacao({
      tipo: "kits-uniformes", nome, matricula, instituicao,
      dados: { uniformes, kitsAluno, calcados, mochilas, kitsProfessor },
      uniformes: uniformes.reduce((a, u) => a + u.quantidade, 0),
      calcados: calcados.reduce((a, c) => a + c.quantidade, 0),
      kitsAluno: kitsAluno.reduce((a, k) => a + k.quantidade, 0),
      polosProf: kitsProfessor.reduce((a, k) => a + k.quantidadePolo, 0),
      mochilas: mochilas.reduce((a, m) => a + m.quantidade, 0),
      uniformesDetalhes: uniformesFiltrados.map(u => ({ tipo: u.tipo, genero: u.genero, tamanho: u.tamanho, quantidade: u.quantidade })),
      calcadosDetalhes: calcadosFiltrados.map(c => ({ tamanho: c.tamanho, quantidade: c.quantidade })),
      kitsAlunoDetalhes: kitsFiltrados.map(k => ({ tipo: k.tipo, quantidade: k.quantidade })),
      polosProfDetalhes: kitsProfessor.filter(k => k.quantidadePolo > 0).map(k => ({ tipo: k.kit, tamanho: k.tamanhoPolo, quantidade: k.quantidadePolo })),
      mochilasDetalhes: mochilasFiltradas.map(m => ({ tipo: m.tamanho, quantidade: m.quantidade })),
    }, numeroSolicitacao);
    setModalAberto(false);
    alert("Solicitacao finalizada");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3 animate-fade-in-down">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-scale-in"><Package className="w-5 h-5" /></div>
        <h1 className="text-lg font-bold tracking-wide">SOLICITACAO DE KITS E UNIFORMES</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium transition-all duration-300 hover:-translate-x-1 animate-fade-in"><ArrowLeft className="w-4 h-4" /> Voltar</Link>

        {/* Dados do Solicitante */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <h2 className="text-base font-semibold text-[#1e293b]">Dados do Solicitante</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Nome do Solicitante</label>
                <Input placeholder="Digite seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Matrícula</label>
                <Input placeholder="Digite a matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Instituição de Ensino</label>
                <Select value={instituicao} onValueChange={setInstituicao}>
                  <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white">
                    <SelectValue placeholder="Selecione a instituição" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getInstituicoesAtivas().map(inst => <SelectItem key={inst} value={inst} className="text-sm">{inst}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Itens de Kits e Uniformes - Único Bloco */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Itens de Kits e Uniformes</h2>
              </div>
            </div>

            <div className="space-y-6">
              {/* UNIFORMES */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1e293b]">Uniformes</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addUniforme}
                    className="h-8 text-xs border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-3 pl-4">
                  {uniformes.map((uniforme, index) => (
                    <div key={uniforme.id} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Tipo</label>
                          <Select value={uniforme.tipo} onValueChange={(v) => { const u = [...uniformes]; u[index].tipo = v; setUniformes(u); }}>
                            <SelectTrigger className="h-9 text-xs border-[#e2e8f0] bg-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">{tiposUniforme.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Gênero</label>
                          <Select value={uniforme.genero} onValueChange={(v) => { const u = [...uniformes]; u[index].genero = v; setUniformes(u); }}>
                            <SelectTrigger className="h-9 text-xs border-[#e2e8f0] bg-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>{generos.map((g) => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Tamanho</label>
                          <Select value={uniforme.tamanho} onValueChange={(v) => { const u = [...uniformes]; u[index].tamanho = v; setUniformes(u); }}>
                            <SelectTrigger className="h-9 text-xs border-[#e2e8f0] bg-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">{tamanhosRoupas.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Qnt.</label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => decrementUniforme(uniforme.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={uniforme.quantidade}
                              onChange={(e) => { const u = [...uniformes]; u[index].quantidade = parseInt(e.target.value) || 0; setUniformes(u); }}
                              className="h-9 w-12 text-xs text-center border-[#e2e8f0] bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => incrementUniforme(uniforme.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            {uniformes.length > 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeUniforme(uniforme.id)}
                                className="h-9 w-9 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#f1f5f9]" />

              {/* CALÇADOS */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1e293b]">Calçados</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCalcado}
                    className="h-8 text-xs border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-3 pl-4">
                  {calcados.map((calcado, index) => (
                    <div key={calcado.id} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Tamanho</label>
                          <Select value={calcado.tamanho} onValueChange={(v) => { const c = [...calcados]; c[index].tamanho = v; setCalcados(c); }}>
                            <SelectTrigger className="h-9 text-xs border-[#e2e8f0] bg-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">{tamanhosCalcados.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Qnt.</label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => decrementCalcado(calcado.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={calcado.quantidade}
                              onChange={(e) => { const c = [...calcados]; c[index].quantidade = parseInt(e.target.value) || 0; setCalcados(c); }}
                              className="h-9 w-12 text-xs text-center border-[#e2e8f0] bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => incrementCalcado(calcado.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            {calcados.length > 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeCalcado(calcado.id)}
                                className="h-9 w-9 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#f1f5f9]" />

              {/* KITS DE ALUNO */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1e293b]">Kits de Aluno</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addKitAluno}
                    className="h-8 text-xs border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-3 pl-4">
                  {kitsAluno.map((kit, index) => (
                    <div key={kit.id} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Tipo</label>
                          <Select value={kit.tipo} onValueChange={(v) => { const k = [...kitsAluno]; k[index].tipo = v; setKitsAluno(k); }}>
                            <SelectTrigger className="h-9 text-xs border-[#e2e8f0] bg-white">
                              <SelectValue placeholder="Selecione o kit" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">{tiposKitAluno.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Qnt.</label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => decrementKitAluno(kit.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={kit.quantidade}
                              onChange={(e) => { const k = [...kitsAluno]; k[index].quantidade = parseInt(e.target.value) || 0; setKitsAluno(k); }}
                              className="h-9 w-12 text-xs text-center border-[#e2e8f0] bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => incrementKitAluno(kit.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            {kitsAluno.length > 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeKitAluno(kit.id)}
                                className="h-9 w-9 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#f1f5f9]" />

              {/* KIT DE PROFESSOR - POLO */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1e293b]">Kit de Professor - Polo</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addKitProfessor}
                    className="h-8 text-xs border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-4 pl-4">
                  {kitsProfessor.map((kit, index) => (
                    <div key={kit.id} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Kit de Professor</label>
                          <Select value={kit.kit} disabled>
                            <SelectTrigger className="h-9 text-xs border-[#e2e8f0] bg-white text-[#94a3b8]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent><SelectItem value="Kit Professor">Kit Professor</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Qnt.</label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => decrementKitProfessor(kit.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={kit.quantidade}
                              onChange={(e) => { const k = [...kitsProfessor]; k[index].quantidade = parseInt(e.target.value) || 0; setKitsProfessor(k); }}
                              className="h-9 w-12 text-xs text-center border-[#e2e8f0] bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => incrementKitProfessor(kit.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Tamanho da Polo</label>
                          <Select value={kit.tamanhoPolo} onValueChange={(v) => { const k = [...kitsProfessor]; k[index].tamanhoPolo = v; setKitsProfessor(k); }}>
                            <SelectTrigger className="h-9 text-xs border-[#e2e8f0] bg-white">
                              <SelectValue placeholder="Selecione o tamanho" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">{tamanhosPolo.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Qnt.</label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => decrementPoloProfessor(kit.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={kit.quantidadePolo}
                              onChange={(e) => { const k = [...kitsProfessor]; k[index].quantidadePolo = parseInt(e.target.value) || 0; setKitsProfessor(k); }}
                              className="h-9 w-12 text-xs text-center border-[#e2e8f0] bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => incrementPoloProfessor(kit.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            {kitsProfessor.length > 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeKitProfessor(kit.id)}
                                className="h-9 w-9 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#f1f5f9]" />

              {/* MOCHILAS */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1e293b]">Mochilas</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addMochila}
                    className="h-8 text-xs border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-3 pl-4">
                  {mochilas.map((mochila, index) => (
                    <div key={mochila.id} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Tamanho da Mochila</label>
                          <Select value={mochila.tamanho} onValueChange={(v) => { const m = [...mochilas]; m[index].tamanho = v; setMochilas(m); }}>
                            <SelectTrigger className="h-9 text-xs border-[#e2e8f0] bg-white">
                              <SelectValue placeholder="Selecione o tamanho" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">{tamanhosMochila.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#475569]">Qnt.</label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => decrementMochila(mochila.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={mochila.quantidade}
                              onChange={(e) => { const m = [...mochilas]; m[index].quantidade = parseInt(e.target.value) || 0; setMochilas(m); }}
                              className="h-9 w-12 text-xs text-center border-[#e2e8f0] bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => incrementMochila(mochila.id)}
                              className="h-9 w-9 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            {mochilas.length > 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeMochila(mochila.id)}
                                className="h-9 w-9 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <Button onClick={handleFinalizar} className="px-10 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold rounded-lg text-sm">Finalizar Solicitação</Button>
        </div>
      </div>

      {/* Modal Resumo da Solicitacao */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <div>
                <h2 className="text-base font-bold text-[#1e293b]">Resumo da Solicitação</h2>
                <p className="text-xs text-[#6b7280]">Verifique os dados da sua solicitação abaixo</p>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-[#9ca3af] hover:text-[#374151] transition-colors" aria-label="Fechar"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-lg p-3 mb-4">
                <p className="text-xs text-[#4338ca] font-medium">Número da Solicitação</p>
                <p className="text-lg font-bold text-[#3730a3]">{numeroSolicitacao}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Dados do Solicitante</h3>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p><span className="font-medium">Nome:</span> {nome}</p>
                  <p><span className="font-medium">Matrícula:</span> {matricula}</p>
                  <p><span className="font-medium">Instituição:</span> {instituicao}</p>
                </div>
              </div>
              {uniformesFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Uniformes</h3>
                  <div className="space-y-1.5">{uniformesFiltrados.map((item, i) => (
                    <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                      <p className="font-medium">Item {i + 1}</p>
                      <p>Tipo: {item.tipo} | Gênero: {item.genero} | Tamanho: {item.tamanho} | Quantidade: {item.quantidade}</p>
                    </div>
                  ))}</div>
                </div>
              )}
              {calcadosFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Calçados (Tênis)</h3>
                  <div className="space-y-1.5">{calcadosFiltrados.map((item, i) => (
                    <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                      <p className="font-medium">Item {i + 1}</p>
                      <p>Tamanho: {item.tamanho} | Quantidade: {item.quantidade}</p>
                    </div>
                  ))}</div>
                </div>
              )}
              {kitsFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Kits de Aluno</h3>
                  <div className="space-y-1.5">{kitsFiltrados.map((item, i) => (
                    <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                      <p className="font-medium">Item {i + 1}</p>
                      <p>Tipo: {item.tipo} | Quantidade: {item.quantidade}</p>
                    </div>
                  ))}</div>
                </div>
              )}
              {profFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Kit de Professor - Polo</h3>
                  <div className="space-y-1.5">{profFiltrados.map((item, i) => (
                    <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                      <p className="font-medium">Item {i + 1}</p>
                      <p>Kit: {item.kit} | Qtd Kit: {item.quantidade}</p>
                      {item.tamanhoPolo && <p>Tamanho da Polo: {item.tamanhoPolo} | Quantidade: {item.quantidadePolo}</p>}
                    </div>
                  ))}</div>
                </div>
              )}
              {mochilasFiltradas.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Mochilas</h3>
                  <div className="space-y-1.5">{mochilasFiltradas.map((item, i) => (
                    <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                      <p className="font-medium">Item {i + 1}</p>
                      <p>Tamanho: {item.tamanho} | Quantidade: {item.quantidade}</p>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-[#e5e7eb] space-y-3">
              <div className="bg-[#fef9c3] border border-[#d4a017] rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#d4a017] shrink-0 mt-0.5" />
                <p className="text-sm text-[#92400e] font-medium">{"É necessário baixar o PDF antes de confirmar o envio."}</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={() => setModalAberto(false)} className="px-6 h-10 text-sm font-medium border-[#d1d5db] text-[#374151] bg-white hover:bg-[#f3f4f6]">Voltar</Button>
                <Button onClick={handleBaixarPDF} className="px-6 h-10 text-sm font-medium bg-[#16a34a] hover:bg-[#15803d] text-white"><Download className="w-4 h-4 mr-2" /> Baixar PDF</Button>
                <Button onClick={handleConfirmarEnvio} disabled={!pdfBaixado} className="px-6 h-10 text-sm font-medium bg-[#6b7280] hover:bg-[#4b5563] text-white disabled:opacity-60 disabled:cursor-not-allowed">Confirmar Envio</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
