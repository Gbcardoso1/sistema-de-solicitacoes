"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Shirt, Download, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSolicitacao } from "@/lib/solicitacoes-store";
import { gerarComprovantePDF } from "@/lib/gerar-comprovante-pdf";
import { getNomesAtivos } from "@/lib/itens-catalogo-store";

const generos = ["Masculino", "Feminino"];

interface UniformeItem { id: number; tipo: string; genero: string; tamanho: string; quantidade: number }
interface CalcadoItem { id: number; tamanho: string; quantidade: number }

export default function UniformesPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [uniformes, setUniformes] = useState<UniformeItem[]>([{ id: 1, tipo: "", genero: "", tamanho: "", quantidade: 0 }]);
  const [calcados, setCalcados] = useState<CalcadoItem[]>([{ id: 1, tamanho: "", quantidade: 0 }]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);

  const tiposUniforme = getNomesAtivos("uniforme");
  const tamanhosRoupas = getNomesAtivos("tamanhosRoupas");
  const tamanhosCalcados = getNomesAtivos("calcado");

  const addUniforme = () => setUniformes([...uniformes, { id: Date.now(), tipo: "", genero: "", tamanho: "", quantidade: 0 }]);
  const removeUniforme = (id: number) => { if (uniformes.length > 1) setUniformes(uniformes.filter((u) => u.id !== id)); };
  const addCalcado = () => setCalcados([...calcados, { id: Date.now(), tamanho: "", quantidade: 0 }]);
  const removeCalcado = (id: number) => { if (calcados.length > 1) setCalcados(calcados.filter((c) => c.id !== id)); };

  const uniformesFiltrados = uniformes.filter(u => u.quantidade > 0);
  const calcadosFiltrados = calcados.filter(c => c.quantidade > 0);

  const getDadosComprovante = () => {
    const dataHora = new Date().toLocaleString("pt-BR");
    const itensComprovante = [
      ...uniformesFiltrados.map(u => ({ descricao: `Uniforme ${u.tipo} - ${u.genero} - Tam: ${u.tamanho}`, quantidade: u.quantidade })),
      ...calcadosFiltrados.map(c => ({ descricao: `Calcado - Tam: ${c.tamanho}`, quantidade: c.quantidade })),
    ];
    return { tipo: "uniformes", nome, matricula, instituicao, dataHora, itens: itensComprovante };
  };

  const handleFinalizar = () => {
    if (!nome || !matricula || !instituicao) { alert("Preencha todos os dados do solicitante"); return; }
    if (uniformesFiltrados.length === 0 && calcadosFiltrados.length === 0) { alert("Adicione pelo menos um item com quantidade maior que zero"); return; }
    setModalAberto(true);
    setPdfBaixado(false);
  };

  const handleBaixarPDF = () => { gerarComprovantePDF(getDadosComprovante()); setPdfBaixado(true); };

  const handleConfirmarEnvio = () => {
    addSolicitacao({
      tipo: "uniformes", nome, matricula, instituicao,
      dados: { uniformes, calcados },
      uniformes: uniformes.reduce((a, u) => a + u.quantidade, 0),
      calcados: calcados.reduce((a, c) => a + c.quantidade, 0),
      uniformesDetalhes: uniformesFiltrados.map(u => ({ tipo: u.tipo, genero: u.genero, tamanho: u.tamanho, quantidade: u.quantidade })),
      calcadosDetalhes: calcadosFiltrados.map(c => ({ tamanho: c.tamanho, quantidade: c.quantidade })),
    });
    setModalAberto(false);
    alert("Solicitacao enviada com sucesso!");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Shirt className="w-5 h-5" /></div>
        <h1 className="text-lg font-bold tracking-wide">SOLICITAR UNIFORMES</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Voltar</Link>

        <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#f1f5f9] flex items-center gap-2.5">
            <span className="w-1 h-4 rounded-full bg-[#111c44] inline-block" />
            <h2 className="text-sm font-bold text-[#1e293b] tracking-wide">Dados do Solicitante</h2>
          </div>
          <div className="px-5 pb-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5"><label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Nome do Solicitante</label><Input placeholder="Digite seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="h-10 text-sm border-[#d1d5db] focus:border-[#111c44] transition-colors" /></div>
              <div className="space-y-1.5"><label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Matricula</label><Input placeholder="Digite a matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} className="h-10 text-sm border-[#d1d5db] focus:border-[#111c44] transition-colors" /></div>
              <div className="space-y-1.5"><label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Instituicao de Ensino</label><Input placeholder="Nome da instituicao" value={instituicao} onChange={(e) => setInstituicao(e.target.value)} className="h-10 text-sm border-[#d1d5db] focus:border-[#111c44] transition-colors" /></div>
            </div>
          </div>
        </div>

        <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#f1f5f9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-4 rounded-full bg-[#111c44] inline-block" />
              <h2 className="text-sm font-bold text-[#1e293b] tracking-wide">Uniformes</h2>
            </div>
            <Button variant="outline" size="sm" onClick={addUniforme} className="h-8 text-xs border-[#d1d5db] bg-transparent hover:bg-[#f8fafc] font-semibold"><Plus className="w-3 h-3 mr-1.5" /> Adicionar</Button>
          </div>
          <div className="px-5 pb-6 pt-4 space-y-3">
            {uniformes.map((uniforme, index) => (
              <div key={uniforme.id} className="flex items-end gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Tipo</label>
                  <Select value={uniforme.tipo} onValueChange={(v) => { const u = [...uniformes]; u[index].tipo = v; setUniformes(u); }}>
                    <SelectTrigger className="h-10 text-sm border-[#d1d5db] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tiposUniforme.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Genero</label>
                  <Select value={uniforme.genero} onValueChange={(v) => { const u = [...uniformes]; u[index].genero = v; setUniformes(u); }}>
                    <SelectTrigger className="h-10 text-sm border-[#d1d5db] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{generos.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Tamanho</label>
                  <Select value={uniforme.tamanho} onValueChange={(v) => { const u = [...uniformes]; u[index].tamanho = v; setUniformes(u); }}>
                    <SelectTrigger className="h-10 text-sm border-[#d1d5db] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tamanhosRoupas.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Qtd.</label>
                  <Input type="number" min="0" value={uniforme.quantidade} onChange={(e) => { const u = [...uniformes]; u[index].quantidade = parseInt(e.target.value) || 0; setUniformes(u); }} className="h-10 text-sm border-[#d1d5db] bg-white" />
                </div>
                {uniformes.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeUniforme(uniforme.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 shrink-0 rounded-lg mb-0.5"><Trash2 className="w-3.5 h-3.5" /></Button>}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#f1f5f9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-4 rounded-full bg-[#111c44] inline-block" />
              <h2 className="text-sm font-bold text-[#1e293b] tracking-wide">Calcados</h2>
            </div>
            <Button variant="outline" size="sm" onClick={addCalcado} className="h-8 text-xs border-[#d1d5db] bg-transparent hover:bg-[#f8fafc] font-semibold"><Plus className="w-3 h-3 mr-1.5" /> Adicionar</Button>
          </div>
          <div className="px-5 pb-6 pt-4 space-y-3">
            {calcados.map((calcado, index) => (
              <div key={calcado.id} className="flex items-end gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Tamanho</label>
                  <Select value={calcado.tamanho} onValueChange={(v) => { const c = [...calcados]; c[index].tamanho = v; setCalcados(c); }}>
                    <SelectTrigger className="h-10 text-sm border-[#d1d5db] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tamanhosCalcados.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b]">Qtd.</label>
                  <Input type="number" min="0" value={calcado.quantidade} onChange={(e) => { const c = [...calcados]; c[index].quantidade = parseInt(e.target.value) || 0; setCalcados(c); }} className="h-10 text-sm border-[#d1d5db] bg-white" />
                </div>
                {calcados.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeCalcado(calcado.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 shrink-0 rounded-lg mb-0.5"><Trash2 className="w-3.5 h-3.5" /></Button>}
              </div>
            ))}
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
