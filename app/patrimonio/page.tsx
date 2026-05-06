"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Armchair, Download, AlertTriangle, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSolicitacao, gerarNumeroSolicitacao } from "@/lib/solicitacoes-store";
import { gerarComprovantePDF } from "@/lib/gerar-comprovante-pdf";
import { getNomesAtivos } from "@/lib/itens-catalogo-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

interface PatrimonioItem { id: number; tipo: string; quantidade: number; setor: string }

export default function PatrimonioPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [patrimonio, setPatrimonio] = useState<PatrimonioItem[]>([{ id: 1, tipo: "", quantidade: 0, setor: "" }]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);
  const [numeroSolicitacao, setNumeroSolicitacao] = useState("");

  const tiposPatrimonio = useMemo(() => getNomesAtivos("patrimonio"), []);

  const addPatrimonio = () => setPatrimonio([...patrimonio, { id: Date.now(), tipo: "", quantidade: 0, setor: "" }]);
  const removePatrimonio = (id: number) => { if (patrimonio.length > 1) setPatrimonio(patrimonio.filter(p => p.id !== id)); };

  const incrementQuantidade = (id: number) => {
    setPatrimonio(patrimonio.map(p => p.id === id ? { ...p, quantidade: p.quantidade + 1 } : p));
  };

  const decrementQuantidade = (id: number) => {
    setPatrimonio(patrimonio.map(p => p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade - 1) } : p));
  };

  const itensFiltrados = patrimonio.filter(p => p.tipo && p.quantidade > 0);

  const getDadosComprovante = (numSol: string) => {
    const dataHora = new Date().toLocaleString("pt-BR");
    const itensComprovante = itensFiltrados.map(p => ({ descricao: `${p.tipo} (Setor: ${p.setor || "Nao informado"})`, quantidade: p.quantidade }));
    return { tipo: "patrimonio", nome, matricula, instituicao, dataHora, itens: itensComprovante, numeroSolicitacao: numSol };
  };

  const handleFinalizar = () => {
    if (!nome || !matricula || !instituicao) { alert("Preencha todos os dados do solicitante"); return; }
    if (itensFiltrados.length === 0) { alert("Adicione pelo menos um item com quantidade maior que zero"); return; }
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
    addSolicitacao({ tipo: "patrimonio", nome, matricula, instituicao, dados: { patrimonio }, itens: itensFiltrados.map(p => ({ tipo: p.tipo, quantidade: p.quantidade, setor: p.setor })) }, numeroSolicitacao);
    setModalAberto(false);
    alert("Solicitacao finalizada");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Armchair className="w-5 h-5" /></div>
        <h1 className="text-lg font-bold tracking-wide">SOLICITAR PATRIMONIO</h1>
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
                <Input
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Matricula</label>
                <Input
                  placeholder="Ex: 00123456"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
                />
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

        {/* Itens de Patrimonio */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Itens de Patrimonio</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addPatrimonio}
                className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar item
              </Button>
            </div>

            <div className="space-y-4">
              {patrimonio.map((item, i) => (
                <div key={item.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="block text-sm text-[#475569]">Item</label>
                      <Select value={item.tipo} onValueChange={(v) => { const p = [...patrimonio]; p[i].tipo = v; setPatrimonio(p); }}>
                        <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white">
                          <SelectValue placeholder="Selecione o item" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {tiposPatrimonio.map(t => <SelectItem key={t} value={t} className="text-sm">{t}</SelectItem>)}
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
                          onClick={() => decrementQuantidade(item.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantidade}
                          onChange={(e) => { const p = [...patrimonio]; p[i].quantidade = parseInt(e.target.value) || 0; setPatrimonio(p); }}
                          className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => incrementQuantidade(item.id)}
                          className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        {patrimonio.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removePatrimonio(item.id)}
                            className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Setor de Destino</label>
                    <Input
                      placeholder="Ex: Sala dos professores, Secretaria, Refeitorio"
                      value={item.setor}
                      onChange={(e) => { const p = [...patrimonio]; p[i].setor = e.target.value; setPatrimonio(p); }}
                      className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]"
                    />
                  </div>
                  {i < patrimonio.length - 1 && <div className="border-t border-[#f1f5f9] pt-4" />}
                </div>
              ))}
            </div>

            {patrimonio.length > 0 && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                  {itensFiltrados.length} {itensFiltrados.length === 1 ? 'item adicionado' : 'itens adicionados'}
                </span>
              </div>
            )}
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
              <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-lg p-3 mb-4">
                <p className="text-xs text-[#4338ca] font-medium">Numero da Solicitacao</p>
                <p className="text-lg font-bold text-[#3730a3]">{numeroSolicitacao}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Dados do Solicitante</h3>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p><span className="font-medium">Nome:</span> {nome}</p>
                  <p><span className="font-medium">Matricula:</span> {matricula}</p>
                  <p><span className="font-medium">Instituicao:</span> {instituicao}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Patrimonio</h3>
                <div className="space-y-1.5">
                  {itensFiltrados.map((item, i) => (
                    <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                      <p className="font-medium">Item {i + 1}</p>
                      <p>Tipo: {item.tipo} | Quantidade: {item.quantidade}</p>
                      <p className="text-xs text-[#64748b]">Setor: {item.setor || "Nao informado"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#e5e7eb] space-y-3">
              <div className="bg-[#fef9c3] border border-[#d4a017] rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#d4a017] shrink-0 mt-0.5" />
                <p className="text-sm text-[#92400e] font-medium">{"E necessario baixar o PDF antes de confirmar o envio."}</p>
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
