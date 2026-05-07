"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Package, Download, AlertTriangle, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSolicitacao } from "@/lib/solicitacoes-store";
import { gerarComprovantePDF } from "@/lib/gerar-comprovante-pdf";
import { getNomesAtivos } from "@/lib/itens-catalogo-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

interface KitAlunoItem { id: number; tipo: string; quantidade: number }
interface MochilaItem { id: number; tamanho: string; quantidade: number }
interface KitProfItem { id: number; kit: string; quantidade: number }

export default function KitsPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [kitsAluno, setKitsAluno] = useState<KitAlunoItem[]>([{ id: 1, tipo: "", quantidade: 0 }]);
  const [mochilas, setMochilas] = useState<MochilaItem[]>([{ id: 1, tamanho: "", quantidade: 0 }]);
  const [kitsProf, setKitsProf] = useState<KitProfItem[]>([{ id: 1, kit: "Kit Professor", quantidade: 0 }]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);

  const tiposKitAluno = getNomesAtivos("kitAluno");
  const tamanhosMochila = getNomesAtivos("mochila");

  const addKit = () => setKitsAluno([...kitsAluno, { id: Date.now(), tipo: "", quantidade: 0 }]);
  const removeKit = (id: number) => { if (kitsAluno.length > 1) setKitsAluno(kitsAluno.filter(k => k.id !== id)); };
  const addMochila = () => setMochilas([...mochilas, { id: Date.now(), tamanho: "", quantidade: 0 }]);
  const removeMochila = (id: number) => { if (mochilas.length > 1) setMochilas(mochilas.filter(m => m.id !== id)); };
  const addProf = () => setKitsProf([...kitsProf, { id: Date.now(), kit: "Kit Professor", quantidade: 0 }]);
  const removeProf = (id: number) => { if (kitsProf.length > 1) setKitsProf(kitsProf.filter(k => k.id !== id)); };

  const incrementKitQtd = (id: number) => {
    setKitsAluno(kitsAluno.map(k => k.id === id ? { ...k, quantidade: k.quantidade + 1 } : k));
  };
  const decrementKitQtd = (id: number) => {
    setKitsAluno(kitsAluno.map(k => k.id === id ? { ...k, quantidade: Math.max(0, k.quantidade - 1) } : k));
  };

  const incrementMochilaQtd = (id: number) => {
    setMochilas(mochilas.map(m => m.id === id ? { ...m, quantidade: m.quantidade + 1 } : m));
  };
  const decrementMochilaQtd = (id: number) => {
    setMochilas(mochilas.map(m => m.id === id ? { ...m, quantidade: Math.max(0, m.quantidade - 1) } : m));
  };

  const incrementProfQtd = (id: number) => {
    setKitsProf(kitsProf.map(k => k.id === id ? { ...k, quantidade: k.quantidade + 1 } : k));
  };
  const decrementProfQtd = (id: number) => {
    setKitsProf(kitsProf.map(k => k.id === id ? { ...k, quantidade: Math.max(0, k.quantidade - 1) } : k));
  };

  const kitsFiltrados = kitsAluno.filter(k => k.tipo && k.quantidade > 0);
  const mochilasFiltradas = mochilas.filter(m => m.tamanho && m.quantidade > 0);
  const profFiltrados = kitsProf.filter(k => k.quantidade > 0);

  const totalItens = kitsFiltrados.length + mochilasFiltradas.length + profFiltrados.length;

  const getDadosComprovante = () => {
    const dataHora = new Date().toLocaleString("pt-BR");
    const itensComprovante = [
      ...kitsFiltrados.map(k => ({ descricao: `Kit Aluno: ${k.tipo}`, quantidade: k.quantidade })),
      ...mochilasFiltradas.map(m => ({ descricao: `Mochila: ${m.tamanho}`, quantidade: m.quantidade })),
      ...kitsProf.filter(k => k.quantidade > 0).map(k => ({ descricao: `Kit Professor`, quantidade: k.quantidade })),
    ];
    return { tipo: "kits", nome, matricula, instituicao, dataHora, itens: itensComprovante };
  };

  const handleFinalizar = () => {
    if (!nome || !matricula || !instituicao) { alert("Preencha todos os dados do solicitante"); return; }
    const temItens = kitsFiltrados.length > 0 || mochilasFiltradas.length > 0 || profFiltrados.length > 0;
    if (!temItens) { alert("Adicione pelo menos um item com quantidade maior que zero"); return; }
    setModalAberto(true);
    setPdfBaixado(false);
  };

  const handleBaixarPDF = async () => { await gerarComprovantePDF(getDadosComprovante()); setPdfBaixado(true); };

  const handleConfirmarEnvio = () => {
    addSolicitacao({
      tipo: "kits", nome, matricula, instituicao,
      dados: { kitsAluno, mochilas, kitsProf },
      kitsAluno: kitsAluno.reduce((a, k) => a + k.quantidade, 0),
      mochilas: mochilas.reduce((a, m) => a + m.quantidade, 0),
      kitsAlunoDetalhes: kitsFiltrados.map(k => ({ tipo: k.tipo, quantidade: k.quantidade })),
      mochilasDetalhes: mochilasFiltradas.map(m => ({ tipo: m.tamanho, quantidade: m.quantidade })),
      kitsProfDetalhes: kitsProf.filter(k => k.quantidade > 0).map(k => ({ tipo: k.kit, quantidade: k.quantidade })),
    });
    setModalAberto(false);
    alert("Solicitacao enviada com sucesso!");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Package className="w-5 h-5" /></div>
        <h1 className="text-lg font-bold tracking-wide">SOLICITAR KITS</h1>
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

        {/* Kits de Aluno */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Kits de Aluno</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addKit} className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar item
              </Button>
            </div>

            <div className="space-y-4">
              {kitsAluno.map((kit, i) => (
                <div key={kit.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Item</label>
                    <Select value={kit.tipo} onValueChange={(v) => { const k = [...kitsAluno]; k[i].tipo = v; setKitsAluno(k); }}>
                      <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione o item" /></SelectTrigger>
                      <SelectContent>{tiposKitAluno.map(t => <SelectItem key={t} value={t} className="text-sm">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Quantidade</label>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="icon" onClick={() => decrementKitQtd(kit.id)} className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]">
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input type="number" min="0" value={kit.quantidade} onChange={(e) => { const k = [...kitsAluno]; k[i].quantidade = parseInt(e.target.value) || 0; setKitsAluno(k); }} className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white" />
                      <Button type="button" variant="outline" size="icon" onClick={() => incrementKitQtd(kit.id)} className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]">
                        <Plus className="w-4 h-4" />
                      </Button>
                      {kitsAluno.length > 1 && (
                        <Button variant="outline" size="icon" onClick={() => removeKit(kit.id)} className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {kitsFiltrados.length > 0 && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                  {kitsFiltrados.length} {kitsFiltrados.length === 1 ? 'item adicionado' : 'itens adicionados'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mochila */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Mochila</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addMochila} className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar item
              </Button>
            </div>

            <div className="space-y-4">
              {mochilas.map((m, i) => (
                <div key={m.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Item</label>
                    <Select value={m.tamanho} onValueChange={(v) => { const arr = [...mochilas]; arr[i].tamanho = v; setMochilas(arr); }}>
                      <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione o item" /></SelectTrigger>
                      <SelectContent>{tamanhosMochila.map(t => <SelectItem key={t} value={t} className="text-sm">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Quantidade</label>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="icon" onClick={() => decrementMochilaQtd(m.id)} className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]">
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input type="number" min="0" value={m.quantidade} onChange={(e) => { const arr = [...mochilas]; arr[i].quantidade = parseInt(e.target.value) || 0; setMochilas(arr); }} className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white" />
                      <Button type="button" variant="outline" size="icon" onClick={() => incrementMochilaQtd(m.id)} className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]">
                        <Plus className="w-4 h-4" />
                      </Button>
                      {mochilas.length > 1 && (
                        <Button variant="outline" size="icon" onClick={() => removeMochila(m.id)} className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {mochilasFiltradas.length > 0 && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                  {mochilasFiltradas.length} {mochilasFiltradas.length === 1 ? 'item adicionado' : 'itens adicionados'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Kit de Professor */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Kit de Professor</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addProf} className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar item
              </Button>
            </div>

            <div className="space-y-4">
              {kitsProf.map((k, i) => (
                <div key={k.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Selecionar Kit de Professor</label>
                    <Select value={k.kit} disabled>
                      <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Kit Professor">Kit Professor</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-[#475569]">Quantidade</label>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="icon" onClick={() => decrementProfQtd(k.id)} className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]">
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input type="number" min="0" value={k.quantidade} onChange={(e) => { const arr = [...kitsProf]; arr[i].quantidade = parseInt(e.target.value) || 0; setKitsProf(arr); }} className="h-11 w-16 text-sm text-center border-[#e2e8f0] bg-white" />
                      <Button type="button" variant="outline" size="icon" onClick={() => incrementProfQtd(k.id)} className="h-11 w-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]">
                        <Plus className="w-4 h-4" />
                      </Button>
                      {kitsProf.length > 1 && (
                        <Button variant="outline" size="icon" onClick={() => removeProf(k.id)} className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {profFiltrados.length > 0 && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f1f5f9] text-sm text-[#64748b]">
                  {profFiltrados.length} {profFiltrados.length === 1 ? 'item adicionado' : 'itens adicionados'}
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
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Dados do Solicitante</h3>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p><span className="font-medium">Nome:</span> {nome}</p>
                  <p><span className="font-medium">Matricula:</span> {matricula}</p>
                  <p><span className="font-medium">Instituicao:</span> {instituicao}</p>
                </div>
              </div>
              {kitsFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Kits de Aluno</h3>
                  <div className="space-y-1.5">
                    {kitsFiltrados.map((item, i) => (
                      <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                        <p className="font-medium">Item {i + 1}</p>
                        <p>Tipo: {item.tipo} | Quantidade: {item.quantidade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {profFiltrados.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Kit de Professor - Polo</h3>
                  <div className="space-y-1.5">
                    {profFiltrados.map((item, i) => (
                      <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                        <p className="font-medium">Item {i + 1}</p>
                        <p>Kit: {item.kit} | Qtd Kit: {item.quantidade}</p>
                        {item.tamanhoPolo && <p>Tamanho da Polo: {item.tamanhoPolo} | Quantidade: {item.quantidadePolo}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {mochilasFiltradas.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] mb-2">Mochila</h3>
                  <div className="space-y-1.5">
                    {mochilasFiltradas.map((item, i) => (
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
