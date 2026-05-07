"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Shirt, Download, AlertTriangle, X, Minus } from "lucide-react";
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

  const handleConfirmarEnvio = () => {
    addSolicitacao({
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
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Shirt className="w-5 h-5" /></div>
        <h1 className="text-lg font-bold tracking-wide">SOLICITAR UNIFORMES</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Voltar</Link>

        {/* Dados do Solicitante */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <h2 className="text-base font-semibold text-[#1e293b]">Dados do Solicitante</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Nome completo</label>
                <Input placeholder="Digite seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Matricula</label>
                <Input placeholder="Ex: 00123456" value={matricula} onChange={(e) => setMatricula(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Instituicao de Ensino</label>
                <Select value={instituicao} onValueChange={setInstituicao}>
                  <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white">
                    <SelectValue placeholder="Selecione a instituicao" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getInstituicoesAtivas().map(inst => <SelectItem key={inst} value={inst} className="text-sm">{inst}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Uniformes */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Uniformes</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addUniforme} className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar
              </Button>
            </div>
            <div className="space-y-4">
              {uniformes.map((uniforme, index) => (
                <div key={uniforme.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Tipo</label>
                      <Select value={uniforme.tipo} onValueChange={(v) => { const u = [...uniformes]; u[index].tipo = v; setUniformes(u); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{tiposUniforme.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Genero</label>
                      <Select value={uniforme.genero} onValueChange={(v) => { const u = [...uniformes]; u[index].genero = v; setUniformes(u); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{generos.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Tamanho</label>
                      <Select value={uniforme.tamanho} onValueChange={(v) => { const u = [...uniformes]; u[index].tamanho = v; setUniformes(u); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{tamanhosRoupas.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Qtd.</label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrementUniformeQuantidade(uniforme.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input type="number" min="0" value={uniforme.quantidade} onChange={(e) => { const u = [...uniformes]; u[index].quantidade = parseInt(e.target.value) || 0; setUniformes(u); }} className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white" />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => incrementUniformeQuantidade(uniforme.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
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
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                {uniformesFiltrados.length} {uniformesFiltrados.length === 1 ? "item adicionado" : "itens adicionados"}
              </span>
            </div>
          </div>
        </div>

        {/* Calcados */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Calcados</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addCalcado} className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar
              </Button>
            </div>
            <div className="space-y-4">
              {calcados.map((calcado, index) => (
                <div key={calcado.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Tamanho</label>
                      <Select value={calcado.tamanho} onValueChange={(v) => { const c = [...calcados]; c[index].tamanho = v; setCalcados(c); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{tamanhosCalcados.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Qtd.</label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrementCalcadoQuantidade(calcado.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input type="number" min="0" value={calcado.quantidade} onChange={(e) => { const c = [...calcados]; c[index].quantidade = parseInt(e.target.value) || 0; setCalcados(c); }} className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white" />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => incrementCalcadoQuantidade(calcado.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
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
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                {calcadosFiltrados.length} {calcadosFiltrados.length === 1 ? "item adicionado" : "itens adicionados"}
              </span>
            </div>
          </div>
        </div>

        {/* Polo Professor */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Polo Professor</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addPolo} className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar
              </Button>
            </div>
            <div className="space-y-4">
              {polos.map((polo, index) => (
                <div key={polo.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Tamanho da Polo</label>
                      <Select value={polo.tamanho} onValueChange={(v) => { const p = [...polos]; p[index].tamanho = v; setPolos(p); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione o tamanho" /></SelectTrigger>
                        <SelectContent>{tamanhosPolo.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Quantidade</label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrementPoloQuantidade(polo.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input type="number" min="0" value={polo.quantidade} onChange={(e) => { const p = [...polos]; p[index].quantidade = parseInt(e.target.value) || 0; setPolos(p); }} className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white" />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => incrementPoloQuantidade(polo.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
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
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                {polosFiltrados.length} {polosFiltrados.length === 1 ? "item adicionado" : "itens adicionados"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={handleFinalizar} className="px-14 h-11 bg-[#111c44] hover:bg-[#0e1735] text-white font-semibold rounded-xl text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300">Finalizar Solicitacao</Button>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
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
