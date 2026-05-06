"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Clock, CheckCircle2, Loader2, FileText, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSolicitacoesPorInstituicao } from "@/lib/solicitacoes-store";
import type { Solicitacao } from "@/lib/solicitacoes-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

export default function MinhasSolicitacoesPage() {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [solicitacoesLista, setSolicitacoesLista] = useState<Solicitacao[]>([]);
  const [erroSolicitacao, setErroSolicitacao] = useState("");
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const buscarMinhasSolicitacoes = () => {
    if (!nome || !matricula || !instituicao) {
      setErroSolicitacao("Preencha todos os dados do solicitante");
      return;
    }
    const solicitacoes = getSolicitacoesPorInstituicao(instituicao);
    setBuscaRealizada(true);
    if (solicitacoes.length > 0) {
      setSolicitacoesLista(solicitacoes);
      setErroSolicitacao("");
    } else {
      setSolicitacoesLista([]);
      setErroSolicitacao("Nenhuma solicitacao encontrada para esta instituicao.");
    }
  };

  const getStatusLabel = (solicitacao: Solicitacao) => {
    if (solicitacao.encaminhadoLogistica) {
      return { label: "Em Processamento", color: "bg-[#10b981]", icon: CheckCircle2 };
    }
    if (solicitacao.status === "Processamento") {
      return { label: "Em Processamento", color: "bg-[#f59e0b]", icon: Loader2 };
    }
    if (solicitacao.status === "Finalizado") {
      return { label: "Finalizada", color: "bg-[#10b981]", icon: CheckCircle2 };
    }
    return { label: "Pendente", color: "bg-[#6b7280]", icon: Clock };
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      "kits-uniformes": "Kits e Uniformes",
      "almoxarifado": "Almoxarifado",
      "patrimonio": "Patrimonio",
      "transferencia": "Transferencia",
    };
    return labels[tipo] || tipo;
  };

  const limparBusca = () => {
    setSolicitacaoSelecionada(null);
    setSolicitacoesLista([]);
    setErroSolicitacao("");
    setBuscaRealizada(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-scale-in">
            <List className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-wide">MINHAS SOLICITACOES</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium transition-all duration-300 hover:-translate-x-1 animate-fade-in">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-5 pt-4 pb-1">
            <h2 className="text-sm font-bold text-[#1e293b]">Dados do Solicitante</h2>
          </div>
          <div className="px-5 pb-5 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-[#1e293b]">Nome da Instituicao</label>
                <Select value={instituicao} onValueChange={setInstituicao}>
                  <SelectTrigger className="h-9 text-sm border-[#d1d5db]">
                    <SelectValue placeholder="Selecione a instituicao" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getInstituicoesAtivas().map((inst) => (
                      <SelectItem key={inst} value={inst} className="text-xs">{inst}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-[#1e293b]">Seu Nome</label>
                <Input
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-9 text-sm border-[#d1d5db]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-[#1e293b]">Matricula</label>
                <Input
                  placeholder="Digite sua matricula"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="h-9 text-sm border-[#d1d5db]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buscar Minhas Solicitacoes */}
        <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-5 pt-4 pb-1">
            <h2 className="text-sm font-bold text-[#1e293b]">Buscar Solicitacoes</h2>
            <p className="text-xs text-[#64748b] mt-1">Veja todas as solicitacoes da sua instituicao.</p>
          </div>
          <div className="px-5 pb-5 pt-3">
            <div className="flex items-end gap-2">
              <Button
                onClick={buscarMinhasSolicitacoes}
                className="h-9 bg-[#111c44] hover:bg-[#1a2755] text-white px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar Solicitacoes
              </Button>
              {buscaRealizada && (
                <Button
                  variant="outline"
                  onClick={limparBusca}
                  className="h-9 border-[#d1d5db] text-[#64748b]"
                >
                  Limpar
                </Button>
              )}
            </div>
            {erroSolicitacao && (
              <p className="text-sm text-red-500 mt-3">{erroSolicitacao}</p>
            )}
          </div>
        </div>

        {/* Lista de Solicitacoes */}
        {solicitacoesLista.length > 0 && (
          <div className="mb-5 space-y-3">
            <p className="text-sm font-semibold text-[#1e293b]">
              {solicitacoesLista.length} solicitacao(oes) encontrada(s)
            </p>
            {solicitacoesLista.map((sol) => (
              <div
                key={sol.id}
                className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition-colors ${
                  solicitacaoSelecionada?.id === sol.id ? "border-[#111c44] ring-2 ring-[#111c44]/20" : "border-[#d1d5db] hover:border-[#111c44]"
                }`}
                onClick={() => setSolicitacaoSelecionada(solicitacaoSelecionada?.id === sol.id ? null : sol)}
              >
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#111c44]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#111c44]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111c44]">{getTipoLabel(sol.tipo)}</p>
                      <p className="text-xs text-[#64748b]">{sol.dataHora}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium ${getStatusLabel(sol).color}`}>
                    {(() => {
                      const StatusIcon = getStatusLabel(sol).icon;
                      return <StatusIcon className="w-3.5 h-3.5" />;
                    })()}
                    {getStatusLabel(sol).label}
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {solicitacaoSelecionada?.id === sol.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#e2e8f0] space-y-4">
                    {/* Quando ainda esta pendente - mostra apenas status */}
                    {!sol.encaminhadoLogistica && (
                      <div className="bg-[#fef9c3] border border-[#fde047] rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <Clock className="w-8 h-8 text-[#a16207]" />
                          <div>
                            <p className="text-sm font-semibold text-[#a16207]">Solicitacao Pendente</p>
                            <p className="text-xs text-[#a16207]/80">
                              Aguardando processamento pelo setor responsavel.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quando encaminhada para processamento - mostra todas as informacoes */}
                    {sol.encaminhadoLogistica && (
                      <>
                        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#047857]" />
                            <p className="text-sm font-semibold text-[#047857]">Em Processamento</p>
                          </div>
                          {sol.statusLogistica && (
                            <p className="text-sm text-[#065f46] mt-1 ml-7">
                              Status: <span className="font-bold">{sol.statusLogistica}</span>
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-[#64748b] mb-1">Solicitante</p>
                            <p className="text-sm font-semibold text-[#1e293b]">{sol.nome}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#64748b] mb-1">Matricula</p>
                            <p className="text-sm font-semibold text-[#1e293b]">{sol.matricula}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#64748b] mb-1">Instituicao</p>
                            <p className="text-sm font-semibold text-[#1e293b]">{sol.instituicao}</p>
                          </div>
                        </div>

                        {/* Itens solicitados */}
                        {sol.itens && sol.itens.length > 0 && (
                          <div>
                            <p className="text-xs text-[#64748b] mb-2">Itens Solicitados</p>
                            <div className="bg-[#f8fafc] rounded-lg p-3 space-y-2">
                              {sol.itens.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-[#1e293b]">{item.tipo}</span>
                                  <span className="font-semibold text-[#111c44]">Qtd: {item.quantidade}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Detalhes de uniformes/kits */}
                        {(sol.uniformesDetalhes || sol.calcadosDetalhes || sol.kitsAlunoDetalhes || sol.mochilasDetalhes) && (
                          <div>
                            <p className="text-xs text-[#64748b] mb-2">Detalhes dos Itens</p>
                            <div className="bg-[#f8fafc] rounded-lg p-3 space-y-2 text-sm">
                              {sol.uniformesDetalhes?.map((item, idx) => (
                                <div key={`uni-${idx}`} className="flex justify-between">
                                  <span>Uniforme {item.tipo} - {item.genero} - Tam. {item.tamanho}</span>
                                  <span className="font-semibold">Qtd: {item.quantidade}</span>
                                </div>
                              ))}
                              {sol.calcadosDetalhes?.map((item, idx) => (
                                <div key={`calc-${idx}`} className="flex justify-between">
                                  <span>Calcado - Tam. {item.tamanho}</span>
                                  <span className="font-semibold">Qtd: {item.quantidade}</span>
                                </div>
                              ))}
                              {sol.kitsAlunoDetalhes?.map((item, idx) => (
                                <div key={`kit-${idx}`} className="flex justify-between">
                                  <span>{item.tipo || "Kit Aluno"}</span>
                                  <span className="font-semibold">Qtd: {item.quantidade}</span>
                                </div>
                              ))}
                              {sol.mochilasDetalhes?.map((item, idx) => (
                                <div key={`moch-${idx}`} className="flex justify-between">
                                  <span>Mochila {item.tipo}</span>
                                  <span className="font-semibold">Qtd: {item.quantidade}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
