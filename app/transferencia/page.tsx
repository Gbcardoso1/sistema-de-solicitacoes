"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, ArrowRightLeft, Download, AlertTriangle, X, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSolicitacao } from "@/lib/solicitacoes-store";
import { gerarPDFTransferencia } from "@/lib/gerar-comprovante-pdf";
import { INSTITUICOES } from "@/lib/instituicoes";

const situacoes = ["BOM", "RUIM", "REGULAR", "INSERVIVEL"];
const condicoes = ["BAIXA", "TRANSFERENCIA"];

interface ItemTransferencia { id: number; numeroPatrimonio: string; descricaoItem: string }

export default function TransferenciaPage() {
  const router = useRouter();
  const [unidadeOrigem, setUnidadeOrigem] = useState("");
  const [responsavelOrigem, setResponsavelOrigem] = useState("");
  const [matriculaOrigem, setMatriculaOrigem] = useState("");
  const [unidadeDestino, setUnidadeDestino] = useState("");
  const [responsavelDestino, setResponsavelDestino] = useState("");
  const [matriculaDestino, setMatriculaDestino] = useState("");
  const [tmbpPms, setTmbpPms] = useState("");
  const [data, setData] = useState(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }));
  const [situacao, setSituacao] = useState("");
  const [condicao, setCondicao] = useState("");
  const [itens, setItens] = useState<ItemTransferencia[]>([{ id: 1, numeroPatrimonio: "", descricaoItem: "" }]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pdfBaixado, setPdfBaixado] = useState(false);
  const [arquivoLaudo, setArquivoLaudo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addItem = () => setItens([...itens, { id: Date.now(), numeroPatrimonio: "", descricaoItem: "" }]);
  const removeItem = (id: number) => { if (itens.length > 1) setItens(itens.filter((i) => i.id !== id)); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoLaudo(file);
    }
  };

  const handleRemoveFile = () => {
    setArquivoLaudo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const itensFiltrados = itens.filter(i => i.descricaoItem);

  const getDadosTransferencia = () => ({
    unidadeOrigem,
    responsavelOrigem,
    matriculaOrigem,
    unidadeDestino,
    responsavelDestino,
    matriculaDestino,
    tmbpPms,
    data,
    situacao,
    condicao,
    itens: itensFiltrados,
    arquivoLaudo: arquivoLaudo?.name || null,
  });

  const handleFinalizar = () => {
    if (!unidadeOrigem || !unidadeDestino) { alert("Preencha todos os campos obrigatorios"); return; }
    if (itensFiltrados.length === 0) { alert("Adicione pelo menos um item com descricao"); return; }
    setModalAberto(true);
    setPdfBaixado(false);
  };

  const handleBaixarPDF = () => { gerarPDFTransferencia(getDadosTransferencia()); setPdfBaixado(true); };

  const handleConfirmarEnvio = () => {
    addSolicitacao({
      tipo: "transferencia", nome: responsavelOrigem, matricula: matriculaOrigem, instituicao: unidadeOrigem,
      dados: { unidadeOrigem, responsavelOrigem, matriculaOrigem, unidadeDestino, responsavelDestino, matriculaDestino, tmbpPms, data, situacao, condicao, itens, arquivoLaudo: arquivoLaudo?.name || null },
      unidadeOrigem,
      unidadeDestino,
      responsavelDestino,
      matriculaDestino,
      tmbpPms,
      situacao,
      condicao,
      itensTransferencia: itens,
      arquivoLaudo: arquivoLaudo?.name || null,
    });
    setModalAberto(false);
    alert("Transferencia realizada");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><ArrowRightLeft className="w-5 h-5" /></div>
        <h1 className="text-lg font-bold tracking-wide">TRANSFERENCIA DE ITENS</h1>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Voltar</Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Unidade de Origem */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Unidade de Origem</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Nome da Unidade</label>
                  <Select value={unidadeOrigem} onValueChange={setUnidadeOrigem}>
                    <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                    <SelectContent className="max-h-60">{INSTITUICOES.map(inst => <SelectItem key={inst} value={inst} className="text-sm">{inst}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Responsavel</label>
                  <Input placeholder="Nome do responsavel" value={responsavelOrigem} onChange={(e) => setResponsavelOrigem(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Matricula</label>
                  <Input placeholder="Matricula do responsavel" value={matriculaOrigem} onChange={(e) => setMatriculaOrigem(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                </div>
              </div>
            </div>
          </div>

          {/* Unidade de Destino */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Unidade de Destino</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Nome da Unidade</label>
                  <Select value={unidadeDestino} onValueChange={setUnidadeDestino}>
                    <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                    <SelectContent className="max-h-60">{INSTITUICOES.map(inst => <SelectItem key={inst} value={inst} className="text-sm">{inst}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Responsavel</label>
                  <Input placeholder="Nome do responsavel" value={responsavelDestino} onChange={(e) => setResponsavelDestino(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-[#475569]">Matricula</label>
                  <Input placeholder="Matricula do responsavel" value={matriculaDestino} onChange={(e) => setMatriculaDestino(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes da Transferencia */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <h2 className="text-base font-semibold text-[#1e293b]">Detalhes da Transferencia</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">TMBP/PMS n</label>
                <Input placeholder="Numero TMBP/PMS" value={tmbpPms} onChange={(e) => setTmbpPms(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Data</label>
                <Input value={data} onChange={(e) => setData(e.target.value)} className="h-11 text-sm border-[#e2e8f0] bg-white" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-[#475569]">Situacao do Item</label>
                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger className="h-11 text-sm border-[#e2e8f0] bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{situacoes.map((s) => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm text-[#475569] mb-2">Condicao</label>
              <div className="flex flex-wrap gap-3">
                {condicoes.map((c) => (
                  <button 
                    key={c} 
                    type="button" 
                    onClick={() => setCondicao(c)} 
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all ${condicao === c ? "bg-[#111c44] text-white border-[#111c44]" : "bg-white text-[#475569] border-[#e2e8f0] hover:border-[#3b82f6]"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Laudo da Protomar (Opcional)</label>
              <p className="text-xs text-[#94a3b8] mb-3">Anexe o laudo caso o item esteja danificado ou inservivel</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
              />
              {!arquivoLaudo ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-11 text-sm border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#475569]"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Arquivo
                </Button>
              ) : (
                <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111c44]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#111c44]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1e293b] truncate">{arquivoLaudo.name}</p>
                    <p className="text-xs text-[#94a3b8]">{(arquivoLaudo.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itens para Transferencia */}
        <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <h2 className="text-base font-semibold text-[#1e293b]">Itens para Transferencia</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addItem} className="h-9 text-sm border-[#3b82f6] text-[#3b82f6] bg-white hover:bg-[#eff6ff] font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar item
              </Button>
            </div>

            <div className="hidden md:grid grid-cols-[1fr_2fr_auto] gap-4 mb-3 px-1">
              <span className="text-sm text-[#475569]">N Patrimonio</span>
              <span className="text-sm text-[#475569]">Descricao do Item</span>
              <span className="w-11" />
            </div>

            <div className="space-y-3">
              {itens.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                  <div className="space-y-2 md:space-y-0">
                    <label className="md:hidden block text-sm text-[#475569]">N Patrimonio</label>
                    <Input placeholder="Ex: 12345" value={item.numeroPatrimonio} onChange={(e) => { const u = [...itens]; u[index].numeroPatrimonio = e.target.value; setItens(u); }} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                  <div className="space-y-2 md:space-y-0">
                    <label className="md:hidden block text-sm text-[#475569]">Descricao do Item</label>
                    <Input placeholder="Descricao do item" value={item.descricaoItem} onChange={(e) => { const u = [...itens]; u[index].descricaoItem = e.target.value; setItens(u); }} className="h-11 text-sm border-[#e2e8f0] bg-white placeholder:text-[#94a3b8]" />
                  </div>
                  {itens.length > 1 && (
                    <Button variant="outline" size="icon" onClick={() => removeItem(item.id)} className="h-11 w-11 border-[#e2e8f0] text-[#94a3b8] hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {itensFiltrados.length > 0 && (
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
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Unidade de Origem</h3>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p><span className="font-medium">Unidade:</span> {unidadeOrigem}</p>
                  <p><span className="font-medium">Responsavel:</span> {responsavelOrigem}</p>
                  <p><span className="font-medium">Matricula:</span> {matriculaOrigem}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Unidade de Destino</h3>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p><span className="font-medium">Unidade:</span> {unidadeDestino}</p>
                  <p><span className="font-medium">Responsavel:</span> {responsavelDestino}</p>
                  <p><span className="font-medium">Matricula:</span> {matriculaDestino}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Detalhes</h3>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p><span className="font-medium">TMBP/PMS:</span> {tmbpPms || "N/A"}</p>
                  <p><span className="font-medium">Data:</span> {data}</p>
                  <p><span className="font-medium">Situacao do Item:</span> {situacao || "N/A"}</p>
                  <p><span className="font-medium">Condicao:</span> {condicao || "N/A"}</p>
                  {arquivoLaudo && (
                    <div className="mt-2 flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-2">
                      <FileText className="w-4 h-4 text-[#16a34a]" />
                      <span className="text-sm text-[#16a34a] font-medium">Laudo anexado: {arquivoLaudo.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e293b] mb-2">Itens</h3>
                <div className="space-y-1.5">
                  {itensFiltrados.map((item, i) => (
                    <div key={item.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151]">
                      <p className="font-medium">Item {i + 1}</p>
                      <p>Patrimonio: {item.numeroPatrimonio || "N/A"} | Descricao: {item.descricaoItem}</p>
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
