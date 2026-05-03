"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Clock, CheckCircle2, Loader2, FileText, Download, List, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSolicitacaoPorNumero, getSolicitacoesPorInstituicao } from "@/lib/solicitacoes-store";
import type { Solicitacao } from "@/lib/solicitacoes-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";
import { gerarComprovantePDF } from "@/lib/gerar-comprovante-pdf";

type TipoBusca = "individual" | "minhas";

export default function MinhasSolicitacoesPage() {
  const [tipoBusca, setTipoBusca] = useState<TipoBusca>("individual");
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [numeroSolicitacao, setNumeroSolicitacao] = useState("");
  const [solicitacaoEncontrada, setSolicitacaoEncontrada] = useState<Solicitacao | null>(null);
  const [solicitacoesLista, setSolicitacoesLista] = useState<Solicitacao[]>([]);
  const [erroSolicitacao, setErroSolicitacao] = useState("");
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const buscarSolicitacao = () => {
    if (!nome || !matricula || !instituicao) {
      setErroSolicitacao("Preencha todos os dados do solicitante");
      return;
    }
    if (!numeroSolicitacao.trim()) {
      setErroSolicitacao("Digite o numero da solicitacao");
      return;
    }
    const solicitacao = getSolicitacaoPorNumero(numeroSolicitacao.trim());
    setBuscaRealizada(true);
    if (solicitacao) {
      setSolicitacaoEncontrada(solicitacao);
      setErroSolicitacao("");
    } else {
      setSolicitacaoEncontrada(null);
      setErroSolicitacao("Solicitacao nao encontrada. Verifique o numero e tente novamente.");
    }
  };

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

  const handleTipoBuscaChange = (tipo: TipoBusca) => {
    setTipoBusca(tipo);
    limparBusca();
    setSolicitacoesLista([]);
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
    setNumeroSolicitacao("");
    setSolicitacaoEncontrada(null);
    setErroSolicitacao("");
    setBuscaRealizada(false);
  };

  const getItensParaPDF = (solicitacao: Solicitacao) => {
    const itens: { descricao: string; quantidade: number }[] = [];
    
    // Itens de patrimonio
    if (solicitacao.itens) {
      solicitacao.itens.forEach(item => {
        itens.push({ descricao: item.tipo, quantidade: item.quantidade });
      });
    }
    
    // Itens de uniformes
    if (solicitacao.uniformesDetalhes) {
      solicitacao.uniformesDetalhes.forEach(item => {
        itens.push({ 
          descricao: `Uniforme ${item.tipo} - ${item.genero} - Tam. ${item.tamanho}`, 
          quantidade: item.quantidade 
        });
      });
    }
    
    // Calcados
    if (solicitacao.calcadosDetalhes) {
      solicitacao.calcadosDetalhes.forEach(item => {
        itens.push({ descricao: `Calcado - Tam. ${item.tamanho}`, quantidade: item.quantidade });
      });
    }
    
    // Kits
    if (solicitacao.kitsAlunoDetalhes) {
      solicitacao.kitsAlunoDetalhes.forEach(item => {
        itens.push({ descricao: item.tipo || "Kit Aluno", quantidade: item.quantidade });
      });
    }
    
    // Polos
    if (solicitacao.polosProfDetalhes) {
      solicitacao.polosProfDetalhes.forEach(item => {
        itens.push({ descricao: `${item.tipo} - Tam. ${item.tamanho}`, quantidade: item.quantidade });
      });
    }
    
    // Mochilas
    if (solicitacao.mochilasDetalhes) {
      solicitacao.mochilasDetalhes.forEach(item => {
        itens.push({ descricao: `Mochila ${item.tipo}`, quantidade: item.quantidade });
      });
    }
    
    // Transferencia
    if (solicitacao.descricaoItem) {
      itens.push({ descricao: solicitacao.descricaoItem, quantidade: 1 });
    }
    
    return itens;
  };

  const handleBaixarPDF = () => {
    if (!solicitacaoEncontrada) return;
    
    const itens = getItensParaPDF(solicitacaoEncontrada);
    
    gerarComprovantePDF({
      tipo: solicitacaoEncontrada.tipo,
      nome: solicitacaoEncontrada.nome,
      matricula: solicitacaoEncontrada.matricula,
      instituicao: solicitacaoEncontrada.instituicao,
      dataHora: solicitacaoEncontrada.dataHora,
      itens: itens.length > 0 ? itens : [{ descricao: "Solicitacao sem itens detalhados", quantidade: 1 }],
      numeroSolicitacao: solicitacaoEncontrada.numeroSolicitacao,
    });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-scale-in">
            <Search className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-wide">VERIFICAR SOLICITACAO</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium transition-all duration-300 hover:-translate-x-1 animate-fade-in">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

          <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden animate-fade-in-up animation-delay-100 hover-lift">
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

        {/* Abas de tipo de busca */}
          <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
              <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1e293b]">Tipo de consulta</p>
              </div>
              <div className="px-5 py-3 flex gap-2">
                <button
                  onClick={() => handleTipoBuscaChange("individual")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    tipoBusca === "individual"
                      ? "bg-[#111c44] text-white shadow-sm"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Solicitacao Individual
                </button>
                <button
                  onClick={() => handleTipoBuscaChange("minhas")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    tipoBusca === "minhas"
                      ? "bg-[#111c44] text-white shadow-sm"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  <List className="w-4 h-4" />
                  Minhas Solicitacoes
                </button>
              </div>
          </div>
        </div>

        {/* Busca Individual */}
        {tipoBusca === "individual" && (
          <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
            <div className="px-5 pt-4 pb-1">
              <h2 className="text-sm font-bold text-[#1e293b]">Buscar Solicitacao Individual</h2>
              <p className="text-xs text-[#64748b] mt-1">Busque uma solicitacao especifica pelo numero de pedido.</p>
            </div>
            <div className="px-5 pb-5 pt-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5 text-[#1e293b]">Numero da Solicitacao</label>
                  <Input
                    placeholder="Ex: SOL-A1B2C3"
                    value={numeroSolicitacao}
                    onChange={(e) => {
                      setNumeroSolicitacao(e.target.value.toUpperCase());
                      setErroSolicitacao("");
                      setBuscaRealizada(false);
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") buscarSolicitacao(); }}
                    className="h-9 text-sm border-[#d1d5db] uppercase"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={buscarSolicitacao}
                    className="h-9 bg-[#111c44] hover:bg-[#1a2755] text-white px-6"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
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
              </div>
              {erroSolicitacao && (
                <p className="text-sm text-red-500 mt-3">{erroSolicitacao}</p>
              )}
            </div>
          </div>
        )}

        {/* Buscar Minhas Solicitacoes */}
        {tipoBusca === "minhas" && (
          <div className="mb-5 bg-white rounded-2xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden">
            <div className="px-5 pt-4 pb-1">
              <h2 className="text-sm font-bold text-[#1e293b]">Buscar Minhas Solicitacoes</h2>
              <p className="text-xs text-[#64748b] mt-1">Veja todas as solicitacoes da sua instituicao.</p>
            </div>
            <div className="px-5 pb-5 pt-3">
              <div className="flex items-end gap-2">
                <Button
                  onClick={buscarMinhasSolicitacoes}
                  className="h-9 bg-[#111c44] hover:bg-[#1a2755] text-white px-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Minhas Solicitacoes
                </Button>
                {buscaRealizada && solicitacoesLista.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSolicitacoesLista([]);
                      setBuscaRealizada(false);
                      setErroSolicitacao("");
                    }}
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
        )}

        {/* Lista de Minhas Solicitacoes */}
        {tipoBusca === "minhas" && solicitacoesLista.length > 0 && (
          <div className="mb-5 space-y-3">
            <p className="text-sm font-semibold text-[#1e293b]">
              {solicitacoesLista.length} solicitacao(oes) encontrada(s)
            </p>
            {solicitacoesLista.map((sol) => (
              <div
                key={sol.id}
                className="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden cursor-pointer hover:border-[#111c44] transition-colors"
                onClick={() => {
                  setTipoBusca("individual");
                  setNumeroSolicitacao(sol.numeroSolicitacao);
                  setSolicitacaoEncontrada(sol);
                  setBuscaRealizada(true);
                  setSolicitacoesLista([]);
                }}
              >
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#111c44]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#111c44]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111c44]">{sol.numeroSolicitacao}</p>
                      <p className="text-xs text-[#64748b]">{getTipoLabel(sol.tipo)} - {sol.dataHora}</p>
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
              </div>
            ))}
          </div>
        )}

        {tipoBusca === "individual" && solicitacaoEncontrada && (
          <div className="bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">
            <div className="bg-[#f8fafc] px-5 py-4 border-b border-[#e2e8f0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#111c44]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#111c44]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">Solicitacao</p>
                    <p className="text-lg font-bold text-[#111c44]">{solicitacaoEncontrada.numeroSolicitacao}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium ${getStatusLabel(solicitacaoEncontrada).color}`}>
                  {(() => {
                    const StatusIcon = getStatusLabel(solicitacaoEncontrada).icon;
                    return <StatusIcon className="w-3.5 h-3.5" />;
                  })()}
                  {getStatusLabel(solicitacaoEncontrada).label}
                </div>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Quando ainda esta pendente - mostra apenas status */}
              {!solicitacaoEncontrada.encaminhadoLogistica && (
                <div className="bg-[#fef9c3] border border-[#fde047] rounded-xl p-6">
                  <div className="flex flex-col items-center justify-center text-center gap-3">
                    <Clock className="w-10 h-10 text-[#a16207]" />
                    <div>
                      <p className="text-lg font-semibold text-[#a16207] mb-1">Solicitacao Pendente</p>
                      <p className="text-sm text-[#a16207]/80">
                        Sua solicitacao esta aguardando processamento pelo setor de patrimonio.
                      </p>
                      <p className="text-xs text-[#a16207]/60 mt-2">
                        Quando for processada, voce podera ver todas as informacoes aqui.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quando encaminhada para processamento - mostra todas as informacoes */}
              {solicitacaoEncontrada.encaminhadoLogistica && (
                <>
                  <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#047857]" />
                      <p className="text-sm font-semibold text-[#047857]">Solicitacao em Processamento</p>
                    </div>
                    {solicitacaoEncontrada.statusLogistica && (
                      <p className="text-sm text-[#065f46] mt-1 ml-7">
                        Status: <span className="font-bold">{solicitacaoEncontrada.statusLogistica}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">Tipo de Solicitacao</p>
                      <p className="text-sm font-semibold text-[#1e293b]">{getTipoLabel(solicitacaoEncontrada.tipo)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">Data/Hora</p>
                      <p className="text-sm font-semibold text-[#1e293b]">{solicitacaoEncontrada.dataHora}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">Solicitante</p>
                      <p className="text-sm font-semibold text-[#1e293b]">{solicitacaoEncontrada.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">Matricula</p>
                      <p className="text-sm font-semibold text-[#1e293b]">{solicitacaoEncontrada.matricula}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#64748b] mb-1">Instituicao</p>
                    <p className="text-sm font-semibold text-[#1e293b]">{solicitacaoEncontrada.instituicao}</p>
                  </div>

                  {/* Itens solicitados */}
                  {solicitacaoEncontrada.itens && solicitacaoEncontrada.itens.length > 0 && (
                    <div>
                      <p className="text-xs text-[#64748b] mb-2">Itens Solicitados</p>
                      <div className="bg-[#f8fafc] rounded-lg p-3 space-y-2">
                        {solicitacaoEncontrada.itens.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-[#1e293b]">{item.tipo}</span>
                            <span className="font-semibold text-[#111c44]">Qtd: {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Numero do Patrimonio / Placa (para transferencias) */}
                  {solicitacaoEncontrada.numeroPatrimonio && (
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">Numero do Patrimonio/Placa</p>
                      <p className="text-sm font-semibold text-[#111c44] bg-[#f1f5f9] px-3 py-2 rounded-lg inline-block">
                        {solicitacaoEncontrada.numeroPatrimonio}
                      </p>
                    </div>
                  )}

                  {/* Descricao do Item (para transferencias) */}
                  {solicitacaoEncontrada.descricaoItem && (
                    <div>
                      <p className="text-xs text-[#64748b] mb-1">Descricao do Item</p>
                      <p className="text-sm font-semibold text-[#1e293b]">{solicitacaoEncontrada.descricaoItem}</p>
                    </div>
                  )}

                  {/* Detalhes de uniformes/kits */}
                  {(solicitacaoEncontrada.uniformesDetalhes || solicitacaoEncontrada.calcadosDetalhes || 
                    solicitacaoEncontrada.kitsAlunoDetalhes || solicitacaoEncontrada.mochilasDetalhes) && (
                    <div>
                      <p className="text-xs text-[#64748b] mb-2">Detalhes dos Itens</p>
                      <div className="bg-[#f8fafc] rounded-lg p-3 space-y-2 text-sm">
                        {solicitacaoEncontrada.uniformesDetalhes?.map((item, idx) => (
                          <div key={`uni-${idx}`} className="flex justify-between">
                            <span>Uniforme {item.tipo} - {item.genero} - Tam. {item.tamanho}</span>
                            <span className="font-semibold">Qtd: {item.quantidade}</span>
                          </div>
                        ))}
                        {solicitacaoEncontrada.calcadosDetalhes?.map((item, idx) => (
                          <div key={`calc-${idx}`} className="flex justify-between">
                            <span>Calcado - Tam. {item.tamanho}</span>
                            <span className="font-semibold">Qtd: {item.quantidade}</span>
                          </div>
                        ))}
                        {solicitacaoEncontrada.kitsAlunoDetalhes?.map((item, idx) => (
                          <div key={`kit-${idx}`} className="flex justify-between">
                            <span>{item.tipo || "Kit Aluno"}</span>
                            <span className="font-semibold">Qtd: {item.quantidade}</span>
                          </div>
                        ))}
                        {solicitacaoEncontrada.mochilasDetalhes?.map((item, idx) => (
                          <div key={`moch-${idx}`} className="flex justify-between">
                            <span>Mochila {item.tipo}</span>
                            <span className="font-semibold">Qtd: {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botao de baixar PDF */}
                  <div className="pt-4 border-t border-[#e2e8f0]">
                    <Button
                      onClick={handleBaixarPDF}
                      className="w-full bg-[#111c44] hover:bg-[#1a2755] text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Comprovante em PDF
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tipoBusca === "individual" && buscaRealizada && !solicitacaoEncontrada && !erroSolicitacao && (
          <div className="bg-white rounded-2xl border border-[#d1d5db] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f1f5f9] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#94a3b8]" />
            </div>
            <p className="text-[#64748b]">Nenhuma solicitacao encontrada com este numero.</p>
          </div>
        )}
      </div>
    </div>
  );
}
