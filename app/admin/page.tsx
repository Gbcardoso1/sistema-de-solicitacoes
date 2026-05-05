"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Trash2,
  MessageCircle,
  Send,
  Download,
  ArrowLeft,
  Search,
  X,
  LayoutDashboard,
  Package,
  Shirt,
  Armchair,
  ArrowRightLeft,
  ClipboardList,
  LogOut,
  Truck,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  BoxIcon,
  Printer,
  Boxes,
  Pencil,
  Users,
  UserPlus,
  Building,
  Building2,
  Shield,
  Check,
  XCircle,
  Key,
  Bell,
  AlertTriangle,
  PackageCheck,
  RefreshCw,
  Plus,
} from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getSolicitacoes,
  type Solicitacao,
  getConversasUnicas,
  getChatPorInstituicao,
  addChatMessage,
  marcarMensagensComoLidas,
  type ChatMessage,
  getInventarios,
  addInventario,
  updateInventario,
  getInventariosSetor,
  updateInventarioSetor,
  type SolicitacaoInventario,
  type SolicitacaoInventarioSetor,
  type InventarioItem,
  getRecibos,
  getRecibosPorTipo,
  deleteRecibo,
  type Recibo,
} from "@/lib/solicitacoes-store";
import { getItensAtivos, getTodosItens, addItem, removeItem, reativarItem, excluirItem, CATEGORIAS, type CategoriaId, type ItemCatalogo } from "@/lib/itens-catalogo-store";
import { 
  getInstituicoes, 
  addInstituicao, 
  updateInstituicao, 
  desativarInstituicao, 
  reativarInstituicao, 
  excluirInstituicao, 
  type InstituicaoItem 
} from "@/lib/instituicoes-store";
import AdminDashboard from "@/components/admin-dashboard";
import {
  getUsuarios,
  getSetores,
  getUsuariosAtivos,
  getUsuariosPendentes,
  getSetoresAtivos,
  addUsuario,
  addSetor,
  updateUsuario,
  desativarUsuario,
  reativarUsuario,
  desativarSetor,
  autenticarUsuario,
  NIVEIS_ACESSO,
  MODULOS,
  ACOES,
  type Usuario,
  type Setor,
  type Permissao,
} from "@/lib/usuarios-store";


// Dados de exemplo para arrolamentos
const ARROLAMENTOS_DADOS: Arrolamento[] = [];

type ArrolamentoItem = { placa: string; caracteristicas: string; marcaModelo: string; numSerie: string; medidas?: string; observacao?: string; data: string; local: string };
type Arrolamento = { id: string; categoria: string; descricao: string; escola?: string; setor?: string; itens: ArrolamentoItem[] };

const ITENS_POR_PAGINA = 50;

function ArrolamentoView() {
  const [arrolamentos, setArrolamentos] = useState<Arrolamento[]>(ARROLAMENTOS_DADOS);
  const [arrolamentoSelecionado, setArrolamentoSelecionado] = useState<Arrolamento | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [secretaria, setSecretaria] = useState("SMECICT");
  const [setor, setSetor] = useState("");
  const [escola, setEscola] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalNovoArrolamento, setModalNovoArrolamento] = useState(false);
  const [modalNovaLinha, setModalNovaLinha] = useState(false);
  const [modalLinhasMassa, setModalLinhasMassa] = useState(false);
  const [editandoLinha, setEditandoLinha] = useState<{ index: number; item: ArrolamentoItem } | null>(null);

  // Form linhas em massa
  const [placaInicio, setPlacaInicio] = useState("");
  const [placaFim, setPlacaFim] = useState("");
  const [caracteristicasMassa, setCaracteristicasMassa] = useState("");
  const [marcaModeloMassa, setMarcaModeloMassa] = useState("");
  const [localMassa, setLocalMassa] = useState("");

  // Form novo arrolamento
  const [novoCategoria, setNovoCategoria] = useState("");
  const [novoDescricao, setNovoDescricao] = useState("");
  const [novoPlacaInicio, setNovoPlacaInicio] = useState("");
  const [novoPlacaFim, setNovoPlacaFim] = useState("");
  const [novoMarcaModelo, setNovoMarcaModelo] = useState("");

  // Form nova linha
  const [novaPlaca, setNovaPlaca] = useState("");
  const [novaCaracteristicas, setNovaCaracteristicas] = useState("");
  const [novaMarcaModelo, setNovaMarcaModelo] = useState("");
  const [novoNumSerie, setNovoNumSerie] = useState("");
  const [novaData, setNovaData] = useState("");
  const [novoLocal, setNovoLocal] = useState("");

  const arrolamentosFiltrados = arrolamentos.filter(a => 
    a.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dataAtual = new Date();
  const dia = String(dataAtual.getDate()).padStart(2, '0');
  const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
  const ano = dataAtual.getFullYear();

  const handleAdicionarArrolamento = () => {
    if (!novoCategoria.trim() || !novoDescricao.trim()) return;
    
    // Criar itens automaticamente se tiver numero inicial e final
    const itensGerados: ArrolamentoItem[] = [];
    if (novoPlacaInicio && novoPlacaFim) {
      const inicio = parseInt(novoPlacaInicio, 10);
      const fim = parseInt(novoPlacaFim, 10);
      if (!isNaN(inicio) && !isNaN(fim) && fim >= inicio) {
        for (let i = inicio; i <= fim; i++) {
          itensGerados.push({
            placa: String(i).padStart(6, '0'),
            caracteristicas: novoDescricao.toUpperCase(),
            marcaModelo: novoMarcaModelo.toUpperCase(),
            numSerie: "",
            data: `${dia}/${mes}/${ano}`,
            local: ""
          });
        }
      }
    }
    
    const novo: Arrolamento = {
      id: String(Date.now()),
      categoria: novoCategoria.toUpperCase(),
      descricao: novoDescricao.toUpperCase(),
      escola: "",
      itens: itensGerados
    };
    setArrolamentos([...arrolamentos, novo]);
    setNovoCategoria("");
    setNovoDescricao("");
    setNovoPlacaInicio("");
    setNovoPlacaFim("");
    setNovoEscola("");
    setNovoMarcaModelo("");
    setModalNovoArrolamento(false);
  };

  const handleAdicionarLinha = () => {
    if (!arrolamentoSelecionado || !novaPlaca.trim()) return;
    const novaLinhaItem: ArrolamentoItem = {
      placa: novaPlaca,
      caracteristicas: novaCaracteristicas.toUpperCase(),
      marcaModelo: novaMarcaModelo.toUpperCase(),
      numSerie: novoNumSerie,
      data: novaData || `${dia}/${mes}/${ano}`,
      local: novoLocal.toUpperCase()
    };
    const updated = arrolamentos.map(a => 
      a.id === arrolamentoSelecionado.id 
        ? { ...a, itens: [...a.itens, novaLinhaItem] }
        : a
    );
    setArrolamentos(updated);
    setArrolamentoSelecionado({ ...arrolamentoSelecionado, itens: [...arrolamentoSelecionado.itens, novaLinhaItem] });
    setNovaPlaca("");
    setNovaCaracteristicas("");
    setNovaMarcaModelo("");
    setNovoNumSerie("");
    setNovaData("");
    setNovoLocal("");
    setModalNovaLinha(false);
  };

  const handleEditarLinha = () => {
    if (!arrolamentoSelecionado || !editandoLinha) return;
    const updated = arrolamentos.map(a => {
      if (a.id === arrolamentoSelecionado.id) {
        const novosItens = [...a.itens];
        novosItens[editandoLinha.index] = editandoLinha.item;
        return { ...a, itens: novosItens };
      }
      return a;
    });
    setArrolamentos(updated);
    const arrolamentoAtualizado = updated.find(a => a.id === arrolamentoSelecionado.id);
    if (arrolamentoAtualizado) setArrolamentoSelecionado(arrolamentoAtualizado);
    setEditandoLinha(null);
  };

  const handleExcluirLinha = (index: number) => {
    if (!arrolamentoSelecionado) return;
    const updated = arrolamentos.map(a => {
      if (a.id === arrolamentoSelecionado.id) {
        const novosItens = a.itens.filter((_, i) => i !== index);
        return { ...a, itens: novosItens };
      }
      return a;
    });
    setArrolamentos(updated);
    const arrolamentoAtualizado = updated.find(a => a.id === arrolamentoSelecionado.id);
    if (arrolamentoAtualizado) setArrolamentoSelecionado(arrolamentoAtualizado);
  };

  const handleExcluirArrolamento = (id: string) => {
    setArrolamentos(arrolamentos.filter(a => a.id !== id));
  };

  const handleAdicionarLinhasMassa = () => {
    if (!arrolamentoSelecionado || !placaInicio.trim() || !placaFim.trim()) return;
    const inicio = parseInt(placaInicio, 10);
    const fim = parseInt(placaFim, 10);
    if (isNaN(inicio) || isNaN(fim) || inicio > fim) return;
    
    const novasLinhas: ArrolamentoItem[] = [];
    for (let i = inicio; i <= fim; i++) {
      novasLinhas.push({
        placa: String(i).padStart(6, '0'),
        caracteristicas: caracteristicasMassa.toUpperCase() || arrolamentoSelecionado.descricao,
        marcaModelo: marcaModeloMassa.toUpperCase(),
        numSerie: "",
        data: `${dia}/${mes}/${ano}`,
        local: localMassa.toUpperCase()
      });
    }
    
    const updated = arrolamentos.map(a => 
      a.id === arrolamentoSelecionado.id 
        ? { ...a, itens: [...a.itens, ...novasLinhas] }
        : a
    );
    setArrolamentos(updated);
    setArrolamentoSelecionado({ ...arrolamentoSelecionado, itens: [...arrolamentoSelecionado.itens, ...novasLinhas] });
    setPlacaInicio("");
    setPlacaFim("");
    setCaracteristicasMassa("");
    setMarcaModeloMassa("");
    setLocalMassa("");
    setModalLinhasMassa(false);
  };

  // Calcula paginacao
  const totalItens = arrolamentoSelecionado?.itens.length || 0;
  const totalPaginas = Math.ceil(totalItens / ITENS_POR_PAGINA);
  const itensPaginados = arrolamentoSelecionado?.itens.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA, 
    paginaAtual * ITENS_POR_PAGINA
  ) || [];

  const handleBaixarPDFArrolamento = () => {
    if (!arrolamentoSelecionado) return;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 10;
    let y = 12;
    let folha = 1;

    const renderCabecalho = () => {
      y = 12;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Estado do Rio de Janeiro", 45, y);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.text("PREFEITURA MUNICIPAL DE SAQUAREMA", 45, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.text("Secretaria Municipal de Educacao - SME", 45, y);
      y += 4;
      doc.text("Av. Saquarema, n 4299, Porto da Roca - Saquarema - RJ", 45, y);
      y += 8;
      doc.setDrawColor(0);
      doc.line(m, y, pw - m, y);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`ESCOLA: ${escola || arrolamentoSelecionado.escola || arrolamentoSelecionado.descricao}`, m, y);
      y += 5;
      doc.text(`BENS PATRIMONIAIS - ARROLAMENTO DAS EXISTENCIAS EM 31/12/${ano}`, m, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(`Secretaria: ${secretaria}`, m, y);
      doc.text(`Setor: ${setor || arrolamentoSelecionado.setor || "-"}`, m + 60, y);
      doc.text(`Folha: ${String(folha).padStart(2, "0")}`, pw - m - 25, y);
      y += 8;
      // Header da tabela
      doc.setFillColor(240, 240, 240);
      doc.rect(m, y - 3, pw - m * 2, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      const cols = [m, m + 22, m + 100, m + 140, m + 180, m + 210, m + 240];
      const headers = ["Numero Placa", "Caracteristica de identificacao", "Marca/Modelo", "N de Serie", "Local", "Observacao"];
      headers.forEach((h, i) => doc.text(h, cols[i], y + 1));
      y += 8;
      doc.setFont("helvetica", "normal");
    };

    renderCabecalho();
    const cols = [m, m + 22, m + 100, m + 140, m + 180, m + 210, m + 240];
    arrolamentoSelecionado.itens.forEach((item, idx) => {
      if (y > ph - 20) {
        doc.addPage();
        folha++;
        renderCabecalho();
      }
      doc.setDrawColor(200);
      doc.line(m, y + 3, pw - m, y + 3);
      doc.setFontSize(7);
      doc.text(item.placa || "-", cols[0], y);
      doc.text((item.caracteristicas || "-").substring(0, 50), cols[1], y);
      doc.text((item.marcaModelo || "-").substring(0, 20), cols[2], y);
      doc.text((item.numSerie || "-").substring(0, 18), cols[3], y);
      doc.text((item.local || "-").substring(0, 15), cols[4], y);
      doc.text((item.observacao || "-").substring(0, 18), cols[5], y);
      y += 6;
    });

    doc.save(`arrolamento_${(escola || arrolamentoSelecionado.descricao).replace(/\s+/g, "_")}_${ano}.pdf`);
  };

  if (arrolamentoSelecionado) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setArrolamentoSelecionado(null); setPaginaAtual(1); }}
            className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista
          </button>
          <div className="flex items-center gap-2">
            <Button onClick={handleBaixarPDFArrolamento} variant="outline" className="h-9 text-sm border-[#111c44] text-[#111c44] hover:bg-[#111c44]/5">
              <Printer className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button onClick={() => setModalLinhasMassa(true)} variant="outline" className="h-9 text-sm border-blue-500 text-blue-600 hover:bg-blue-50">
              Gerar em Massa
            </Button>
            <Button onClick={() => setModalNovaLinha(true)} className="bg-green-600 hover:bg-green-700 text-white h-9 text-sm">
              + Adicionar Linha
            </Button>
          </div>
        </div>

        {/* Documento de Arrolamento - Formato Oficial */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e5e5e5]">
          {/* Cabecalho Oficial */}
          <div className="p-5 border-b border-[#e5e5e5]">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 shrink-0 bg-[#f0f0f0] rounded flex items-center justify-center text-[#999] text-xs font-bold">
                SME
              </div>
              <div className="flex-1 text-[#1a1a1a] text-xs leading-relaxed">
                <p>Estado do Rio de Janeiro</p>
                <p className="font-bold">PREFEITURA MUNICIPAL DE SAQUAREMA</p>
                <p>Secretaria Municipal de Educacao - SME</p>
                <p>Av. Saquarema, n 4299, Porto da Roca - Saquarema - RJ</p>
              </div>
            </div>
          </div>

          {/* Info Escola e Titulo */}
          <div className="px-5 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
            <div className="flex items-center gap-3 mb-2">
              <label className="text-xs font-medium text-[#666]">ESCOLA:</label>
              <Input 
                value={escola || arrolamentoSelecionado.escola || ""} 
                onChange={(e) => setEscola(e.target.value)}
                placeholder="Nome da escola"
                className="h-7 text-sm flex-1 max-w-md"
              />
            </div>
            <p className="font-bold text-sm text-[#1a1a1a]">BENS PATRIMONIAIS - ARROLAMENTO DAS EXISTENCIAS EM 31/12/{ano}</p>
          </div>

          {/* Secretaria, Setor, Folha */}
          <div className="grid grid-cols-[1fr_1fr_100px] border-b border-[#e5e5e5]">
            <div className="p-3 border-r border-[#e5e5e5]">
              <p className="text-xs text-[#666] mb-1">Secretaria:</p>
              <Input 
                value={secretaria} 
                onChange={(e) => setSecretaria(e.target.value)}
                placeholder="SMECICT"
                className="h-7 text-sm"
              />
            </div>
            <div className="p-3 border-r border-[#e5e5e5]">
              <p className="text-xs text-[#666] mb-1">Setor:</p>
              <Input 
                value={setor || arrolamentoSelecionado.setor || ""} 
                onChange={(e) => setSetor(e.target.value)}
                placeholder="Ex: Secretaria, Sala de Aula"
                className="h-7 text-sm"
              />
            </div>
            <div className="p-3 text-center">
              <p className="text-xs text-[#666]">Folha:</p>
              <p className="text-[#1a1a1a] font-bold text-xl">{String(paginaAtual).padStart(2, "0")}</p>
            </div>
          </div>

          {/* Tabela de Itens com Paginacao */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f5f5f5] text-[#333] border-b border-[#e5e5e5]">
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-[#e5e5e5] w-24">Numero Placa</th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-[#e5e5e5] min-w-[200px]">Caracteristica de identificacao</th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-[#e5e5e5] w-28">Marca/Modelo</th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-[#e5e5e5] w-28">N de Serie</th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-[#e5e5e5] w-28">Local</th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-[#e5e5e5] w-28">Observacao</th>
                  <th className="px-3 py-2.5 text-center font-semibold w-20">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {itensPaginados.map((item, idx) => {
                  const realIndex = (paginaAtual - 1) * ITENS_POR_PAGINA + idx;
                  return (
                    <tr key={realIndex} className="border-b border-[#e5e5e5] hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-3 py-2 text-[#1a1a1a] border-r border-[#e5e5e5] font-mono text-xs">{item.placa}</td>
                      <td className="px-3 py-2 text-[#1a1a1a] border-r border-[#e5e5e5]">{item.caracteristicas}</td>
                      <td className="px-3 py-2 text-[#1a1a1a] border-r border-[#e5e5e5]">{item.marcaModelo}</td>
                      <td className="px-3 py-2 text-[#666] border-r border-[#e5e5e5] font-mono text-xs">{item.numSerie}</td>
                      <td className="px-3 py-2 text-[#666] border-r border-[#e5e5e5] text-xs">{item.local || "-"}</td>
                      <td className="px-3 py-2 text-[#666] border-r border-[#e5e5e5] text-xs">{item.observacao || "-"}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setEditandoLinha({ index: realIndex, item: { ...item } })} className="p-1 hover:bg-[#e5e5e5] rounded">
                            <Pencil className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                          <button onClick={() => handleExcluirLinha(realIndex)} className="p-1 hover:bg-[#e5e5e5] rounded">
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Linhas vazias para completar visual */}
                {itensPaginados.length < 15 && Array.from({ length: Math.min(15 - itensPaginados.length, 10) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="border-b border-[#e5e5e5]">
                    <td className="px-3 py-2 border-r border-[#e5e5e5]">&nbsp;</td>
                    <td className="px-3 py-2 border-r border-[#e5e5e5]">&nbsp;</td>
                    <td className="px-3 py-2 border-r border-[#e5e5e5]">&nbsp;</td>
                    <td className="px-3 py-2 border-r border-[#e5e5e5]">&nbsp;</td>
                    <td className="px-3 py-2 border-r border-[#e5e5e5]">&nbsp;</td>
                    <td className="px-3 py-2 border-r border-[#e5e5e5]">&nbsp;</td>
                    <td className="px-3 py-2">&nbsp;</td>
                  </tr>
                ))}
                {arrolamentoSelecionado.itens.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#999]">Nenhum item cadastrado. Clique em "Adicionar Linha" ou "Gerar em Massa" para comecar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginacao e Rodape */}
          <div className="p-4 border-t border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between">
            <p className="text-xs text-[#666]">
              <span className="font-semibold text-[#1a1a1a]">{totalItens}</span> itens cadastrados
              {totalItens > ITENS_POR_PAGINA && (
                <span className="ml-2">| Exibindo {((paginaAtual - 1) * ITENS_POR_PAGINA) + 1} - {Math.min(paginaAtual * ITENS_POR_PAGINA, totalItens)}</span>
              )}
            </p>
            
            {totalPaginas > 1 && (
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPaginaAtual(1)}
                  disabled={paginaAtual === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 text-sm text-[#666]">
                  Pagina <span className="font-semibold text-[#1a1a1a]">{paginaAtual}</span> de {totalPaginas}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPaginaAtual(totalPaginas)}
                  disabled={paginaAtual === totalPaginas}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Adicionar Linha */}
        <Dialog open={modalNovaLinha} onOpenChange={setModalNovaLinha}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Linha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Placa *</label>
                  <Input value={novaPlaca} onChange={(e) => setNovaPlaca(e.target.value)} placeholder="000000" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Marca/Modelo</label>
                  <Input value={novaMarcaModelo} onChange={(e) => setNovaMarcaModelo(e.target.value)} placeholder="Ex: MARELLI" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#1a1a1a]">Caracteristicas de Identificacao</label>
                <Input value={novaCaracteristicas} onChange={(e) => setNovaCaracteristicas(e.target.value)} placeholder="Descricao do item" className="mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">N de Serie</label>
                  <Input value={novoNumSerie} onChange={(e) => setNovoNumSerie(e.target.value)} placeholder="Serie" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Data</label>
                  <Input value={novaData} onChange={(e) => setNovaData(e.target.value)} placeholder={`${dia}/${mes}/${ano}`} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Local</label>
                  <Input value={novoLocal} onChange={(e) => setNovoLocal(e.target.value)} placeholder="Ex: SALA 01" className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setModalNovaLinha(false)}>Cancelar</Button>
                <Button onClick={handleAdicionarLinha} className="bg-green-600 hover:bg-green-700">Adicionar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Linha */}
        <Dialog open={!!editandoLinha} onOpenChange={() => setEditandoLinha(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Linha</DialogTitle>
            </DialogHeader>
            {editandoLinha && (
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1a1a1a]">Placa *</label>
                    <Input value={editandoLinha.item.placa} onChange={(e) => setEditandoLinha({ ...editandoLinha, item: { ...editandoLinha.item, placa: e.target.value } })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1a1a1a]">Marca/Modelo</label>
                    <Input value={editandoLinha.item.marcaModelo} onChange={(e) => setEditandoLinha({ ...editandoLinha, item: { ...editandoLinha.item, marcaModelo: e.target.value } })} className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Caracteristicas</label>
                  <Input value={editandoLinha.item.caracteristicas} onChange={(e) => setEditandoLinha({ ...editandoLinha, item: { ...editandoLinha.item, caracteristicas: e.target.value } })} className="mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1a1a1a]">N de Serie</label>
                    <Input value={editandoLinha.item.numSerie} onChange={(e) => setEditandoLinha({ ...editandoLinha, item: { ...editandoLinha.item, numSerie: e.target.value } })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1a1a1a]">Data</label>
                    <Input value={editandoLinha.item.data} onChange={(e) => setEditandoLinha({ ...editandoLinha, item: { ...editandoLinha.item, data: e.target.value } })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1a1a1a]">Local</label>
                    <Input value={editandoLinha.item.local} onChange={(e) => setEditandoLinha({ ...editandoLinha, item: { ...editandoLinha.item, local: e.target.value } })} className="mt-1" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditandoLinha(null)}>Cancelar</Button>
                  <Button onClick={handleEditarLinha} className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Gerar Linhas em Massa */}
        <Dialog open={modalLinhasMassa} onOpenChange={setModalLinhasMassa}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Linhas em Massa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  Informe a numeracao inicial e final. Ex: 1001 a 2001 cria 1001 linhas automaticamente.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Placa Inicial *</label>
                  <Input 
                    type="number"
                    value={placaInicio} 
                    onChange={(e) => setPlacaInicio(e.target.value)} 
                    placeholder="Ex: 1001" 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Placa Final *</label>
                  <Input 
                    type="number"
                    value={placaFim} 
                    onChange={(e) => setPlacaFim(e.target.value)} 
                    placeholder="Ex: 2001" 
                    className="mt-1" 
                  />
                </div>
              </div>
              {placaInicio && placaFim && parseInt(placaFim) >= parseInt(placaInicio) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700">
                    Serao criadas {parseInt(placaFim) - parseInt(placaInicio) + 1} linhas
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-[#1a1a1a]">Caracteristicas (opcional)</label>
                <Input 
                  value={caracteristicasMassa} 
                  onChange={(e) => setCaracteristicasMassa(e.target.value)} 
                  placeholder="Deixe vazio para usar a descricao do arrolamento" 
                  className="mt-1" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Marca/Modelo</label>
                  <Input 
                    value={marcaModeloMassa} 
                    onChange={(e) => setMarcaModeloMassa(e.target.value)} 
                    placeholder="Ex: MARELLI" 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Local</label>
                  <Input 
                    value={localMassa} 
                    onChange={(e) => setLocalMassa(e.target.value)} 
                    placeholder="Ex: DEPOSITO" 
                    className="mt-1" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setModalLinhasMassa(false)}>Cancelar</Button>
                <Button 
                  onClick={handleAdicionarLinhasMassa} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!placaInicio || !placaFim || parseInt(placaFim) < parseInt(placaInicio)}
                >
                  Gerar Linhas
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
  }

  // Lista de arrolamentos (quando nenhum arrolamento esta selecionado)
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1a1a1a]">Arrolamento de Bens Patrimoniais</h2>
          <p className="text-sm text-[#666]">Selecione um item para visualizar ou editar o arrolamento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <Input
              placeholder="Buscar arrolamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 h-9 text-sm border-[#e5e5e5]"
            />
          </div>
          <Button onClick={() => setModalNovoArrolamento(true)} className="bg-green-600 hover:bg-green-700 text-white h-9 text-sm">
            + Novo Arrolamento
          </Button>
        </div>
      </div>

      {/* Lista de arrolamentos */}
      <div className="bg-[#f8f8f8] rounded-xl overflow-hidden shadow-sm border border-[#e5e5e5]">
        <div className="divide-y divide-[#e5e5e5]">
          {arrolamentosFiltrados.map((arrolamento) => (
            <div
              key={arrolamento.id}
              className="px-4 py-3 flex items-center gap-3 hover:bg-[#f0f0f0] transition-colors"
            >
              <button
                onClick={() => setArrolamentoSelecionado(arrolamento)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-[#999]" />
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-white">
                    {arrolamento.categoria}
                  </span>
                </div>
                <span className="text-[#1a1a1a] font-medium">{arrolamento.descricao}</span>
                <span className="ml-auto text-xs text-[#666]">{arrolamento.itens.length} itens</span>
              </button>
              <button onClick={() => handleExcluirArrolamento(arrolamento.id)} className="p-2 hover:bg-[#e5e5e5] rounded">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
              <ChevronRight className="w-4 h-4 text-[#999]" />
            </div>
          ))}
          {arrolamentosFiltrados.length === 0 && (
            <div className="px-6 py-12 text-center text-[#999]">
              Nenhum arrolamento encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Arrolamento */}
      <Dialog open={modalNovoArrolamento} onOpenChange={setModalNovoArrolamento}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Arrolamento</DialogTitle>
            <DialogDescription>
              Crie um novo arrolamento definindo o intervalo de placas patrimoniais.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#1a1a1a]">Categoria *</label>
                <Input value={novoCategoria} onChange={(e) => setNovoCategoria(e.target.value)} placeholder="Ex: CADEIRA, MESA" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1a1a1a]">Marca/Modelo</label>
                <Input value={novoMarcaModelo} onChange={(e) => setNovoMarcaModelo(e.target.value)} placeholder="Ex: MARELLI" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1a1a1a]">Descricao *</label>
              <Input value={novoDescricao} onChange={(e) => setNovoDescricao(e.target.value)} placeholder="Ex: ADRIX TELA GIRATORIA SECRETARIA" className="mt-1" />
            </div>
            
            <div className="border-t border-[#e5e5e5] pt-4">
              <p className="text-sm font-semibold text-[#111c44] mb-3">Intervalo de Placas Patrimoniais</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-700">
                  Defina o numero inicial e final das placas. Ex: 70034 a 80000 cria automaticamente {novoPlacaInicio && novoPlacaFim && parseInt(novoPlacaFim) >= parseInt(novoPlacaInicio) ? (parseInt(novoPlacaFim) - parseInt(novoPlacaInicio) + 1).toLocaleString() : "N"} linhas no arrolamento.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Numero Inicial *</label>
                  <Input 
                    type="number"
                    value={novoPlacaInicio} 
                    onChange={(e) => setNovoPlacaInicio(e.target.value)} 
                    placeholder="Ex: 70034" 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1a1a1a]">Numero Final *</label>
                  <Input 
                    type="number"
                    value={novoPlacaFim} 
                    onChange={(e) => setNovoPlacaFim(e.target.value)} 
                    placeholder="Ex: 80000" 
                    className="mt-1" 
                  />
                </div>
              </div>
              {novoPlacaInicio && novoPlacaFim && parseInt(novoPlacaFim) >= parseInt(novoPlacaInicio) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p className="text-sm font-medium text-green-700">
                    Serao criadas {(parseInt(novoPlacaFim) - parseInt(novoPlacaInicio) + 1).toLocaleString()} linhas (placas de {novoPlacaInicio.padStart(6, '0')} a {novoPlacaFim.padStart(6, '0')})
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#e5e5e5]">
              <Button variant="outline"               onClick={() => {
                setModalNovoArrolamento(false);
                setNovoCategoria("");
                setNovoDescricao("");
                setNovoPlacaInicio("");
                setNovoPlacaFim("");
                setNovoMarcaModelo("");
              }}>Cancelar</Button>
              <Button 
                onClick={handleAdicionarArrolamento} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!novoCategoria.trim() || !novoDescricao.trim() || !novoPlacaInicio || !novoPlacaFim || parseInt(novoPlacaFim) < parseInt(novoPlacaInicio)}
              >
                Criar Arrolamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de Recibos para visualizar recibos anexados pelo patrimonio
function RecibosView() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("Todos");
  const [reciboSelecionado, setReciboSelecionado] = useState<Recibo | null>(null);

  useEffect(() => {
    setRecibos(getRecibos());
  }, []);

  const tiposMaterial = ["Todos", "Patrimonio", "Almoxarifado", "Uniformes", "Kits", "Transferencia"];

  const recibosFiltrados = recibos.filter(r => {
    const matchSearch = r.numeroRecibo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.numeroSolicitacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.instituicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.solicitante.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFiltro === "Todos" || r.tipoMaterial === tipoFiltro;
    return matchSearch && matchTipo;
  });

  const handleExcluirRecibo = (id: string) => {
    deleteRecibo(id);
    setRecibos(getRecibos());
    setReciboSelecionado(null);
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "Patrimonio": return "bg-purple-100 text-purple-700";
      case "Almoxarifado": return "bg-blue-100 text-blue-700";
      case "Uniformes": return "bg-amber-100 text-amber-700";
      case "Kits": return "bg-green-100 text-green-700";
      case "Transferencia": return "bg-cyan-100 text-cyan-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (reciboSelecionado) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setReciboSelecionado(null)}
          className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista
        </button>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#1a1a1a]">{reciboSelecionado.numeroRecibo}</h2>
              <p className="text-sm text-[#666]">Criado em {reciboSelecionado.dataHora}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoBadgeColor(reciboSelecionado.tipoMaterial)}`}>
              {reciboSelecionado.tipoMaterial}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Solicitacao Vinculada</p>
              <p className="font-medium text-[#1a1a1a]">{reciboSelecionado.numeroSolicitacao}</p>
            </div>
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Instituicao</p>
              <p className="font-medium text-[#1a1a1a]">{reciboSelecionado.instituicao}</p>
            </div>
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Solicitante</p>
              <p className="font-medium text-[#1a1a1a]">{reciboSelecionado.solicitante}</p>
            </div>
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Criado Por</p>
              <p className="font-medium text-[#1a1a1a]">{reciboSelecionado.criadoPor}</p>
            </div>
          </div>

          {reciboSelecionado.observacao && (
            <div className="mb-6">
              <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Observacao</p>
              <p className="text-[#1a1a1a] bg-[#f8f8f8] rounded-lg p-3">{reciboSelecionado.observacao}</p>
            </div>
          )}

          {reciboSelecionado.arquivoRecibo && (
            <div className="mb-6">
              <p className="text-xs text-[#666] uppercase tracking-wide mb-2">Arquivo Anexado</p>
              <div className="flex items-center gap-3 bg-[#f8f8f8] rounded-lg p-4">
                <FileText className="w-10 h-10 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-[#1a1a1a]">{reciboSelecionado.nomeArquivo || "Recibo anexado"}</p>
                  <p className="text-xs text-[#666]">Arquivo PDF/Imagem</p>
                </div>
                <a
                  href={reciboSelecionado.arquivoRecibo}
                  download={reciboSelecionado.nomeArquivo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar
                </a>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-[#e5e5e5]">
            <Button
              variant="outline"
              onClick={() => handleExcluirRecibo(reciboSelecionado.id)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Recibo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1a1a1a]">Recibos de Pedidos Finalizados</h2>
          <p className="text-sm text-[#666]">Recibos anexados ao finalizar pedidos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <Input
              placeholder="Buscar recibo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 h-9 text-sm border-[#e5e5e5]"
            />
          </div>
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="w-44 h-9 text-sm border-[#e5e5e5]">
              <SelectValue placeholder="Tipo de Material" />
            </SelectTrigger>
            <SelectContent>
              {tiposMaterial.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de recibos */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
        {recibosFiltrados.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="w-12 h-12 text-[#ccc] mx-auto mb-3" />
            <p className="text-[#666] font-medium">Nenhum recibo encontrado</p>
            <p className="text-sm text-[#999]">Os recibos sao criados ao finalizar pedidos</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8f8f8] text-[#666]">
                <th className="px-4 py-3 text-left font-medium">N Recibo</th>
                <th className="px-4 py-3 text-left font-medium">Solicitacao</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Instituicao</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-center font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {recibosFiltrados.map((recibo) => (
                <tr key={recibo.id} className="border-t border-[#e5e5e5] hover:bg-[#f8f8f8] transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-[#1a1a1a]">{recibo.numeroRecibo}</td>
                  <td className="px-4 py-3 text-[#666]">{recibo.numeroSolicitacao}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoBadgeColor(recibo.tipoMaterial)}`}>
                      {recibo.tipoMaterial}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#1a1a1a]">{recibo.instituicao}</td>
                  <td className="px-4 py-3 text-[#666]">{recibo.dataHora}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setReciboSelecionado(recibo)}
                      className="p-2 hover:bg-[#e5e5e5] rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Total Recibos</p>
          <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{recibos.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Patrimonio</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{recibos.filter(r => r.tipoMaterial === "Patrimonio").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Almoxarifado</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{recibos.filter(r => r.tipoMaterial === "Almoxarifado").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Uniformes</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{recibos.filter(r => r.tipoMaterial === "Uniformes").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Kits</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{recibos.filter(r => r.tipoMaterial === "Kits").length}</p>
        </div>
      </div>
    </div>
  );
}

const anos = ["Todos os Anos", "2026", "2025", "2024"];
const meses = [
  "Todos os Meses", "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const mesNumero: Record<string, string> = {
  "Janeiro": "01", "Fevereiro": "02", "Marco": "03", "Abril": "04",
  "Maio": "05", "Junho": "06", "Julho": "07", "Agosto": "08",
  "Setembro": "09", "Outubro": "10", "Novembro": "11", "Dezembro": "12"
};

// Grupos para a aba de edicoes
const GRUPOS_EDICAO = [
{ id: "almoxarifado", label: "Almoxarifado", categorias: ["papelaria", "cozinha", "creche"] },
{ id: "patrimonio", label: "Patrimonio", categorias: ["patrimonio"] },
{ id: "uniformes", label: "Uniformes", categorias: ["uniforme", "tamanhosRoupas", "calcado"] },
{ id: "kits", label: "Kits", categorias: ["kitAluno", "mochila", "kitProfessor", "tamanhosPolo"] },
{ id: "instituicoes", label: "Instituicoes", categorias: [] },
];

function EdicoesView() {
  const [grupoAtivo, setGrupoAtivo] = useState("almoxarifado");
  const [categoriaAtiva, setCategoriaAtiva] = useState("papelaria");
  const [busca, setBusca] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [novoItemNome, setNovoItemNome] = useState("");
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [confirmExcluir, setConfirmExcluir] = useState<string | null>(null);
  
  // Estado para instituicoes
  const [instituicoes, setInstituicoes] = useState<InstituicaoItem[]>([]);
  const [novaInstituicaoNome, setNovaInstituicaoNome] = useState("");
  const [editandoInstituicao, setEditandoInstituicao] = useState<{id: string; nome: string} | null>(null);

  // Carrega itens quando categoria muda
  useEffect(() => {
    if (grupoAtivo === "instituicoes") {
      carregarInstituicoes();
    } else {
      carregarItens();
    }
  }, [categoriaAtiva, mostrarInativos, grupoAtivo]);

  const carregarItens = () => {
    const todos = getTodosItens();
    const filtrados = todos.filter(item => item.categoria === categoriaAtiva);
    setItens(filtrados);
  };

  const carregarInstituicoes = () => {
    const todas = getInstituicoes();
    setInstituicoes(todas);
  };

  // Atualiza categoria quando grupo muda
  useEffect(() => {
    const grupo = GRUPOS_EDICAO.find(g => g.id === grupoAtivo);
    if (grupo && grupo.categorias.length > 0) {
      setCategoriaAtiva(grupo.categorias[0]);
    }
  }, [grupoAtivo]);

  const grupoAtual = GRUPOS_EDICAO.find(g => g.id === grupoAtivo);
  const categoriasDoGrupo = grupoAtual?.categorias.map(catId => 
    CATEGORIAS.find(c => c.id === catId)
  ).filter(Boolean) || [];

  const itensFiltrados = itens.filter(item => {
    const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase());
    const matchAtivo = mostrarInativos ? true : item.ativo;
    return matchBusca && matchAtivo;
  });

  const instituicoesFiltradas = instituicoes.filter(inst => {
    const matchBusca = inst.nome.toLowerCase().includes(busca.toLowerCase());
    const matchAtivo = mostrarInativos ? true : inst.ativo;
    return matchBusca && matchAtivo;
  });

  const handleAdicionarItem = () => {
    if (!novoItemNome.trim()) return;
    addItem(novoItemNome.trim(), categoriaAtiva, 100, 10, "");
    setNovoItemNome("");
    carregarItens();
  };

  const handleDesativar = (id: string) => {
    removeItem(id);
    carregarItens();
  };

  const handleReativar = (id: string) => {
    reativarItem(id);
    carregarItens();
  };

  const handleExcluir = (id: string) => {
    excluirItem(id);
    setConfirmExcluir(null);
    carregarItens();
  };

  // Funcoes para instituicoes
  const handleAdicionarInstituicao = () => {
    if (!novaInstituicaoNome.trim()) return;
    addInstituicao(novaInstituicaoNome.trim());
    setNovaInstituicaoNome("");
    carregarInstituicoes();
  };

  const handleDesativarInstituicao = (id: string) => {
    desativarInstituicao(id);
    carregarInstituicoes();
  };

  const handleReativarInstituicao = (id: string) => {
    reativarInstituicao(id);
    carregarInstituicoes();
  };

  const handleExcluirInstituicao = (id: string) => {
    excluirInstituicao(id);
    setConfirmExcluir(null);
    carregarInstituicoes();
  };

  const handleSalvarEdicaoInstituicao = () => {
    if (!editandoInstituicao || !editandoInstituicao.nome.trim()) return;
    updateInstituicao(editandoInstituicao.id, { nome: editandoInstituicao.nome.toUpperCase() });
    setEditandoInstituicao(null);
    carregarInstituicoes();
  };

  // Renderiza view de instituicoes
  if (grupoAtivo === "instituicoes") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">Edicoes de Formularios</h2>
            <p className="text-xs text-[#8c8c8c]">Adicione, edite, desative ou exclua instituicoes</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-[#666]">
            <input 
              type="checkbox" 
              checked={mostrarInativos} 
              onChange={(e) => setMostrarInativos(e.target.checked)} 
              className="rounded border-[#ccc]" 
            />
            Mostrar inativos
          </label>
        </div>

        {/* Tabs de grupos */}
        <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-lg p-1 overflow-x-auto">
          {GRUPOS_EDICAO.map(grupo => (
            <button 
              key={grupo.id}
              onClick={() => setGrupoAtivo(grupo.id)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${grupoAtivo === grupo.id ? "bg-white text-[#111c44] shadow-sm" : "text-[#666] hover:bg-white/50"}`}
            >
              {grupo.id === "almoxarifado" && <Package className="w-4 h-4" />}
              {grupo.id === "patrimonio" && <Armchair className="w-4 h-4" />}
              {grupo.id === "uniformes" && <Shirt className="w-4 h-4" />}
              {grupo.id === "kits" && <BoxIcon className="w-4 h-4" />}
              {grupo.id === "instituicoes" && <Building2 className="w-4 h-4" />}
              {grupo.label}
            </button>
          ))}
        </div>

        {/* Busca e adicionar instituicao */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="text"
              placeholder="Buscar instituicao..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111c44]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nome da nova instituicao..."
              value={novaInstituicaoNome}
              onChange={(e) => setNovaInstituicaoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdicionarInstituicao()}
              className="px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111c44]/20 min-w-[250px]"
            />
            <Button onClick={handleAdicionarInstituicao} className="bg-green-600 hover:bg-green-700 text-white gap-1">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </div>

        {/* Lista de instituicoes */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-[#f9fafb] border-b border-[#e5e5e5] flex items-center justify-between">
            <span className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Instituicoes
            </span>
            <span className="text-xs text-[#666]">
              {instituicoesFiltradas.length} {instituicoesFiltradas.length === 1 ? "instituicao" : "instituicoes"}
            </span>
          </div>

          {instituicoesFiltradas.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#999]">
              Nenhuma instituicao encontrada
            </div>
          ) : (
            <div className="divide-y divide-[#e5e5e5] max-h-[500px] overflow-y-auto">
              {instituicoesFiltradas.map(inst => (
                <div key={inst.id} className={`px-4 py-3 flex items-center justify-between gap-4 ${!inst.ativo ? "bg-[#fafafa]" : ""}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {editandoInstituicao?.id === inst.id ? (
                      <input
                        type="text"
                        value={editandoInstituicao.nome}
                        onChange={(e) => setEditandoInstituicao({ ...editandoInstituicao, nome: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSalvarEdicaoInstituicao();
                          if (e.key === "Escape") setEditandoInstituicao(null);
                        }}
                        className="flex-1 px-3 py-1 border border-[#111c44] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#111c44]/20"
                        autoFocus
                      />
                    ) : (
                      <span className={`text-sm ${!inst.ativo ? "text-[#999] line-through" : "text-[#1a1a1a]"}`}>
                        {inst.nome}
                      </span>
                    )}
                    {!inst.ativo && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editandoInstituicao?.id === inst.id ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleSalvarEdicaoInstituicao}
                          className="text-green-600 border-green-200 hover:bg-green-50 text-xs"
                        >
                          Salvar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditandoInstituicao(null)}
                          className="text-[#666] border-[#ccc] hover:bg-[#f5f5f5] text-xs"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditandoInstituicao({ id: inst.id, nome: inst.nome })}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        {inst.ativo ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDesativarInstituicao(inst.id)}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs"
                          >
                            Desativar
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReativarInstituicao(inst.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50 text-xs"
                          >
                            Reativar
                          </Button>
                        )}
                        {confirmExcluir === inst.id ? (
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleExcluirInstituicao(inst.id)}
                              className="text-xs"
                            >
                              Confirmar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setConfirmExcluir(null)}
                              className="text-xs"
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setConfirmExcluir(inst.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
          <p className="text-xs text-sky-800">
            <strong>Nota:</strong> Ao desativar uma instituicao, ela permanece visivel aqui na area administrativa mas nao aparece mais nos formularios. 
            Ao excluir, a instituicao e removida permanentemente do sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1a1a1a]">Edicoes de Formularios</h2>
          <p className="text-xs text-[#8c8c8c]">Adicione, desative ou exclua itens dos formularios de solicitacao</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-[#666]">
          <input 
            type="checkbox" 
            checked={mostrarInativos} 
            onChange={(e) => setMostrarInativos(e.target.checked)} 
            className="rounded border-[#ccc]" 
          />
          Mostrar inativos
        </label>
      </div>

      {/* Tabs de grupos */}
      <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-lg p-1 overflow-x-auto">
        {GRUPOS_EDICAO.map(grupo => (
          <button 
            key={grupo.id}
            onClick={() => setGrupoAtivo(grupo.id)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${grupoAtivo === grupo.id ? "bg-white text-[#111c44] shadow-sm" : "text-[#666] hover:bg-white/50"}`}
          >
            {grupo.id === "almoxarifado" && <Package className="w-4 h-4" />}
            {grupo.id === "patrimonio" && <Armchair className="w-4 h-4" />}
            {grupo.id === "uniformes" && <Shirt className="w-4 h-4" />}
            {grupo.id === "kits" && <BoxIcon className="w-4 h-4" />}
            {grupo.id === "instituicoes" && <Building2 className="w-4 h-4" />}
            {grupo.label}
          </button>
        ))}
      </div>

      {/* Sub-categorias do grupo */}
      {categoriasDoGrupo.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#666]">Categoria:</span>
          {categoriasDoGrupo.map(cat => cat && (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoriaAtiva === cat.id ? "bg-[#111c44] text-white" : "bg-[#f0f0f0] text-[#666] hover:bg-[#e5e5e5]"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Busca e adicionar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input
            type="text"
            placeholder="Buscar item..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111c44]/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nome do novo item..."
            value={novoItemNome}
            onChange={(e) => setNovoItemNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdicionarItem()}
            className="px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111c44]/20 min-w-[200px]"
          />
          <Button onClick={handleAdicionarItem} className="bg-green-600 hover:bg-green-700 text-white gap-1">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
      </div>

      {/* Lista de itens */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-[#f9fafb] border-b border-[#e5e5e5] flex items-center justify-between">
          <span className="text-sm font-medium text-[#1a1a1a]">
            {CATEGORIAS.find(c => c.id === categoriaAtiva)?.label || categoriaAtiva}
          </span>
          <span className="text-xs text-[#666]">
            {itensFiltrados.length} {itensFiltrados.length === 1 ? "item" : "itens"}
          </span>
        </div>

        {itensFiltrados.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#999]">
            Nenhum item encontrado
          </div>
        ) : (
          <div className="divide-y divide-[#e5e5e5]">
            {itensFiltrados.map(item => (
              <div key={item.id} className={`px-4 py-3 flex items-center justify-between gap-4 ${!item.ativo ? "bg-[#fafafa]" : ""}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-sm ${!item.ativo ? "text-[#999] line-through" : "text-[#1a1a1a]"}`}>
                    {item.nome}
                  </span>
                  {!item.ativo && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                      Inativo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.ativo ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDesativar(item.id)}
                      className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs"
                    >
                      Desativar
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReativar(item.id)}
                      className="text-green-600 border-green-200 hover:bg-green-50 text-xs"
                    >
                      Reativar
                    </Button>
                  )}
                  {confirmExcluir === item.id ? (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleExcluir(item.id)}
                        className="text-xs"
                      >
                        Confirmar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setConfirmExcluir(null)}
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setConfirmExcluir(item.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
        <p className="text-xs text-sky-800">
          <strong>Nota:</strong> Ao desativar um item, ele permanece visivel aqui na area administrativa mas nao aparece mais nos formularios. 
          Ao excluir, o item e removido permanentemente do sistema.
        </p>
      </div>
    </div>
  );
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "almoxarifado", label: "Almoxarifado", icon: Package },
  { id: "uniformes", label: "Uniformes", icon: Shirt },
  { id: "kits", label: "Kits", icon: Package },
  { id: "patrimonio", label: "Patrimonio", icon: Armchair },
  { id: "transferencias", label: "Transferencias", icon: ArrowRightLeft },
  { id: "inventario", label: "Inventario", icon: ClipboardList },
  { id: "relatorio", label: "Relatorio", icon: FileText },
  { id: "arrolamento", label: "Arrolamento", icon: ClipboardList },
  { id: "edicoes", label: "Edicoes", icon: Pencil },
];

export default function AdminPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [instituicoes, setInstituicoes] = useState<string[]>(["Todas Instituicoes"]);
  const [instituicaoFiltro, setInstituicaoFiltro] = useState("Todas Instituicoes");
  const [anoFiltro, setAnoFiltro] = useState("Todos os Anos");
  const [tipoFiltro, setTipoFiltro] = useState("Todos os Tipos");
  const [statusFiltro, setStatusFiltro] = useState("Todos os Status");
  const [mesFiltro, setMesFiltro] = useState("Todos os Meses");
  const [responsavelFiltro, setResponsavelFiltro] = useState("Todos");
  const [relatorioAbaAtiva, setRelatorioAbaAtiva] = useState<"materiais" | "transferencias" | "inventarios">("materiais");

  const MEMBROS_EQUIPE = ["Junior", "Amanda", "Gabriel", "Julio"];
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSidebar, setActiveSidebar] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Chat state
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [conversas, setConversas] = useState<ReturnType<typeof getConversasUnicas>>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<string | null>(null);
  const [mensagensConversa, setMensagensConversa] = useState<ChatMessage[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  // Gestao de Usuarios state
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [setores, setSetoresState] = useState<Setor[]>([]);
  const [usuariosAbaAtiva, setUsuariosAbaAtiva] = useState<"usuarios" | "setores" | "aprovacoes">("usuarios");
  const [showNovoUsuario, setShowNovoUsuario] = useState(false);
  const [showNovoSetor, setShowNovoSetor] = useState(false);
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "", login: "", senha: "", matricula: "", email: "", cargo: "", setor: "", nivel: "usuario" as Usuario["nivel"],
  });
  const [novoSetor, setNovoSetor] = useState({ nome: "", tipo: "escola" as Setor["tipo"] });
  const [permissoesUsuario, setPermissoesUsuario] = useState<Permissao[]>([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);

  // Exportacao de itens
  const [exportCategoriaFiltro, setExportCategoriaFiltro] = useState("Todas");

  // Estado mounted para evitar hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Estado para itens do catalogo - atualizado quando aba "itens" e selecionada
  const [itensCatalogoCache, setItensCatalogoCache] = useState<Record<string, ReturnType<typeof getItensAtivos>>>({});
  useEffect(() => {
    if (activeSidebar === "itens" && mounted) {
      const novoCache: Record<string, ReturnType<typeof getItensAtivos>> = {};
      CATEGORIAS.forEach(cat => {
        novoCache[cat.id] = getItensAtivos(cat.id);
      });
      setItensCatalogoCache(novoCache);
    }
  }, [activeSidebar, mounted]);

  // Notificacoes de estoque baixo
  const [notificacoesLidas, setNotificacoesLidas] = useState<Set<string>>(new Set());
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const todosItens = mounted ? CATEGORIAS.flatMap(cat => getItensAtivos(cat.id)) : [];
  const itensEstoqueBaixoPatrimonio = todosItens.filter(i => i.estoque < 20);

  // Inventario state
  const [inventarios, setInventarios] = useState<SolicitacaoInventario[]>([]);
  const [inventarioSelecionado, setInventarioSelecionado] = useState<SolicitacaoInventario | null>(null);
  const [inventarioDialogOpen, setInventarioDialogOpen] = useState(false);
  // Inventarios por setor
  const [inventariosSetor, setInventariosSetor] = useState<SolicitacaoInventarioSetor[]>([]);
  const [inventarioSetorSelecionado, setInventarioSetorSelecionado] = useState<SolicitacaoInventarioSetor | null>(null);
  const [inventarioSetorDialogOpen, setInventarioSetorDialogOpen] = useState(false);
  const [modalInventarioSetor, setModalInventarioSetor] = useState(false);
  const [invSetorSecretaria, setInvSetorSecretaria] = useState("");
  const [invSetorOrgao, setInvSetorOrgao] = useState("");
  const [invSetorDenominacao, setInvSetorDenominacao] = useState("");
  const [invSetorEndereco, setInvSetorEndereco] = useState("");
  const [invSetorRespNome, setInvSetorRespNome] = useState("");
  const [invSetorRespCPF, setInvSetorRespCPF] = useState("");
  const [invSetorRespMatricula, setInvSetorRespMatricula] = useState("");
  const [invSetorAgenteNome, setInvSetorAgenteNome] = useState("");
  const [invSetorAgenteCPF, setInvSetorAgenteCPF] = useState("");
  const [invSetorAgenteMatricula, setInvSetorAgenteMatricula] = useState("");
  const [invSetorItens, setInvSetorItens] = useState<{ codigo: string; descricao: string }[]>([]);
  const [invSetorNovoItem, setInvSetorNovoItem] = useState({ codigo: "", descricao: "" });

  // Contadores de pendentes para badges no sidebar
  const pendentesAlmoxarifado = solicitacoes.filter(s => s.tipo === "almoxarifado" && (s.status || "Pendente") === "Pendente").length;
  const pendentesUniformes = solicitacoes.filter(s => s.tipo === "uniformes" && (s.status || "Pendente") === "Pendente").length;
  const pendentesKits = solicitacoes.filter(s => s.tipo === "kits" && (s.status || "Pendente") === "Pendente").length;
  const pendentesPatrimonio = solicitacoes.filter(s => s.tipo === "patrimonio" && (s.status || "Pendente") === "Pendente").length;
  const pendentesTransferencias = solicitacoes.filter(s => s.tipo === "transferencia" && (s.status || "Pendente") === "Pendente").length;
  const pendentesInventario =
    inventarios.filter(i => i.status === "Pendente").length +
    inventariosSetor.filter(i => i.status === "Pendente").length;

  const badgesPorSecao: Record<string, number> = {
    almoxarifado: pendentesAlmoxarifado,
    uniformes: pendentesUniformes,
    kits: pendentesKits,
    patrimonio: pendentesPatrimonio,
    transferencias: pendentesTransferencias,
    inventario: pendentesInventario,
  };

  const carregarDados = () => {
    const todasSolicitacoes = getSolicitacoes();
    setSolicitacoes(todasSolicitacoes);
    const instituicoesUnicas = [
      "Todas Instituicoes",
      ...new Set(todasSolicitacoes.map((s) => s.instituicao)),
    ];
    setInstituicoes(instituicoesUnicas);
    setConversas(getConversasUnicas());
    setUsuarios(getUsuarios());
    setSetoresState(getSetores());
    setInventarios(getInventarios());
    setInventariosSetor(getInventariosSetor());
  };

  useEffect(() => {
    carregarDados();
    // Atualiza os dados a cada 30 segundos para manter badges em tempo real (reduzido para melhor performance)
    const intervalo = setInterval(carregarDados, 30000);
    return () => clearInterval(intervalo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (conversaSelecionada) {
      const msgs = getChatPorInstituicao(conversaSelecionada);
      setMensagensConversa(msgs);
      marcarMensagensComoLidas(conversaSelecionada);
      setConversas(getConversasUnicas());
    }
  }, [conversaSelecionada]);

  const solicitacoesFiltradas = solicitacoes.filter((s) => {
    const matchInstituicao = instituicaoFiltro === "Todas Instituicoes" || s.instituicao === instituicaoFiltro;
    const matchAno = anoFiltro === "Todos os Anos" || s.dataHora.includes(anoFiltro);
    const matchTipo = tipoFiltro === "Todos os Tipos" || s.tipo === tipoFiltro;
    const matchStatus = statusFiltro === "Todos os Status" || (s.status || "Pendente") === statusFiltro;
    const matchSearch = searchTerm === "" || s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || s.instituicao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchResponsavel = responsavelFiltro === "Todos" || (s.responsavel || "") === responsavelFiltro;

    // Filter by sidebar section
    let matchSidebar = true;
    if (activeSidebar === "almoxarifado") matchSidebar = s.tipo === "almoxarifado";
    else if (activeSidebar === "uniformes") matchSidebar = s.tipo === "uniformes";
    else if (activeSidebar === "kits") matchSidebar = s.tipo === "kits";
    else if (activeSidebar === "patrimonio") matchSidebar = s.tipo === "patrimonio";
    else if (activeSidebar === "transferencias") matchSidebar = s.tipo === "transferencia";

    return matchInstituicao && matchAno && matchTipo && matchStatus && matchSearch && matchResponsavel && matchSidebar;
  });

  const handleVerDetalhes = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setDialogOpen(true);
  };

  const handleBaixarPDF = async (solicitacao: Solicitacao) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 15;
    const cw = pw - m * 2;
    let y = 0;

    // --- Logo Header ---
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => reject();
        logoImg.src = "/images/logo-prefeitura-saquarema.png";
      });
      
      const logoWidth = 100;
      const logoHeight = 25;
      const logoX = (pw - logoWidth) / 2;
      doc.addImage(logoImg, "PNG", logoX, 8, logoWidth, logoHeight);
      y = 40;
    } catch {
      y = 8;
    }

    doc.setFillColor(17, 28, 68);
    doc.rect(0, y, pw, 28, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("SOLICITACAO - " + solicitacao.tipo.toUpperCase(), pw / 2, y + 17, { align: "center" });
    y = y + 38;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 28, 68);
    doc.text("DADOS DO SOLICITANTE", m, y);
    y += 2;
    doc.setDrawColor(17, 28, 68);
    doc.line(m, y, m + cw, y);
    y += 7;

    const campos = [
      { l: "Data/Hora:", v: solicitacao.dataHora },
      { l: "Nome:", v: solicitacao.nome },
      { l: "Matricula:", v: solicitacao.matricula },
      { l: "Instituicao:", v: solicitacao.instituicao },
      { l: "Status:", v: solicitacao.status || "Pendente" },
    ];
    doc.setFontSize(9);
    campos.forEach((c) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text(c.l, m, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 26);
      doc.text(c.v, m + 30, y);
      y += 5.5;
    });
    y += 5;

    const addSecao = (titulo: string, linhas: { desc: string; qtd: number }[]) => {
      if (linhas.length === 0) return;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 28, 68);
      doc.text(titulo, m, y);
      y += 2;
      doc.setDrawColor(17, 28, 68);
      doc.line(m, y, m + cw, y);
      y += 6;

      doc.setFillColor(243, 244, 246);
      doc.rect(m, y - 3, cw, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text("#", m + 2, y + 1);
      doc.text("Descricao", m + 12, y + 1);
      doc.text("Qtd", m + cw - 10, y + 1, { align: "center" });
      y += 8;

      linhas.forEach((item, i) => {
        if (y > 275) { doc.addPage(); y = 20; }
        if (i % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(m, y - 3.5, cw, 6, "F");
        }
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
        doc.text(String(i + 1), m + 2, y);
        const lines = doc.splitTextToSize(item.desc, cw - 30);
        doc.text(lines[0], m + 12, y);
        doc.setFont("helvetica", "bold");
        doc.text(String(item.qtd), m + cw - 10, y, { align: "center" });
        y += 6;
      });
      y += 4;
    };

    if (solicitacao.uniformesDetalhes?.length) addSecao("UNIFORMES", solicitacao.uniformesDetalhes.map((u) => ({ desc: `${u.tipo} | ${u.genero} | Tam: ${u.tamanho}`, qtd: u.quantidade })));
    if (solicitacao.calcadosDetalhes?.length) addSecao("CALCADOS", solicitacao.calcadosDetalhes.map((c) => ({ desc: `Tamanho: ${c.tamanho}`, qtd: c.quantidade })));
    if (solicitacao.kitsAlunoDetalhes?.length) addSecao("KITS ALUNO", solicitacao.kitsAlunoDetalhes.map((k) => ({ desc: k.tipo, qtd: k.quantidade })));
    if (solicitacao.polosProfDetalhes?.length) addSecao("KIT PROFESSOR - POLO", solicitacao.polosProfDetalhes.map((p) => ({ desc: `${p.tipo} | Tam: ${p.tamanho}`, qtd: p.quantidade })));
    if (solicitacao.mochilasDetalhes?.length) addSecao("MOCHILAS", solicitacao.mochilasDetalhes.map((mo) => ({ desc: mo.tipo, qtd: mo.quantidade })));
    if (solicitacao.papelaria?.length) addSecao("PAPELARIA", solicitacao.papelaria.map((p) => ({ desc: p.tipo, qtd: p.quantidade })));
    if (solicitacao.cozinha?.length) addSecao("COZINHA", solicitacao.cozinha.map((c) => ({ desc: c.tipo, qtd: c.quantidade })));
    if (solicitacao.itens?.length && solicitacao.tipo === "patrimonio") {
      // Expandir itens individuais com lacres
      const itensExpandidos: { desc: string; qtd: number }[] = [];
      solicitacao.itens.forEach((i) => {
        if (i.lacresIndividuais && i.lacresIndividuais.length > 0) {
          // Cada item individual com seu lacre
          i.lacresIndividuais.forEach((lacre, idx) => {
            itensExpandidos.push({
              desc: lacre ? `N. ${lacre} - ${i.tipo}` : `${i.tipo} (sem lacre)`,
              qtd: 1
            });
          });
        } else if (i.numeroLacre) {
          // Fallback para formato antigo com lacre unico
          itensExpandidos.push({
            desc: `N. ${i.numeroLacre} - ${i.tipo}`,
            qtd: i.quantidade
          });
        } else {
          // Sem lacre
          itensExpandidos.push({
            desc: i.tipo,
            qtd: i.quantidade
          });
        }
      });
      addSecao("PATRIMONIO", itensExpandidos);
    } else if (solicitacao.itens?.length) {
      addSecao("ITENS", solicitacao.itens.map((i) => ({ desc: i.tipo, qtd: i.quantidade })));
    }

    // Bloco de recebimento
    const blocoY = 255;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(m, blocoY, cw, 28, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(17, 28, 68);
    doc.text("RECEBIMENTO", m + 4, blocoY + 6);

    // Linha: Assinatura e Carimbo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("Assinatura e Carimbo:", m + 4, blocoY + 13);
    doc.setDrawColor(180, 180, 180);
    doc.line(m + 40, blocoY + 13, m + cw - 4, blocoY + 13);

    // Linha: Nome
    doc.text("Nome:", m + 4, blocoY + 20);
    doc.line(m + 16, blocoY + 20, m + (cw / 2) - 4, blocoY + 20);

    // Linha: Data de Recebimento
    doc.text("Data de Recebimento:", m + (cw / 2) + 2, blocoY + 20);
    doc.text("____/____/________", m + (cw / 2) + 40, blocoY + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text("Prefeitura Municipal de Saquarema - Sistema de Solicitacoes", pw / 2, 287, { align: "center" });

    doc.save(`solicitacao_${solicitacao.id}_${solicitacao.tipo}.pdf`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 10;
    let y = 0;

    doc.setFillColor(17, 28, 68);
    doc.rect(0, 0, pw, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("RELATORIO DE SOLICITACOES", pw / 2, 13, { align: "center" });
    y = 28;

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Total: ${solicitacoesFiltradas.length} solicitacoes | Gerado em: ${new Date().toLocaleString("pt-BR")}`, m, y);
    y += 7;

    const cols = [m, m + 50, m + 75, m + 130, m + 170, m + 210, m + 240];
    doc.setFillColor(243, 244, 246);
    doc.rect(m, y - 3, pw - m * 2, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    ["Nome", "Matricula", "Instituicao", "Tipo", "Data/Hora", "Status", "Itens"].forEach((h, i) => {
      doc.text(h, cols[i], y + 1);
    });
    y += 8;

    doc.setFontSize(7);
    solicitacoesFiltradas.forEach((s, idx) => {
      if (y > 190) { doc.addPage(); y = 15; }
      if (idx % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(m, y - 3, pw - m * 2, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      const totalItens = (s.uniformes || 0) + (s.calcados || 0) + (s.kitsAluno || 0) + (s.polosProf || 0) + (s.mochilas || 0) + (s.itens?.length || 0);
      const vals = [s.nome, s.matricula, s.instituicao, s.tipo, s.dataHora, s.status || "Pendente", String(totalItens)];
      vals.forEach((v, i) => {
        const maxW = i < cols.length - 1 ? cols[i + 1] - cols[i] - 2 : 30;
        const lines = doc.splitTextToSize(v, maxW);
        doc.text(lines[0], cols[i], y);
      });
      y += 6;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(156, 163, 175);
    doc.text("Prefeitura Municipal de Saquarema", pw / 2, doc.internal.pageSize.getHeight() - 5, { align: "center" });

    doc.save("solicitacoes.pdf");
  };

  const handleDeleteSolicitacao = (id: string) => {
    setSolicitacoes((prev) => prev.filter((s) => s.id !== id));
    if (typeof window !== "undefined") {
      const updated = solicitacoes.filter((s) => s.id !== id);
      localStorage.setItem("inove_saqua_solicitacoes", JSON.stringify(updated));
    }
  };

  const handleChangeResponsavel = (id: string, novoResponsavel: string) => {
  setSolicitacoes((prev) =>
    prev.map((s) => (s.id === id ? { ...s, responsavel: novoResponsavel } : s))
  );
  if (typeof window !== "undefined") {
    const updated = solicitacoes.map((s) => (s.id === id ? { ...s, responsavel: novoResponsavel } : s));
    localStorage.setItem("inove_saqua_solicitacoes", JSON.stringify(updated));
  }
  };

  const handleChangeStatus = (id: string, newStatus: string) => {
  setSolicitacoes((prev) =>
  prev.map((s) => (s.id === id ? { ...s, status: newStatus as Solicitacao["status"] } : s))
  );
  if (typeof window !== "undefined") {
  const updated = solicitacoes.map((s) => (s.id === id ? { ...s, status: newStatus } : s));
      localStorage.setItem("inove_saqua_solicitacoes", JSON.stringify(updated));
    }
  };



  const clearFilters = () => {
  setTipoFiltro("Todos os Tipos");
  setInstituicaoFiltro("Todas Instituicoes");
  setAnoFiltro("Todos os Anos");
  setStatusFiltro("Todos os Status");
  setMesFiltro("Todos os Meses");
  setResponsavelFiltro("Todos");
  setSearchTerm("");
  };

  // Exportar itens para PDF
  const handleExportItensPDF = () => {
    const itensParaExportar = exportCategoriaFiltro === "Todas"
      ? CATEGORIAS.flatMap(cat => getItensAtivos(cat.id))
      : getItensAtivos(exportCategoriaFiltro as CategoriaId);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 15;
    let y = 0;

    doc.setFillColor(17, 28, 68);
    doc.rect(0, 0, pw, 28, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    const titulo = exportCategoriaFiltro === "Todas"
      ? "RELATORIO DE ITENS - TODOS OS ITENS"
      : `RELATORIO DE ITENS - ${CATEGORIAS.find(c => c.id === exportCategoriaFiltro)?.label.toUpperCase() || exportCategoriaFiltro}`;
    doc.text(titulo, pw / 2, 17, { align: "center" });
    y = 38;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, m, y);
    doc.text(`Total de itens: ${itensParaExportar.length}`, pw - m, y, { align: "right" });
    y += 10;

    // Header da tabela
    doc.setFillColor(243, 244, 246);
    doc.rect(m, y - 4, pw - m * 2, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("#", m + 2, y);
    doc.text("ITEM", m + 12, y);
    doc.text("CATEGORIA", m + 90, y);
    doc.text("ESTOQUE", m + 130, y);
    doc.text("MIN", m + 155, y);
    y += 8;

    itensParaExportar.forEach((item, i) => {
      if (y > 275) { doc.addPage(); y = 20; }
      if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(m, y - 3.5, pw - m * 2, 6, "F"); }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(55, 65, 81);
      doc.text(String(i + 1), m + 2, y);
      const nomeLines = doc.splitTextToSize(item.nome, 70);
      doc.text(nomeLines[0], m + 12, y);
      const catLabel = CATEGORIAS.find(c => c.id === item.categoria)?.label || item.categoria;
      doc.text(catLabel, m + 90, y);
      doc.setFont("helvetica", "bold");
      if (item.estoque <= item.estoqueMinimo) doc.setTextColor(217, 119, 6);
      else doc.setTextColor(55, 65, 81);
      doc.text(String(item.estoque), m + 130, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(156, 163, 175);
      doc.text(String(item.estoqueMinimo), m + 155, y);
      y += 6;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text("Prefeitura Municipal de Saquarema - Sistema de Solicitacoes", pw / 2, 287, { align: "center" });

    doc.save(`relatorio_itens_${exportCategoriaFiltro === "Todas" ? "geral" : exportCategoriaFiltro}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Exportar itens para Excel/CSV
  const handleExportItensExcel = () => {
    const itensParaExportar = exportCategoriaFiltro === "Todas"
      ? CATEGORIAS.flatMap(cat => getItensAtivos(cat.id))
      : getItensAtivos(exportCategoriaFiltro as CategoriaId);

    const headers = ["#", "Item", "Categoria", "Estoque", "Estoque Minimo", "Localizacao", "Status"];
    const rows = itensParaExportar.map((item, i) => [
      i + 1,
      item.nome,
      CATEGORIAS.find(c => c.id === item.categoria)?.label || item.categoria,
      item.estoque,
      item.estoqueMinimo,
      item.localizacao || "-",
      item.estoque > item.estoqueMinimo ? "Disponivel" : "Estoque Baixo"
    ]);

    let csv = headers.join(";") + "\n";
    rows.forEach(row => { csv += row.join(";") + "\n"; });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_itens_${exportCategoriaFiltro === "Todas" ? "geral" : exportCategoriaFiltro}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const enviarResposta = () => {
    if (novaMensagem.trim() && conversaSelecionada) {
      const msg = addChatMessage({
        remetente: "patrimonio",
        nomeRemetente: "Equipe Patrimonio",
        instituicao: conversaSelecionada,
        mensagem: novaMensagem.trim(),
        conversaId: conversaSelecionada.toLowerCase().replace(/\s+/g, "-"),
      });
      setMensagensConversa([...mensagensConversa, msg]);
      setNovaMensagem("");
      setConversas(getConversasUnicas());
    }
  };

  const totalNaoLidas = conversas.reduce((acc, c) => acc + c.naoLidas, 0);

  const getTypeBadge = (tipo: string) => {
    switch (tipo) {
      case "kits-uniformes": return { label: "Uniformes e Kits", bg: "bg-emerald-100 text-emerald-700" };
      case "uniformes": return { label: "Uniformes", bg: "bg-amber-100 text-amber-700" };
      case "kits": return { label: "Kits", bg: "bg-green-100 text-green-700" };
      case "almoxarifado": return { label: "Almoxarifado", bg: "bg-blue-100 text-blue-700" };
      case "patrimonio": return { label: "Patrimonio", bg: "bg-rose-100 text-rose-700" };
      case "transferencia": return { label: "Transferencia", bg: "bg-sky-100 text-sky-700" };
      default: return { label: tipo, bg: "bg-gray-100 text-gray-700" };
    }
  };

  const getTotalItens = (s: Solicitacao) => {
    return (s.uniformes || 0) + (s.calcados || 0) + (s.kitsAluno || 0) + (s.polosProf || 0) + (s.mochilas || 0) + (s.itens?.length || 0) + (s.papelaria?.length || 0) + (s.cozinha?.length || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente": return { dot: "bg-amber-400", text: "text-amber-600" };
      case "Processamento": return { dot: "bg-blue-400", text: "text-blue-600" };
      case "Finalizado": return { dot: "bg-green-500", text: "text-green-600" };
      default: return { dot: "bg-gray-400", text: "text-gray-600" };
    }
  };

  const getSidebarTitle = () => {
    const item = sidebarItems.find(i => i.id === activeSidebar);
    return item?.label || "Dashboard";
  };

const getSidebarDescription = () => {
    if (activeSidebar === "relatorio") return "Relatorio completo de envios mensais e anuais por escola";
    if (activeSidebar === "arrolamento") return "Arrolamento de bens patrimoniais - existencias por secretaria e setor";
    if (activeSidebar === "usuarios") return "Gerenciamento de usuarios, setores e permissoes do sistema";
    if (activeSidebar === "kits") return "Solicitacoes de kits enviadas pelas escolas";
    return "Visualize todas as solicitacoes recebidas";
  };

  // Funcoes de gestao de usuarios
  const handleAddUsuario = () => {
    if (!novoUsuario.nome || !novoUsuario.login || !novoUsuario.senha) {
      alert("Preencha todos os campos obrigatorios");
      return;
    }
    const usuarioExistente = usuarios.find(u => u.login.toLowerCase() === novoUsuario.login.toLowerCase());
    if (usuarioExistente) {
      alert("Ja existe um usuario com este login");
      return;
    }
    const usuario = addUsuario({
      ...novoUsuario,
      permissoes: permissoesUsuario,
      ativo: true,
      statusAprovacao: novoUsuario.nivel === "gestor" ? "aprovado" : "pendente",
    });
    setUsuarios(getUsuarios());
    setNovoUsuario({ nome: "", login: "", senha: "", matricula: "", email: "", cargo: "", setor: "", nivel: "usuario" });
    setPermissoesUsuario([]);
    setShowNovoUsuario(false);
  };

  const handleAddSetor = () => {
    if (!novoSetor.nome) {
      alert("Preencha o nome do setor");
      return;
    }
    addSetor({ ...novoSetor, ativo: true });
    setSetoresState(getSetores());
    setNovoSetor({ nome: "", tipo: "escola" });
    setShowNovoSetor(false);
  };

  const handleDesativarUsuario = (id: string) => {
    desativarUsuario(id);
    setUsuarios(getUsuarios());
  };

  const handleReativarUsuario = (id: string) => {
    reativarUsuario(id);
    setUsuarios(getUsuarios());
  };

  const handleAprovarUsuario = (id: string) => {
    updateUsuario(id, { statusAprovacao: "aprovado" });
    setUsuarios(getUsuarios());
  };

  const handleRejeitarUsuario = (id: string) => {
    updateUsuario(id, { statusAprovacao: "rejeitado" });
    setUsuarios(getUsuarios());
  };

  const handleDesativarSetor = (id: string) => {
    desativarSetor(id);
    setSetoresState(getSetores());
  };

  const usuariosFiltrados = usuarios.filter(u => mostrarInativos ? true : u.ativo);
  const usuariosPendentes = usuarios.filter(u => u.statusAprovacao === "pendente");
  const setoresFiltrados = setores.filter(s => mostrarInativos ? true : s.ativo);

  // Inventario: agrupar todas solicitacoes por escola
  const inventarioPorEscola = (() => {
    const anoFilter = anoFiltro === "Todos os Anos" ? null : anoFiltro;
    const statusFilter = statusFiltro === "Todos os Status" ? null : statusFiltro;
    const mesFilter = mesFiltro === "Todos os Meses" ? null : mesNumero[mesFiltro];

    const todasSolicitacoes = solicitacoes.filter((s) => {
      const matchAno = !anoFilter || s.dataHora.includes(anoFilter);
      const matchMes = !mesFilter || (() => {
        // dataHora format: "DD/MM/YYYY, HH:MM:SS" or similar
        const parts = s.dataHora.split("/");
        return parts.length >= 2 && parts[1] === mesFilter;
      })();
      const matchStatus = !statusFilter || (s.status || "Pendente") === statusFilter;
      const matchSearch = searchTerm === "" || s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || s.instituicao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchAno && matchMes && matchStatus && matchSearch;
    });

    const grouped: Record<string, { instituicao: string; solicitacoes: Solicitacao[] }> = {};
    todasSolicitacoes.forEach((s) => {
      const key = s.instituicao;
      if (!grouped[key]) {
        grouped[key] = { instituicao: key, solicitacoes: [] };
      }
      grouped[key].solicitacoes.push(s);
    });

    const filteredByInstituicao = instituicaoFiltro === "Todas Instituicoes"
      ? Object.values(grouped)
      : Object.values(grouped).filter(g => g.instituicao === instituicaoFiltro);

    return filteredByInstituicao.sort((a, b) => a.instituicao.localeCompare(b.instituicao));
  })();

  const handleBaixarPDFEscola = (escola: { instituicao: string; solicitacoes: Solicitacao[] }) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const m = 15;
    const cw = pw - m * 2;
    let y = 0;

    doc.setFillColor(17, 28, 68);
    doc.rect(0, 0, pw, 28, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("RELATORIO - " + escola.instituicao, pw / 2, 12, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 230);
    doc.text(`Ano: ${anoFiltro === "Todos os Anos" ? "Todos" : anoFiltro} | Total: ${escola.solicitacoes.length} solicitacoes`, pw / 2, 22, { align: "center" });
    y = 38;

    escola.solicitacoes.forEach((s, idx) => {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFillColor(243, 244, 246);
      doc.rect(m, y - 3, cw, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(17, 28, 68);
      doc.text(`#${idx + 1} - ${s.tipo.toUpperCase()}`, m + 2, y + 1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text(`${s.nome} | Mat: ${s.matricula} | ${s.dataHora} | ${s.status || "Pendente"}`, m + 2, y + 6);
      y += 12;

      const addItens = (itens: { desc: string; qtd: number }[]) => {
        itens.forEach((item) => {
          if (y > 275) { doc.addPage(); y = 15; }
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(55, 65, 81);
          const lines = doc.splitTextToSize(`- ${item.desc}: ${item.qtd}`, cw - 5);
          doc.text(lines[0], m + 4, y);
          y += 4;
        });
      };

      if (s.uniformesDetalhes?.length) addItens(s.uniformesDetalhes.map((u) => ({ desc: `Uniforme ${u.tipo} ${u.genero} Tam:${u.tamanho}`, qtd: u.quantidade })));
      if (s.calcadosDetalhes?.length) addItens(s.calcadosDetalhes.map((c) => ({ desc: `Calcado Tam:${c.tamanho}`, qtd: c.quantidade })));
      if (s.kitsAlunoDetalhes?.length) addItens(s.kitsAlunoDetalhes.map((k) => ({ desc: `Kit ${k.tipo}`, qtd: k.quantidade })));
      if (s.polosProfDetalhes?.length) addItens(s.polosProfDetalhes.map((p) => ({ desc: `Polo ${p.tipo} Tam:${p.tamanho}`, qtd: p.quantidade })));
      if (s.mochilasDetalhes?.length) addItens(s.mochilasDetalhes.map((mo) => ({ desc: `Mochila ${mo.tipo}`, qtd: mo.quantidade })));
      if (s.papelaria?.length) addItens(s.papelaria.map((p) => ({ desc: p.tipo, qtd: p.quantidade })));
      if (s.cozinha?.length) addItens(s.cozinha.map((c) => ({ desc: c.tipo, qtd: c.quantidade })));
      if (s.itens?.length) addItens(s.itens.map((i) => ({ desc: i.tipo, qtd: i.quantidade })));
      if (s.tipo === "transferencia") {
        if (y > 270) { doc.addPage(); y = 15; }
        doc.setFontSize(7);
        doc.setTextColor(55, 65, 81);
        doc.text(`Origem: ${s.unidadeOrigem || "-"} | Destino: ${s.unidadeDestino || "-"} | Pat: ${s.numeroPatrimonio || "-"}`, m + 4, y);
        y += 4;
      }
      y += 4;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(156, 163, 175);
    doc.text("Prefeitura Municipal de Saquarema", pw / 2, 290, { align: "center" });

    doc.save(`relatorio_${escola.instituicao.replace(/\s+/g, "_")}_${anoFiltro === "Todos os Anos" ? "todos" : anoFiltro}.pdf`);
  };

  const handleBaixarRelatorioCompleto = () => {
    const allSols = inventarioPorEscola.flatMap(e => e.solicitacoes);
    if (allSols.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 12;
    const cw = pw - m * 2;
    let y = 0;

    const totalSols = allSols.length;
    const totalFin = allSols.filter(s => s.status === "Finalizado").length;
    const totalPen = allSols.filter(s => (s.status || "Pendente") === "Pendente").length;
    const totalProc = allSols.filter(s => s.status === "Processamento").length;

    const periodoLabel = mesFiltro === "Todos os Meses" && anoFiltro === "Todos os Anos"
      ? "Todos os periodos"
      : mesFiltro === "Todos os Meses"
        ? `Ano ${anoFiltro}`
        : anoFiltro === "Todos os Anos"
          ? mesFiltro
          : `${mesFiltro} de ${anoFiltro}`;

    // Header
    doc.setFillColor(17, 28, 68);
    doc.rect(0, 0, pw, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("RELATORIO GERAL DE SOLICITACOES", pw / 2, 13, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 230);
    doc.text(`Periodo: ${periodoLabel} | ${instituicaoFiltro === "Todas as Instituicoes" ? "Todas as instituicoes" : instituicaoFiltro} | Gerado em: ${new Date().toLocaleString("pt-BR")}`, pw / 2, 22, { align: "center" });
    y = 38;

    // Summary boxes
    const boxW = 55;
    const boxH = 16;
    const boxGap = 8;
    const startX = (pw - (boxW * 4 + boxGap * 3)) / 2;

    const boxes = [
      { label: "TOTAL", val: String(totalSols), color: [17, 28, 68] },
      { label: "FINALIZADOS", val: String(totalFin), color: [22, 163, 74] },
      { label: "PENDENTES", val: String(totalPen), color: [217, 119, 6] },
      { label: "PROCESSANDO", val: String(totalProc), color: [37, 99, 235] },
    ];

    boxes.forEach((box, i) => {
      const bx = startX + i * (boxW + boxGap);
      doc.setFillColor(box.color[0], box.color[1], box.color[2]);
      doc.roundedRect(bx, y, boxW, boxH, 2, 2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(box.label, bx + boxW / 2, y + 5, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(box.val, bx + boxW / 2, y + 13, { align: "center" });
    });
    y += boxH + 10;

    // Table
    const cols = [m, m + 55, m + 90, m + 120, m + 160, m + 190, m + 230];
    const headers = ["Instituicao", "Solicitante", "Matricula", "Tipo", "Data", "Status", "Itens (qtd)"];

    doc.setFillColor(17, 28, 68);
    doc.rect(m, y - 3, cw, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    headers.forEach((h, i) => {
      doc.text(h, cols[i] + 1, y + 1);
    });
    y += 8;

    allSols.forEach((s, idx) => {
      if (y > ph - 15) { doc.addPage(); y = 15; }
      if (idx % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(m, y - 3, cw, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(55, 65, 81);

      const status = s.status || "Pendente";
      const totalI = getTotalItens(s);

      const vals = [s.instituicao, s.nome, s.matricula, s.tipo, s.dataHora, status, String(totalI)];
      vals.forEach((v, i) => {
        const maxW = i < cols.length - 1 ? cols[i + 1] - cols[i] - 3 : 35;
        const lines = doc.splitTextToSize(v, maxW);

        // Color code status
        if (i === 5) {
          if (status === "Finalizado") doc.setTextColor(22, 163, 74);
          else if (status === "Pendente") doc.setTextColor(217, 119, 6);
          else if (status === "Processamento") doc.setTextColor(37, 99, 235);
          else doc.setTextColor(55, 65, 81);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(55, 65, 81);
          doc.setFont("helvetica", "normal");
        }
        doc.text(lines[0], cols[i] + 1, y);
      });
      y += 6;
    });

    // Resumo por escola
    if (inventarioPorEscola.length > 1) {
      if (y > ph - 50) { doc.addPage(); y = 15; }
      y += 8;
      doc.setFillColor(17, 28, 68);
      doc.rect(m, y - 3, cw, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("RESUMO POR INSTITUICAO", m + 2, y + 1);
      y += 10;

      const rCols = [m, m + 100, m + 130, m + 160, m + 195];
      doc.setFillColor(243, 244, 246);
      doc.rect(m, y - 3, cw, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(107, 114, 128);
      ["Instituicao", "Total", "Finalizados", "Pendentes", "Processando"].forEach((h, i) => {
        doc.text(h, rCols[i] + 1, y);
      });
      y += 7;

      inventarioPorEscola.forEach((escola, idx) => {
        if (y > ph - 12) { doc.addPage(); y = 15; }
        if (idx % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(m, y - 3, cw, 6, "F");
        }
        const eFin = escola.solicitacoes.filter(s => s.status === "Finalizado").length;
        const ePen = escola.solicitacoes.filter(s => (s.status || "Pendente") === "Pendente").length;
        const eProc = escola.solicitacoes.filter(s => s.status === "Processamento").length;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(55, 65, 81);
        const nameLines = doc.splitTextToSize(escola.instituicao, 95);
        doc.text(nameLines[0], rCols[0] + 1, y);
        doc.setFont("helvetica", "bold");
        doc.text(String(escola.solicitacoes.length), rCols[1] + 1, y);
        doc.setTextColor(22, 163, 74);
        doc.text(String(eFin), rCols[2] + 1, y);
        doc.setTextColor(217, 119, 6);
        doc.text(String(ePen), rCols[3] + 1, y);
        doc.setTextColor(37, 99, 235);
        doc.text(String(eProc), rCols[4] + 1, y);
        y += 6;
      });
    }

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(156, 163, 175);
    doc.text("Prefeitura Municipal de Saquarema - Sistema de Solicitacoes", pw / 2, ph - 5, { align: "center" });

    const nomeArquivo = mesFiltro === "Todos os Meses" && anoFiltro === "Todos os Anos"
      ? "relatorio_geral_completo"
      : mesFiltro === "Todos os Meses"
        ? `relatorio_anual_${anoFiltro}`
        : `relatorio_${mesFiltro.replace(/\s+/g, "_")}_${anoFiltro}`;
    doc.save(`${nomeArquivo}.pdf`);
  };

  const [editingSolicitacao, setEditingSolicitacao] = useState<Solicitacao | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleSaveEdit = (updated: Solicitacao) => {
    setSolicitacoes((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    if (typeof window !== "undefined") {
      const all = solicitacoes.map((s) => (s.id === updated.id ? updated : s));
      localStorage.setItem("inove_saqua_solicitacoes", JSON.stringify(all));
    }
    setEditDialogOpen(false);
    setEditingSolicitacao(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? (sidebarCollapsed ? "w-[70px]" : "w-60") : "w-0 overflow-hidden"} bg-[#111c44] flex flex-col shrink-0 transition-all duration-300 rounded-r-3xl`}>
        <div className={`px-4 py-5 border-b border-white/10 flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Armchair className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight leading-tight">PATRIMONIO</span>
              <span className="text-[10px] text-white/50 font-medium">Painel Administrativo</span>
            </div>
          )}
        </div>
        <div className="px-2 pt-3 pb-1 border-b border-white/10">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full`}
          >
            <Menu className="w-[18px] h-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Recolher</span>}
          </button>
        </div>
<nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
  {sidebarItems.map((item) => {
  const isActive = activeSidebar === item.id;
  const pendentes = badgesPorSecao[item.id] || 0;
  return (
  <button
  key={item.id}
  onClick={() => setActiveSidebar(item.id)}
  title={sidebarCollapsed ? item.label : undefined}
  className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left relative ${
  isActive
  ? "bg-white/20 text-white"
  : "text-white/70 hover:bg-white/10 hover:text-white"
  }`}
  >
  <div className="relative">
  <item.icon className="w-[18px] h-[18px] shrink-0" />
  {sidebarCollapsed && pendentes > 0 && (
    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
      {pendentes > 99 ? "99+" : pendentes}
    </span>
  )}
  </div>
  {!sidebarCollapsed && <span>{item.label}</span>}
  {!sidebarCollapsed && pendentes > 0 && (
    <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
      {pendentes > 99 ? "99+" : pendentes}
    </span>
  )}
  {isActive && !sidebarCollapsed && pendentes === 0 && <ChevronRight className="w-4 h-4 ml-auto" />}
  </button>
  );
  })}
  </nav>
        <div className="px-2 py-3 border-t border-white/10">
          <Link
            href="/"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Sair</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#e5e5e5] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-[#5a5a5a] hover:bg-[#f5f5f5] rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#1a1a1a]">{getSidebarTitle()}</h1>
                <p className="text-xs text-[#8c8c8c] mt-0.5">{getSidebarDescription()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-9 h-9 w-56 text-sm border-[#e5e5e5] bg-[#f9f9f9]"
                />
              </div>
              {/* Notificacao de Estoque Baixo */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificacoes(!showNotificacoes)}
                  className="relative p-2 rounded-lg hover:bg-[#f5f5f5] transition-colors"
                >
                  <Bell className="w-5 h-5 text-[#5a5a5a]" />
                  {mounted && (() => {
                    const itensNaoLidos = itensEstoqueBaixoPatrimonio.filter(i => !notificacoesLidas.has(i.id));
                    return itensNaoLidos.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {itensNaoLidos.length > 9 ? "9+" : itensNaoLidos.length}
                      </span>
                    );
                  })()}
                </button>
                {showNotificacoes && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-[#e5e5e5] shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-[#e5e5e5] flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#1a1a1a]">Alertas de Estoque Baixo</h3>
                      <button
                        onClick={() => {
                          const todosIds = new Set(itensEstoqueBaixoPatrimonio.map(i => i.id));
                          setNotificacoesLidas(todosIds);
                        }}
                        className="text-xs text-[#111c44] font-medium hover:underline"
                      >
                        Marcar todas como lidas
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {itensEstoqueBaixoPatrimonio.length > 0 ? (
                        itensEstoqueBaixoPatrimonio.map(item => {
                          const isLida = notificacoesLidas.has(item.id);
                          return (
                            <div
                              key={item.id}
                              className={`px-4 py-3 border-b border-[#f0f0f0] last:border-b-0 flex items-center gap-3 ${isLida ? "opacity-60 bg-[#fafafa]" : "bg-white"}`}
                            >
                              <div className={`w-8 h-8 rounded-lg ${item.estoque < 10 ? "bg-red-50" : "bg-amber-50"} flex items-center justify-center shrink-0`}>
                                <AlertTriangle className={`w-4 h-4 ${item.estoque < 10 ? "text-red-500" : "text-amber-500"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#1a1a1a] truncate font-medium">{item.nome}</p>
                                <p className="text-xs text-[#999]">
                                  Estoque: <span className={item.estoque < 10 ? "text-red-500 font-bold" : "text-amber-500 font-bold"}>{item.estoque}</span> unidades
                                </p>
                              </div>
                              {!isLida && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNotificacoesLidas(prev => new Set([...prev, item.id]));
                                  }}
                                  className="text-xs text-[#111c44] font-medium hover:underline whitespace-nowrap"
                                >
                                  Marcar lida
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center text-[#999]">
                          <PackageCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum item com estoque baixo</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowChatPanel(true)}
                className="relative p-2.5 text-[#5a5a5a] bg-white border border-[#e5e5e5] rounded-lg hover:bg-[#f9f9f9] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {totalNaoLidas > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {totalNaoLidas}
                  </span>
                )}
              </button>
              <div className="w-9 h-9 rounded-full bg-[#111c44] flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity" title="Administrador">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeSidebar === "inventario" ? (
            /* INVENTARIO VIEW */
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">Inventario Anual</h2>
                <p className="text-xs text-[#8c8c8c]">Solicitacoes de inventario patrimonial das escolas e setores</p>
              </div>

              {/* Cards de status no TOPO - combina inventarios gerais + por setor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-[#e5e5e5] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#1a1a1a]">
                        {inventarios.filter(i => i.status === "Pendente").length + inventariosSetor.filter(i => i.status === "Pendente").length}
                      </p>
                      <p className="text-xs text-[#8c8c8c]">Pendentes</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#e5e5e5] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#1a1a1a]">
                        {inventarios.filter(i => i.status === "Em Analise").length + inventariosSetor.filter(i => i.status === "Em Analise").length}
                      </p>
                      <p className="text-xs text-[#8c8c8c]">Em Analise</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#e5e5e5] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#1a1a1a]">
                        {inventarios.filter(i => i.status === "Finalizado").length + inventariosSetor.filter(i => i.status === "Finalizado").length}
                      </p>
                      <p className="text-xs text-[#8c8c8c]">Finalizados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de inventarios */}
              <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
                  <span className="text-sm font-semibold text-[#1a1a1a]">Solicitacoes de Inventario ({inventarios.length})</span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {inventarios.length > 0 ? inventarios.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a]">{inv.escola}</p>
                        <p className="text-xs text-[#666]">Setor: {inv.setor} | Solicitante: {inv.solicitante} | Ano: {inv.ano}</p>
                        <p className="text-xs text-[#999]">{inv.dataHora} - {inv.itens.length} itens</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          inv.status === "Pendente" ? "bg-amber-50 text-amber-700" :
                          inv.status === "Em Analise" ? "bg-blue-50 text-blue-700" :
                          "bg-green-50 text-green-700"
                        }`}>
                          {inv.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setInventarioSelecionado(inv); setInventarioDialogOpen(true); }}
                          className="h-7 text-xs border-[#e5e5e5]"
                        >
                          <Eye className="w-3 h-3 mr-1" /> Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Gerar PDF do inventario
                            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                            const pw = doc.internal.pageSize.getWidth();
                            const m = 10;
                            let y = 10;

                            // Header com logo
                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(0, 0, 0);
                            doc.text("Estado do Rio de Janeiro", 45, y);
                            y += 4;
                            doc.setFont("helvetica", "bold");
                            doc.text("PREFEITURA MUNICIPAL DE SAQUAREMA", 45, y);
                            y += 4;
                            doc.setFont("helvetica", "normal");
                            doc.text("Secretaria Municipal de Educacao - SME", 45, y);
                            y += 4;
                            doc.text("Av. Saquarema, n 4299, Porto da Roca - Saquarema - RJ", 45, y);
                            y += 10;

                            // Linha separadora
                            doc.setDrawColor(0, 0, 0);
                            doc.line(m, y, pw - m, y);
                            y += 5;

                            // Titulo
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(10);
                            doc.text(`ESCOLA: ${inv.escola}`, m, y);
                            y += 6;
                            doc.text(`BENS PATRIMONIAIS - ARROLAMENTO DAS EXISTENCIAS EM 31/12/${inv.ano}`, m, y);
                            y += 6;

                            // Info
                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.text(`Secretaria: ${inv.secretaria}`, m, y);
                            doc.text(`Setor: ${inv.setor}`, m + 80, y);
                            doc.text(`Folha: 1`, pw - m - 20, y);
                            y += 8;

                            // Tabela header
                            const cols = [m, m + 25, m + 85, m + 115, m + 145, m + 165];
                            const colHeaders = ["Numero Placa", "Caracteristica de identificacao", "Marca/Modelo", "N de Serie", "Local", "Observacao"];
                            doc.setFillColor(240, 240, 240);
                            doc.rect(m, y - 3, pw - m * 2, 7, "F");
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(7);
                            colHeaders.forEach((h, i) => {
                              doc.text(h, cols[i], y + 1);
                            });
                            y += 8;

                            // Linhas da tabela
                            doc.setFont("helvetica", "normal");
                            doc.setFontSize(7);
                            inv.itens.forEach((item, idx) => {
                              if (y > 270) { doc.addPage(); y = 15; }
                              doc.setDrawColor(200, 200, 200);
                              doc.line(m, y + 3, pw - m, y + 3);
                              doc.text(item.numeroPlaca || "-", cols[0], y);
                              doc.text(item.caracteristica || "-", cols[1], y);
                              doc.text(item.marcaModelo || "-", cols[2], y);
                              doc.text(item.numeroSerie || "-", cols[3], y);
                              doc.text(item.medidas || "-", cols[4], y);
                              doc.text(item.observacao || "-", cols[5], y);
                              y += 7;
                            });

                            // Linhas vazias para preenchimento
                            for (let i = 0; i < 10; i++) {
                              if (y > 270) break;
                              doc.setDrawColor(200, 200, 200);
                              doc.line(m, y + 3, pw - m, y + 3);
                              y += 7;
                            }

                            doc.save(`inventario_${inv.escola.replace(/\s+/g, "_")}_${inv.ano}.pdf`);
                          }}
                          className="h-7 text-xs border-[#e5e5e5]"
                        >
                          <Download className="w-3 h-3 mr-1" /> PDF
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="px-5 py-12 text-center text-[#aaa]">
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Nenhuma solicitacao de inventario registrada</p>
                      <p className="text-xs mt-1">As escolas podem solicitar inventario pelo formulario</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventarios por setor recebidos */}
              <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#111c44]" />
                    <span className="text-sm font-semibold text-[#1a1a1a]">Inventarios por Setor Recebidos ({inventariosSetor.length})</span>
                  </div>
                  {inventariosSetor.filter(i => i.status === "Pendente").length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      {inventariosSetor.filter(i => i.status === "Pendente").length} pendente(s)
                    </span>
                  )}
                </div>
                <div className="max-h-[50vh] overflow-y-auto">
                  {inventariosSetor.length > 0 ? inventariosSetor.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{inv.denominacao}</p>
                        <p className="text-xs text-[#666]">Resp: {inv.respNome} | Agente: {inv.agenteNome}</p>
                        <p className="text-xs text-[#999]">{inv.dataHora} &mdash; {inv.itens.length} itens</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          inv.status === "Pendente" ? "bg-amber-50 text-amber-700" :
                          inv.status === "Em Analise" ? "bg-blue-50 text-blue-700" :
                          "bg-green-50 text-green-700"
                        }`}>
                          {inv.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setInventarioSetorSelecionado(inv); setInventarioSetorDialogOpen(true); }}
                          className="h-7 text-xs border-[#e5e5e5]"
                        >
                          <Eye className="w-3 h-3 mr-1" /> Ver
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="px-5 py-10 text-center text-[#aaa]">
                      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Nenhum inventario por setor recebido</p>
                      <p className="text-xs mt-1">Os inventarios enviados pelas escolas apareceram aqui</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Inventario por Setor - Detalhes */}
              <Dialog open={inventarioSetorDialogOpen} onOpenChange={setInventarioSetorDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#111c44]" />
                      Inventario por Setor
                    </DialogTitle>
                  </DialogHeader>
                  {inventarioSetorSelecionado && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#f8fafc] rounded-lg p-3">
                          <p className="text-xs text-[#999] mb-0.5">Secretaria</p>
                          <p className="text-sm font-semibold text-[#1a1a1a]">{inventarioSetorSelecionado.secretaria}</p>
                        </div>
                        <div className="bg-[#f8fafc] rounded-lg p-3">
                          <p className="text-xs text-[#999] mb-0.5">Instituicao Responsavel</p>
                          <p className="text-sm font-semibold text-[#1a1a1a]">{inventarioSetorSelecionado.denominacao}</p>
                        </div>
                        <div className="bg-[#f8fafc] rounded-lg p-3">
                          <p className="text-xs text-[#999] mb-0.5">Endereco</p>
                          <p className="text-sm text-[#1a1a1a]">{inventarioSetorSelecionado.endereco}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-xs text-amber-700 font-semibold mb-0.5">Sala Responsavel</p>
                          <p className="text-sm font-semibold text-[#1a1a1a]">{inventarioSetorSelecionado.salaResponsavel || "-"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#f0f4ff] rounded-lg p-3">
                          <p className="text-xs font-semibold text-[#111c44] mb-2">Responsavel pelo Orgao</p>
                          <p className="text-sm text-[#1a1a1a]">{inventarioSetorSelecionado.respNome}</p>
                          <p className="text-xs text-[#666]">CPF: {inventarioSetorSelecionado.respCPF} | Mat: {inventarioSetorSelecionado.respMatricula}</p>
                        </div>
                        <div className="bg-[#f0f4ff] rounded-lg p-3">
                          <p className="text-xs font-semibold text-[#111c44] mb-2">Agente Patrimonial</p>
                          <p className="text-sm text-[#1a1a1a]">{inventarioSetorSelecionado.agenteNome}</p>
                          <p className="text-xs text-[#666]">CPF: {inventarioSetorSelecionado.agenteCPF} | Mat: {inventarioSetorSelecionado.agenteMatricula}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Bens Moveis ({inventarioSetorSelecionado.itens.length} itens)</p>
                        <div className="border border-[#e5e5e5] rounded-lg overflow-hidden max-h-[280px] overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-[#f0f0f0] sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-[#475569] w-28">Codigo do Bem</th>
                                <th className="px-3 py-2 text-left font-semibold text-[#475569]">Descricao Generica</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventarioSetorSelecionado.itens.map((item, idx) => (
                                <tr key={idx} className={`border-t border-[#f0f0f0] ${idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                                  <td className="px-3 py-2 font-mono text-[#666]">{item.codigo || "-"}</td>
                                  <td className="px-3 py-2 text-[#1a1a1a]">{item.descricao}</td>
                                </tr>
                              ))}
                              {inventarioSetorSelecionado.itens.length === 0 && (
                                <tr><td colSpan={2} className="px-3 py-6 text-center text-[#aaa]">Nenhum item cadastrado</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e5]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#666]">Status:</span>
                          <Select
                            value={inventarioSetorSelecionado.status}
                            onValueChange={(newStatus) => {
                              updateInventarioSetor(inventarioSetorSelecionado.id, { status: newStatus as SolicitacaoInventarioSetor["status"] });
                              setInventariosSetor(getInventariosSetor());
                              setInventarioSetorSelecionado({ ...inventarioSetorSelecionado, status: newStatus as SolicitacaoInventarioSetor["status"] });
                            }}
                          >
                            <SelectTrigger className="h-8 w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                              <SelectItem value="Em Analise">Em Analise</SelectItem>
                              <SelectItem value="Finalizado">Finalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const inv = inventarioSetorSelecionado;
                              const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                              const pw = doc.internal.pageSize.getWidth();
                              const ph = doc.internal.pageSize.getHeight();
                              const m = 15;
                              const cw = pw - m * 2;
                              let y = 10;
                              const anoAtual = new Date().getFullYear();

                              doc.setFontSize(9);
                              doc.setFont("helvetica", "bold");
                              doc.setTextColor(0, 0, 0);
                              doc.text("ESTADO DO RIO DE JANEIRO", pw / 2, y, { align: "center" });
                              y += 4;
                              doc.text("PREFEITURA MUNICIPAL DE SAQUAREMA", pw / 2, y, { align: "center" });
                              y += 4;
                              doc.setFont("helvetica", "normal");
                              doc.setFontSize(8);
                              doc.text("Secretaria Municipal de Administracao, Receita e Tributacao", pw / 2, y, { align: "center" });
                              y += 3;
                              doc.text("Setor de Patrimonio", pw / 2, y, { align: "center" });
                              y += 8;

                              doc.setDrawColor(0, 0, 0);
                              doc.setLineWidth(0.5);
                              doc.line(m, y, pw - m, y);
                              y += 6;

                              doc.setFont("helvetica", "bold");
                              doc.setFontSize(11);
                              doc.text(`LEVANTAMENTO PRELIMINAR PARA INVENTARIO ANUAL - ${anoAtual}/${anoAtual + 1}`, pw / 2, y, { align: "center" });
                              y += 5;
                              doc.text("= PATRIMONIO MOBILIARIO =", pw / 2, y, { align: "center" });
                              y += 8;

                              doc.setFont("helvetica", "normal");
                              doc.setFontSize(7);
                              doc.text("Base Legal: C. F. 1988: Art. 5, II e LXXIII e Art. 23, I; C. Estadual: Art. 11; Art. 73, I e Art. 360, e Lei Organica: Art. 10, X, XVIII; Art. 11, I e III", m, y);
                              y += 6;

                              doc.setDrawColor(0, 0, 0);
                              doc.setLineWidth(0.3);
                              doc.rect(m, y, cw, 10);
                              doc.setFont("helvetica", "bold");
                              doc.setFontSize(8);
                              doc.text("Secretaria + Orgao Responsavel:", m + 2, y + 4);
                              doc.setFont("helvetica", "normal");
                              doc.text(inv.secretaria.toUpperCase(), m + 2, y + 8);
                              y += 10;

                              doc.rect(m, y, cw, 10);
                              doc.setFont("helvetica", "bold");
                              doc.text("Denominacao do Imovel + Setor de Responsabilidade:", m + 2, y + 4);
                              doc.setFont("helvetica", "normal");
                              doc.text(inv.denominacao.toUpperCase(), m + 2, y + 8);
                              y += 10;

                              doc.rect(m, y, cw, 10);
                              doc.setFont("helvetica", "bold");
                              doc.text("Endereco:", m + 2, y + 4);
                              doc.setFont("helvetica", "normal");
                              doc.text(inv.endereco.toUpperCase(), m + 2, y + 8);
                              y += 10;

                              if (inv.salaResponsavel) {
                                doc.rect(m, y, cw, 10);
                                doc.setFont("helvetica", "bold");
                                doc.text("Sala Responsavel:", m + 2, y + 4);
                                doc.setFont("helvetica", "normal");
                                doc.text(inv.salaResponsavel.toUpperCase(), m + 2, y + 8);
                                y += 10;
                              }

                              doc.rect(m, y, cw, 14);
                              doc.setFont("helvetica", "bold");
                              doc.setFontSize(7);
                              doc.text("Responsavel pelo Orgao", m + cw / 2, y + 3, { align: "center" });
                              doc.line(m, y + 5, pw - m, y + 5);
                              doc.setFont("helvetica", "normal");
                              doc.text("Nome:", m + 2, y + 9);
                              doc.text(inv.respNome.toUpperCase(), m + 15, y + 9);
                              doc.text("CPF:", m + cw / 2, y + 9);
                              doc.text(inv.respCPF, m + cw / 2 + 12, y + 9);
                              doc.text("Matricula:", m + cw * 0.75, y + 9);
                              doc.text(inv.respMatricula, m + cw * 0.75 + 18, y + 9);
                              y += 14;

                              doc.rect(m, y, cw, 14);
                              doc.setFont("helvetica", "bold");
                              doc.text("Agente Patrimonial", m + cw / 2, y + 3, { align: "center" });
                              doc.line(m, y + 5, pw - m, y + 5);
                              doc.setFont("helvetica", "normal");
                              doc.text("Nome:", m + 2, y + 9);
                              doc.text(inv.agenteNome.toUpperCase(), m + 15, y + 9);
                              doc.text("CPF:", m + cw / 2, y + 9);
                              doc.text(inv.agenteCPF, m + cw / 2 + 12, y + 9);
                              doc.text("Matricula:", m + cw * 0.75, y + 9);
                              doc.text(inv.agenteMatricula, m + cw * 0.75 + 18, y + 9);
                              y += 16;

                              // Tabela de itens
                              const colW = cw / 4;
                              doc.rect(m, y, cw, 6);
                              doc.setFont("helvetica", "bold");
                              doc.setFontSize(7);
                              doc.text("Codigo Bem", m + 2, y + 4);
                              doc.text("Descricao Generica", m + colW, y + 4);
                              doc.text("Codigo Bem", m + colW * 2, y + 4);
                              doc.text("Descricao Generica", m + colW * 3, y + 4);
                              doc.line(m + colW, y, m + colW, y + 6);
                              doc.line(m + colW * 2, y, m + colW * 2, y + 6);
                              doc.line(m + colW * 3, y, m + colW * 3, y + 6);
                              y += 6;

                              doc.setFont("helvetica", "normal");
                              const rowHeight = 6;
                              const itensDoInv = inv.itens || [];
                              const totalRows = Math.max(10, Math.ceil(itensDoInv.length / 2));
                              
                              for (let i = 0; i < totalRows; i++) {
                                if (y > ph - 30) {
                                  doc.addPage();
                                  y = 20;
                                }
                                doc.rect(m, y, cw, rowHeight);
                                doc.line(m + colW, y, m + colW, y + rowHeight);
                                doc.line(m + colW * 2, y, m + colW * 2, y + rowHeight);
                                doc.line(m + colW * 3, y, m + colW * 3, y + rowHeight);

                                const leftIdx = i * 2;
                                const rightIdx = i * 2 + 1;

                                if (itensDoInv[leftIdx]) {
                                  doc.text(itensDoInv[leftIdx].codigo || "", m + 2, y + 4);
                                  doc.text(itensDoInv[leftIdx].descricao.substring(0, 25), m + colW + 2, y + 4);
                                }
                                if (itensDoInv[rightIdx]) {
                                  doc.text(itensDoInv[rightIdx].codigo || "", m + colW * 2 + 2, y + 4);
                                  doc.text(itensDoInv[rightIdx].descricao.substring(0, 25), m + colW * 3 + 2, y + 4);
                                }
                                y += rowHeight;
                              }

                              y += 8;
                              doc.setFontSize(6);
                              doc.text("Rua Coronel Madureira, 77 - Centro - Saquarema - RJ - CEP: 28990-756", pw / 2, ph - 10, { align: "center" });
                              doc.text("CNPJ / MF: 32.147.670/0001-21", pw / 2, ph - 6, { align: "center" });

                              doc.save(`Inventario_Setor_${inv.denominacao.replace(/\s+/g, "_").substring(0, 30)}_${anoAtual}.pdf`);
                            }}
                            className="h-8 text-sm border-[#111c44] text-[#111c44] hover:bg-[#111c44]/5"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            PDF
                          </Button>
                          <Button variant="outline" onClick={() => setInventarioSetorDialogOpen(false)} className="h-8 text-sm">
                            Fechar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ) : activeSidebar === "relatorio" ? (
            /* RELATORIO VIEW */
            <div className="space-y-5">
              {/* Tabs de relatório */}
              <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-lg p-1">
                <button onClick={() => setRelatorioAbaAtiva("materiais")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${relatorioAbaAtiva === "materiais" ? "bg-white text-[#111c44] shadow-sm" : "text-[#666] hover:bg-white/50"}`}>
                  <Package className="w-4 h-4" /> Materiais
                </button>
                <button onClick={() => setRelatorioAbaAtiva("transferencias")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${relatorioAbaAtiva === "transferencias" ? "bg-white text-[#111c44] shadow-sm" : "text-[#666] hover:bg-white/50"}`}>
                  <ArrowRightLeft className="w-4 h-4" /> Transferencias
                </button>
                <button onClick={() => setRelatorioAbaAtiva("inventarios")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${relatorioAbaAtiva === "inventarios" ? "bg-white text-[#111c44] shadow-sm" : "text-[#666] hover:bg-white/50"}`}>
                  <ClipboardList className="w-4 h-4" /> Inventarios
                </button>
              </div>

              {relatorioAbaAtiva === "materiais" && (
              <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const allSols = inventarioPorEscola.flatMap(e => e.solicitacoes);
                  const totalSols = allSols.length;
                  const totalFinalizados = allSols.filter(s => s.status === "Finalizado").length;
                  const totalPendentes = allSols.filter(s => (s.status || "Pendente") === "Pendente").length;
                  const totalProcessamento = allSols.filter(s => s.status === "Processamento").length;
                  return (
                    <>
                      <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
                        <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Total de Envios</p>
                        <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{totalSols}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
                        <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Finalizados</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{totalFinalizados}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
                        <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Pendentes</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{totalPendentes}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
                        <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Em Processamento</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{totalProcessamento}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                {/* Filters */}
                <div className="px-5 py-3.5 border-b border-[#e5e5e5] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1a1a1a]">
                      Relatorio de Envios ({inventarioPorEscola.reduce((acc, e) => acc + e.solicitacoes.length, 0)} registros - {inventarioPorEscola.length} escolas)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select value={instituicaoFiltro} onValueChange={setInstituicaoFiltro}>
                      <SelectTrigger className="w-48 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {instituicoes.map((inst) => (
                          <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={mesFiltro} onValueChange={setMesFiltro}>
                      <SelectTrigger className="w-40 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {meses.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={anoFiltro} onValueChange={setAnoFiltro}>
                      <SelectTrigger className="w-36 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {anos.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                      <SelectTrigger className="w-40 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos os Status">Todos os Status</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Processamento">Processamento</SelectItem>
                        <SelectItem value="Finalizado">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={responsavelFiltro} onValueChange={setResponsavelFiltro}>
                      <SelectTrigger className="w-36 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos os Membros</SelectItem>
                        {MEMBROS_EQUIPE.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-xs font-medium text-[#5a5a5a] border border-[#e5e5e5] rounded-lg hover:bg-[#f9f9f9] transition-colors"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={handleBaixarRelatorioCompleto}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#111c44] hover:bg-[#0e1735] rounded-lg transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar Relatorio Completo (PDF)
                    </button>
                  </div>
                </div>

                {/* Relatorio por escola */}
                <div className="divide-y divide-[#e5e5e5]">
                  {inventarioPorEscola.map((escola) => {
                    const tiposCount: Record<string, number> = {};
                    escola.solicitacoes.forEach((s) => {
                      tiposCount[s.tipo] = (tiposCount[s.tipo] || 0) + 1;
                    });
                    const pendentes = escola.solicitacoes.filter(s => (s.status || "Pendente") === "Pendente").length;
                    const finalizados = escola.solicitacoes.filter(s => s.status === "Finalizado").length;

                    return (
                      <div key={escola.instituicao} className="px-5 py-4">
                        {/* Escola header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-[#111c44]">{escola.instituicao}</h3>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs text-[#666]">{escola.solicitacoes.length} envios</span>
                              {Object.entries(tiposCount).map(([tipo, count]) => {
                                const badge = getTypeBadge(tipo);
                                return (
                                  <span key={tipo} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${badge.bg}`}>
                                    {badge.label}: {count}
                                  </span>
                                );
                              })}
                              <span className="text-xs text-green-600 font-medium">{finalizados} finalizados</span>
                              {pendentes > 0 && <span className="text-xs text-amber-600 font-medium">{pendentes} pendentes</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleBaixarPDFEscola(escola)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#111c44] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Baixar PDF
                          </button>
                        </div>

                        {/* Tabela detalhada de envios da escola */}
                        <div className="bg-[#fafafa] rounded-lg border border-[#e5e5e5] overflow-hidden">
                          <div className="hidden md:grid grid-cols-[1fr_90px_100px_90px_90px_1fr_60px] gap-2 px-3 py-2 text-xs font-semibold text-[#999] uppercase tracking-wider border-b border-[#e5e5e5]">
                            <span>Solicitante</span>
                            <span>Tipo</span>
                            <span>Data do Envio</span>
                            <span>Status</span>
                            <span>Processamento</span>
                            <span>Itens Enviados</span>
                            <span className="text-right">Qtd</span>
                          </div>
                          {escola.solicitacoes.map((s) => {
                            const badge = getTypeBadge(s.tipo);
                            const statusColor = getStatusColor(s.status || "Pendente");
                            const totalItens = getTotalItens(s);
                            // Build items description
                            const itensDesc: string[] = [];
                            if (s.uniformesDetalhes?.length) s.uniformesDetalhes.forEach(u => itensDesc.push(`Uniforme ${u.tipo} ${u.genero} (${u.tamanho}) x${u.quantidade}`));
                            if (s.calcadosDetalhes?.length) s.calcadosDetalhes.forEach(c => itensDesc.push(`Calcado (${c.tamanho}) x${c.quantidade}`));
                            if (s.kitsAlunoDetalhes?.length) s.kitsAlunoDetalhes.forEach(k => itensDesc.push(`Kit ${k.tipo} x${k.quantidade}`));
                            if (s.polosProfDetalhes?.length) s.polosProfDetalhes.forEach(p => itensDesc.push(`Polo ${p.tamanho} x${p.quantidade}`));
                            if (s.mochilasDetalhes?.length) s.mochilasDetalhes.forEach(m => itensDesc.push(`Mochila ${m.tipo} x${m.quantidade}`));
                            if (s.itens?.length) s.itens.forEach(i => itensDesc.push(`${i.tipo} x${i.quantidade}`));
                            if (s.papelaria?.length) s.papelaria.forEach(p => itensDesc.push(`${p.tipo} x${p.quantidade}`));
                            if (s.cozinha?.length) s.cozinha.forEach(c => itensDesc.push(`${c.tipo} x${c.quantidade}`));
                            if (s.descricaoItem) itensDesc.push(`${s.descricaoItem} (Pat: ${s.numeroPatrimonio || "-"})`);

                            return (
                              <div key={s.id} className="grid grid-cols-1 md:grid-cols-[1fr_90px_100px_90px_90px_1fr_60px] gap-2 px-3 py-2.5 text-xs items-start border-b border-[#f0f0f0] last:border-b-0 hover:bg-white transition-colors">
                                <div>
                                  <span className="text-[#1a1a1a] font-medium">{s.nome}</span>
                                  <span className="text-[#999] ml-1">({s.matricula})</span>
                                </div>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-center font-medium ${badge.bg} whitespace-nowrap self-start`}>{badge.label}</span>
                                <span className="text-[#666]">{s.dataHora}</span>
                                <div className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
                                  <span className={`font-medium ${statusColor.text}`}>{s.status || "Pendente"}</span>
                                </div>
                                <div>
                                  {s.encaminhadoLogistica ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <Truck className="w-3 h-3" />
                                      {s.statusLogistica || "Enviada"}
                                    </span>
                                  ) : (
                                    <span className="text-[#ccc]">-</span>
                                  )}
                                </div>
                                <div className="text-[#555]">
                                  {itensDesc.length > 0 ? itensDesc.join(", ") : <span className="text-[#ccc]">Sem itens</span>}
                                </div>
                                <span className="text-[#111c44] font-bold text-right">{totalItens}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {inventarioPorEscola.length === 0 && (
                    <div className="px-6 py-12 text-center text-[#aaa]">
                      Nenhum registro encontrado para o periodo selecionado.
                    </div>
                  )}
                </div>
              </div>
              </>
              )}

              {relatorioAbaAtiva === "transferencias" && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 border-b border-[#e5e5e5] flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-[#1a1a1a]">
                          Relatorio de Transferencias ({solicitacoes.filter(s => s.tipo === "transferencia").length} registros)
                        </span>
                        <p className="text-xs text-[#8c8c8c] mt-0.5">Todas as transferencias de itens entre unidades</p>
                      </div>
                      <button
                        onClick={() => {
                          const transferencias = solicitacoes.filter(s => s.tipo === "transferencia");
                          const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
                          const pw = doc.internal.pageSize.getWidth();
                          doc.setFontSize(14);
                          doc.setFont("helvetica", "bold");
                          doc.text("RELATORIO DE TRANSFERENCIAS", pw / 2, 15, { align: "center" });
                          doc.setFontSize(9);
                          doc.setFont("helvetica", "normal");
                          doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")} | Total: ${transferencias.length} transferencias`, pw / 2, 22, { align: "center" });
                          let y = 35;
                          doc.setFontSize(8);
                          doc.setFillColor(240, 240, 240);
                          doc.rect(10, y - 4, pw - 20, 7, "F");
                          doc.setFont("helvetica", "bold");
                          doc.text("Data", 12, y);
                          doc.text("Origem", 40, y);
                          doc.text("Destino", 100, y);
                          doc.text("Responsavel Origem", 160, y);
                          doc.text("Situacao", 220, y);
                          doc.text("Condicao", 250, y);
                          y += 8;
                          doc.setFont("helvetica", "normal");
                          transferencias.forEach((t) => {
                            if (y > 190) { doc.addPage(); y = 20; }
                            doc.text(t.dataHora.split(",")[0] || "-", 12, y);
                            doc.text((t.unidadeOrigem || t.dados?.unidadeOrigem || t.instituicao || "-").substring(0, 35), 40, y);
                            doc.text((t.unidadeDestino || t.dados?.unidadeDestino || "-").substring(0, 35), 100, y);
                            doc.text((t.dados?.responsavelOrigem || t.nome || "-").substring(0, 30), 160, y);
                            doc.text(t.situacao || t.dados?.situacao || "-", 220, y);
                            doc.text(t.condicao || t.dados?.condicao || "-", 250, y);
                            y += 6;
                          });
                          doc.save("relatorio_transferencias.pdf");
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#111c44] hover:bg-[#0e1735] rounded-lg transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar PDF
                      </button>
                    </div>

                    {/* Tabela */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#f8fafc] border-b border-[#e5e5e5]">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Data</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Origem</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Destino</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Responsavel Origem</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Responsavel Destino</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Situacao</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Condicao</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Itens</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5e5]">
                          {solicitacoes.filter(s => s.tipo === "transferencia").map((t) => (
                            <tr key={t.id} className="hover:bg-[#fafafa]">
                              <td className="px-4 py-3 text-[#666]">{t.dataHora.split(",")[0]}</td>
                              <td className="px-4 py-3 font-medium text-[#1a1a1a]">{(t.unidadeOrigem || t.dados?.unidadeOrigem || t.instituicao || "-").substring(0, 30)}</td>
                              <td className="px-4 py-3 font-medium text-green-700">{(t.unidadeDestino || t.dados?.unidadeDestino || "-").substring(0, 30)}</td>
                              <td className="px-4 py-3 text-[#666]">{t.dados?.responsavelOrigem || t.nome || "-"}</td>
                              <td className="px-4 py-3 text-[#666]">{t.responsavelDestino || t.dados?.responsavelDestino || "-"}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-sky-100 text-sky-700">{t.situacao || t.dados?.situacao || "-"}</span></td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">{t.condicao || t.dados?.condicao || "-"}</span></td>
                              <td className="px-4 py-3 text-[#666]">{(t.itensTransferencia || t.dados?.itens || []).length}</td>
                              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${t.status === "Finalizado" ? "bg-green-100 text-green-700" : t.status === "Processamento" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{t.status || "Pendente"}</span></td>
                            </tr>
                          ))}
                          {solicitacoes.filter(s => s.tipo === "transferencia").length === 0 && (
                            <tr><td colSpan={9} className="px-6 py-12 text-center text-[#aaa]">Nenhuma transferencia registrada.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {relatorioAbaAtiva === "inventarios" && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
                      <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Total Inventarios</p>
                      <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{inventarios.length + inventariosSetor.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
                      <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Inventarios Gerais</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{inventarios.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
                      <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Inventarios por Setor</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">{inventariosSetor.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
                      <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Finalizados</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{inventarios.filter(i => i.status === "Finalizado").length + inventariosSetor.filter(i => i.status === "Finalizado").length}</p>
                    </div>
                  </div>

                  {/* Inventarios Gerais */}
                  <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 border-b border-[#e5e5e5] flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-[#1a1a1a]">Inventarios Gerais ({inventarios.length})</span>
                        <p className="text-xs text-[#8c8c8c] mt-0.5">Arrolamento de bens patrimoniais por escola</p>
                      </div>
                      <button
                        onClick={() => {
                          const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
                          const pw = doc.internal.pageSize.getWidth();
                          doc.setFontSize(14);
                          doc.setFont("helvetica", "bold");
                          doc.text("RELATORIO DE INVENTARIOS GERAIS", pw / 2, 15, { align: "center" });
                          doc.setFontSize(9);
                          doc.setFont("helvetica", "normal");
                          doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")} | Total: ${inventarios.length} inventarios`, pw / 2, 22, { align: "center" });
                          let y = 35;
                          doc.setFontSize(8);
                          doc.setFillColor(240, 240, 240);
                          doc.rect(10, y - 4, pw - 20, 7, "F");
                          doc.setFont("helvetica", "bold");
                          doc.text("Data", 12, y);
                          doc.text("Escola", 40, y);
                          doc.text("Solicitante", 120, y);
                          doc.text("Matricula", 180, y);
                          doc.text("Ano", 210, y);
                          doc.text("Itens", 235, y);
                          doc.text("Status", 260, y);
                          y += 8;
                          doc.setFont("helvetica", "normal");
                          inventarios.forEach((inv) => {
                            if (y > 190) { doc.addPage(); y = 20; }
                            doc.text(inv.dataHora.split(",")[0] || "-", 12, y);
                            doc.text((inv.escola || "-").substring(0, 45), 40, y);
                            doc.text((inv.solicitante || "-").substring(0, 30), 120, y);
                            doc.text(inv.matricula || "-", 180, y);
                            doc.text(inv.ano || "-", 210, y);
                            doc.text(String(inv.itens?.length || 0), 235, y);
                            doc.text(inv.status || "Pendente", 260, y);
                            y += 6;
                          });
                          doc.save("relatorio_inventarios_gerais.pdf");
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#111c44] hover:bg-[#0e1735] rounded-lg transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar PDF
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#f8fafc] border-b border-[#e5e5e5]">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Data</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Escola</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Solicitante</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Matricula</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Ano</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Itens</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5e5]">
                          {inventarios.map((inv) => (
                            <tr key={inv.id} className="hover:bg-[#fafafa]">
                              <td className="px-4 py-3 text-[#666]">{inv.dataHora.split(",")[0]}</td>
                              <td className="px-4 py-3 font-medium text-[#1a1a1a]">{inv.escola}</td>
                              <td className="px-4 py-3 text-[#666]">{inv.solicitante}</td>
                              <td className="px-4 py-3 text-[#666]">{inv.matricula}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">{inv.ano}</span></td>
                              <td className="px-4 py-3 text-[#666]">{inv.itens?.length || 0}</td>
                              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${inv.status === "Finalizado" ? "bg-green-100 text-green-700" : inv.status === "Em Analise" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{inv.status}</span></td>
                            </tr>
                          ))}
                          {inventarios.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-[#aaa]">Nenhum inventario geral registrado.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Inventarios por Setor */}
                  <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 border-b border-[#e5e5e5] flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-[#1a1a1a]">Inventarios por Setor ({inventariosSetor.length})</span>
                        <p className="text-xs text-[#8c8c8c] mt-0.5">Inventarios enviados por setor/sala</p>
                      </div>
                      <button
                        onClick={() => {
                          const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
                          const pw = doc.internal.pageSize.getWidth();
                          doc.setFontSize(14);
                          doc.setFont("helvetica", "bold");
                          doc.text("RELATORIO DE INVENTARIOS POR SETOR", pw / 2, 15, { align: "center" });
                          doc.setFontSize(9);
                          doc.setFont("helvetica", "normal");
                          doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")} | Total: ${inventariosSetor.length} inventarios`, pw / 2, 22, { align: "center" });
                          let y = 35;
                          doc.setFontSize(8);
                          doc.setFillColor(240, 240, 240);
                          doc.rect(10, y - 4, pw - 20, 7, "F");
                          doc.setFont("helvetica", "bold");
                          doc.text("Data", 12, y);
                          doc.text("Instituicao", 40, y);
                          doc.text("Sala Responsavel", 110, y);
                          doc.text("Responsavel", 170, y);
                          doc.text("Itens", 230, y);
                          doc.text("Status", 255, y);
                          y += 8;
                          doc.setFont("helvetica", "normal");
                          inventariosSetor.forEach((inv) => {
                            if (y > 190) { doc.addPage(); y = 20; }
                            doc.text(inv.dataHora.split(",")[0] || "-", 12, y);
                            doc.text((inv.denominacao || "-").substring(0, 40), 40, y);
                            doc.text((inv.salaResponsavel || "-").substring(0, 30), 110, y);
                            doc.text((inv.respNome || "-").substring(0, 30), 170, y);
                            doc.text(String(inv.itens?.length || 0), 230, y);
                            doc.text(inv.status || "Pendente", 255, y);
                            y += 6;
                          });
                          doc.save("relatorio_inventarios_setor.pdf");
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#111c44] hover:bg-[#0e1735] rounded-lg transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar PDF
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#f8fafc] border-b border-[#e5e5e5]">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Data</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Instituicao</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Sala Responsavel</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Responsavel</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Agente Patrimonial</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Itens</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#475569]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5e5]">
                          {inventariosSetor.map((inv) => (
                            <tr key={inv.id} className="hover:bg-[#fafafa]">
                              <td className="px-4 py-3 text-[#666]">{inv.dataHora.split(",")[0]}</td>
                              <td className="px-4 py-3 font-medium text-[#1a1a1a]">{inv.denominacao}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">{inv.salaResponsavel || "-"}</span></td>
                              <td className="px-4 py-3 text-[#666]">{inv.respNome}</td>
                              <td className="px-4 py-3 text-[#666]">{inv.agenteNome}</td>
                              <td className="px-4 py-3 text-[#666]">{inv.itens?.length || 0}</td>
                              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${inv.status === "Finalizado" ? "bg-green-100 text-green-700" : inv.status === "Em Analise" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{inv.status}</span></td>
                            </tr>
                          ))}
                          {inventariosSetor.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-[#aaa]">Nenhum inventario por setor registrado.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
) : activeSidebar === "dashboard" ? (
  <AdminDashboard solicitacoes={solicitacoes} />
) : activeSidebar === "arrolamento" ? (
  /* ARROLAMENTO VIEW */
  <ArrolamentoView />
) : activeSidebar === "edicoes" ? (
  /* EDICOES VIEW */
  <EdicoesView />
) : activeSidebar === "usuarios" ? (
            /* GESTAO DE USUARIOS */
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#1a1a1a]">Gestao de Usuarios</h2>
                  <p className="text-xs text-[#8c8c8c]">Gerencie usuarios, setores e permissoes do sistema</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-[#666]">
                    <input type="checkbox" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)} className="rounded border-[#ccc]" />
                    Mostrar inativos
                  </label>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-lg p-1">
                <button onClick={() => setUsuariosAbaAtiva("usuarios")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${usuariosAbaAtiva === "usuarios" ? "bg-white text-[#111c44] shadow-sm" : "text-[#666] hover:bg-white/50"}`}>
                  <Users className="w-4 h-4" /> Usuarios {usuariosPendentes.length > 0 && <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{usuariosPendentes.length}</span>}
                </button>
                <button onClick={() => setUsuariosAbaAtiva("setores")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${usuariosAbaAtiva === "setores" ? "bg-white text-[#111c44] shadow-sm" : "text-[#666] hover:bg-white/50"}`}>
                  <Building className="w-4 h-4" /> Setores
                </button>
                <button onClick={() => setUsuariosAbaAtiva("aprovacoes")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${usuariosAbaAtiva === "aprovacoes" ? "bg-white text-[#111c44] shadow-sm" : "text-[#666] hover:bg-white/50"}`}>
                  <Shield className="w-4 h-4" /> Aprovacoes Pendentes {usuariosPendentes.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{usuariosPendentes.length}</span>}
                </button>
              </div>

              {/* Aba Usuarios */}
              {usuariosAbaAtiva === "usuarios" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1a1a1a]">{usuariosFiltrados.length} usuarios cadastrados</span>
                    <Button onClick={() => setShowNovoUsuario(true)} className="bg-[#111c44] hover:bg-[#0e1735] text-white text-sm">
                      <UserPlus className="w-4 h-4 mr-2" /> Novo Usuario
                    </Button>
                  </div>

                  {/* Form novo usuario */}
                  {showNovoUsuario && (
                    <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#1a1a1a]">Cadastrar Novo Usuario</h3>
                        <button onClick={() => setShowNovoUsuario(false)} className="text-[#999] hover:text-[#666]"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Nome Completo *</label>
                          <Input value={novoUsuario.nome} onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} placeholder="Nome do usuario" className="h-9 text-sm border-[#e5e5e5]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Login *</label>
                          <Input value={novoUsuario.login} onChange={(e) => setNovoUsuario({ ...novoUsuario, login: e.target.value })} placeholder="Login de acesso" className="h-9 text-sm border-[#e5e5e5]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Senha *</label>
                          <Input type="password" value={novoUsuario.senha} onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })} placeholder="Senha" className="h-9 text-sm border-[#e5e5e5]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Matricula</label>
                          <Input value={novoUsuario.matricula} onChange={(e) => setNovoUsuario({ ...novoUsuario, matricula: e.target.value })} placeholder="Matricula funcional" className="h-9 text-sm border-[#e5e5e5]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Email</label>
                          <Input type="email" value={novoUsuario.email} onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })} placeholder="Email" className="h-9 text-sm border-[#e5e5e5]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Cargo</label>
                          <Input value={novoUsuario.cargo} onChange={(e) => setNovoUsuario({ ...novoUsuario, cargo: e.target.value })} placeholder="Cargo" className="h-9 text-sm border-[#e5e5e5]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Setor</label>
                          <Select value={novoUsuario.setor} onValueChange={(v) => setNovoUsuario({ ...novoUsuario, setor: v })}>
                            <SelectTrigger className="h-9 text-sm border-[#e5e5e5]"><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                            <SelectContent>
                              {setores.filter(s => s.ativo).map((s) => <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Nivel de Acesso *</label>
                          <Select value={novoUsuario.nivel} onValueChange={(v) => setNovoUsuario({ ...novoUsuario, nivel: v as Usuario["nivel"] })}>
                            <SelectTrigger className="h-9 text-sm border-[#e5e5e5]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(NIVEIS_ACESSO).map(([key, val]) => <SelectItem key={key} value={key}>{val.label} - {val.descricao}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e5e5]">
                        <Button variant="outline" onClick={() => setShowNovoUsuario(false)} className="border-[#e5e5e5] text-[#666]">Cancelar</Button>
                        <Button onClick={handleAddUsuario} className="bg-[#111c44] hover:bg-[#0e1735] text-white">Cadastrar Usuario</Button>
                      </div>
                    </div>
                  )}

                  {/* Lista de usuarios */}
                  <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                    <div className="hidden md:grid grid-cols-[1fr_120px_150px_100px_100px_120px] gap-3 px-5 py-2 text-xs font-semibold text-[#999] uppercase tracking-wider border-b border-[#e5e5e5]">
                      <span>Usuario</span>
                      <span>Login</span>
                      <span>Setor</span>
                      <span>Nivel</span>
                      <span>Status</span>
                      <span className="text-right">Acoes</span>
                    </div>
                    {usuariosFiltrados.map((u) => (
                      <div key={u.id} className={`grid grid-cols-1 md:grid-cols-[1fr_120px_150px_100px_100px_120px] gap-3 px-5 py-3 items-center border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${!u.ativo ? "opacity-50" : ""}`}>
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a]">{u.nome}</p>
                          <p className="text-xs text-[#666]">{u.email || u.matricula || "-"}</p>
                        </div>
                        <span className="text-sm text-[#555]">{u.login}</span>
                        <span className="text-xs text-[#666]">{u.setor || "-"}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${u.nivel === "gestor" ? "bg-purple-100 text-purple-700" : u.nivel === "admin_patrimonio" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                          <Key className="w-3 h-3" /> {NIVEIS_ACESSO[u.nivel]?.label || u.nivel}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${u.statusAprovacao === "aprovado" ? "bg-green-100 text-green-700" : u.statusAprovacao === "pendente" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {u.statusAprovacao === "aprovado" ? "Aprovado" : u.statusAprovacao === "pendente" ? "Pendente" : "Rejeitado"}
                        </span>
                        <div className="flex items-center justify-end gap-1">
                          {u.login !== "Gestor" && (
                            <>
                              {u.ativo ? (
                                <button onClick={() => handleDesativarUsuario(u.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Desativar">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button onClick={() => handleReativarUsuario(u.id)} className="p-1.5 rounded hover:bg-green-50 text-green-500" title="Reativar">
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {usuariosFiltrados.length === 0 && <div className="px-5 py-8 text-center text-[#aaa] text-sm">Nenhum usuario encontrado.</div>}
                  </div>
                </div>
              )}

              {/* Aba Setores */}
              {usuariosAbaAtiva === "setores" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1a1a1a]">{setoresFiltrados.length} setores cadastrados</span>
                    <Button onClick={() => setShowNovoSetor(true)} className="bg-[#111c44] hover:bg-[#0e1735] text-white text-sm">
                      <Building className="w-4 h-4 mr-2" /> Novo Setor
                    </Button>
                  </div>

                  {/* Form novo setor */}
                  {showNovoSetor && (
                    <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#1a1a1a]">Cadastrar Novo Setor</h3>
                        <button onClick={() => setShowNovoSetor(false)} className="text-[#999] hover:text-[#666]"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Nome do Setor *</label>
                          <Input value={novoSetor.nome} onChange={(e) => setNovoSetor({ ...novoSetor, nome: e.target.value })} placeholder="Ex: E.M. Exemplo" className="h-9 text-sm border-[#e5e5e5]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Tipo *</label>
                          <Select value={novoSetor.tipo} onValueChange={(v) => setNovoSetor({ ...novoSetor, tipo: v as Setor["tipo"] })}>
                            <SelectTrigger className="h-9 text-sm border-[#e5e5e5]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="secretaria">Secretaria</SelectItem>
                              <SelectItem value="escola">Escola</SelectItem>
                              <SelectItem value="unidade">Unidade</SelectItem>
                              <SelectItem value="departamento">Departamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e5e5]">
                        <Button variant="outline" onClick={() => setShowNovoSetor(false)} className="border-[#e5e5e5] text-[#666]">Cancelar</Button>
                        <Button onClick={handleAddSetor} className="bg-[#111c44] hover:bg-[#0e1735] text-white">Cadastrar Setor</Button>
                      </div>
                    </div>
                  )}

                  {/* Lista de setores */}
                  <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                    <div className="hidden md:grid grid-cols-[1fr_150px_150px_100px] gap-3 px-5 py-2 text-xs font-semibold text-[#999] uppercase tracking-wider border-b border-[#e5e5e5]">
                      <span>Nome do Setor</span>
                      <span>Tipo</span>
                      <span>Criado Em</span>
                      <span className="text-right">Acoes</span>
                    </div>
                    {setoresFiltrados.map((s) => (
                      <div key={s.id} className={`grid grid-cols-1 md:grid-cols-[1fr_150px_150px_100px] gap-3 px-5 py-3 items-center border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${!s.ativo ? "opacity-50" : ""}`}>
                        <span className="text-sm font-medium text-[#1a1a1a]">{s.nome}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.tipo === "secretaria" ? "bg-purple-100 text-purple-700" : s.tipo === "escola" ? "bg-blue-100 text-blue-700" : s.tipo === "unidade" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-700"}`}>
                          {s.tipo === "secretaria" ? "Secretaria" : s.tipo === "escola" ? "Escola" : s.tipo === "unidade" ? "Unidade" : "Departamento"}
                        </span>
                        <span className="text-xs text-[#666]">{new Date(s.criadoEm).toLocaleDateString("pt-BR")}</span>
                        <div className="flex items-center justify-end gap-1">
                          {s.ativo && (
                            <button onClick={() => handleDesativarSetor(s.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Desativar">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {setoresFiltrados.length === 0 && <div className="px-5 py-8 text-center text-[#aaa] text-sm">Nenhum setor encontrado.</div>}
                  </div>
                </div>
              )}

              {/* Aba Aprovacoes */}
              {usuariosAbaAtiva === "aprovacoes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1a1a1a]">{usuariosPendentes.length} aprovacoes pendentes</span>
                  </div>

                  {usuariosPendentes.length > 0 ? (
                    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
                      <div className="hidden md:grid grid-cols-[1fr_120px_150px_100px_150px] gap-3 px-5 py-2 text-xs font-semibold text-[#999] uppercase tracking-wider border-b border-[#e5e5e5]">
                        <span>Usuario</span>
                        <span>Login</span>
                        <span>Setor</span>
                        <span>Nivel</span>
                        <span className="text-right">Acoes</span>
                      </div>
                      {usuariosPendentes.map((u) => (
                        <div key={u.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_150px_100px_150px] gap-3 px-5 py-3 items-center border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                          <div>
                            <p className="text-sm font-medium text-[#1a1a1a]">{u.nome}</p>
                            <p className="text-xs text-[#666]">{u.email || u.matricula || "-"}</p>
                          </div>
                          <span className="text-sm text-[#555]">{u.login}</span>
                          <span className="text-xs text-[#666]">{u.setor || "-"}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {NIVEIS_ACESSO[u.nivel]?.label || u.nivel}
                          </span>
                          <div className="flex items-center justify-end gap-2">
                            <Button onClick={() => handleAprovarUsuario(u.id)} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                              <Check className="w-3 h-3 mr-1" /> Aprovar
                            </Button>
                            <Button onClick={() => handleRejeitarUsuario(u.id)} size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8">
                              <XCircle className="w-3 h-3 mr-1" /> Rejeitar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-[#e5e5e5] p-8 text-center shadow-sm">
                      <Shield className="w-12 h-12 text-[#ccc] mx-auto mb-3" />
                      <p className="text-sm text-[#666]">Nenhuma aprovacao pendente no momento.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
          <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
            {/* Filters */}
            <div className="px-5 py-3.5 border-b border-[#e5e5e5] flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm font-semibold text-[#1a1a1a]">
                Solicitacoes Recebidas ({solicitacoesFiltradas.length})
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                
                <Select value={instituicaoFiltro} onValueChange={setInstituicaoFiltro}>
                  <SelectTrigger className="w-48 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {instituicoes.map((inst) => (
                      <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={anoFiltro} onValueChange={setAnoFiltro}>
                  <SelectTrigger className="w-36 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger className="w-40 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos os Status">Todos os Status</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Processamento">Processamento</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={responsavelFiltro} onValueChange={setResponsavelFiltro}>
                  <SelectTrigger className="w-36 h-8 text-xs border-[#e5e5e5] bg-white text-[#5a5a5a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os Membros</SelectItem>
                    {MEMBROS_EQUIPE.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs font-medium text-[#5a5a5a] border border-[#e5e5e5] rounded-lg hover:bg-[#f9f9f9] transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[85px_90px_1fr_80px_1fr_60px_110px_105px_90px] gap-2 px-5 py-2.5 bg-[#fafafa] border-b border-[#e5e5e5] text-xs font-semibold text-[#999] uppercase tracking-wider">
              <span>Tipo</span>
              <span>Status</span>
              <span>Nome</span>
              <span>Matricula</span>
              <span>Instituicao</span>
              <span className="text-right">Itens</span>
              <span className="text-center">Status</span>
              <span className="text-center">Responsavel</span>
              <span className="text-center">Acoes</span>
            </div>

            {/* Table Rows */}
            <div>
              {solicitacoesFiltradas.map((solicitacao) => {
                const badge = getTypeBadge(solicitacao.tipo);
                const totalItens = getTotalItens(solicitacao);
                const currentStatus = solicitacao.status || "Pendente";
                const statusColor = getStatusColor(currentStatus);
                const isTransferencia = solicitacao.tipo === "transferencia";
                return (
                  <div
                    key={solicitacao.id}
                    className={`hover:bg-[#fafafa] transition-colors border-b border-[#f0f0f0] ${isTransferencia ? "py-2" : ""}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[85px_90px_1fr_80px_1fr_60px_110px_105px_90px] gap-2 px-5 py-3 items-center">
                    {/* Tipo */}
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badge.bg} text-center whitespace-nowrap`}>
                      {badge.label}
                    </span>

                    {/* Status text */}
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor.dot}`} />
                      <span className={`text-xs font-medium ${statusColor.text}`}>
                        {currentStatus}
                      </span>
                    </div>

                    {/* Nome */}
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{solicitacao.nome}</p>

                    {/* Matricula */}
                    <span className="text-xs text-[#666]">{solicitacao.matricula}</span>

                    {/* Instituicao */}
                    <span className="text-xs text-[#666] truncate">{solicitacao.instituicao}</span>

                    {/* Itens count */}
                    <span className="text-sm font-medium text-[#111c44] text-right">
                      {totalItens > 0 ? totalItens : "0"}
                    </span>

                    {/* Status dropdown */}
                    <div className="flex justify-center">
                      <Select
                        value={currentStatus}
                        onValueChange={(val) => handleChangeStatus(solicitacao.id, val)}
                      >
                        <SelectTrigger className="w-[105px] h-8 text-xs border-[#e5e5e5] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Processamento">Processamento</SelectItem>
                          <SelectItem value="Finalizado">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Responsavel */}
                    <div className="flex justify-center">
                      <Select
                        value={solicitacao.responsavel || "Nenhum"}
                        onValueChange={(val) => handleChangeResponsavel(solicitacao.id, val === "Nenhum" ? "" : val)}
                      >
                        <SelectTrigger className={`w-[100px] h-8 text-xs border-[#e5e5e5] bg-white ${solicitacao.responsavel ? "text-[#111c44] font-semibold" : "text-[#aaa]"}`}>
                          <SelectValue placeholder="Nenhum" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nenhum">Nenhum</SelectItem>
                          {MEMBROS_EQUIPE.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => { setEditingSolicitacao(JSON.parse(JSON.stringify(solicitacao))); setEditDialogOpen(true); }}
                        className="p-1.5 text-[#aaa] hover:text-[#111c44] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver / Editar Solicitacao"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBaixarPDF(solicitacao)}
                        className="p-1.5 text-[#aaa] hover:text-[#111c44] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Baixar PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSolicitacao(solicitacao.id)}
                        className="p-1.5 text-[#aaa] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    </div>

                    {/* Detalhes extras para transferencias */}
                    {isTransferencia && (
                      <div className="px-5 pb-3 pt-1">
                        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-sky-700 font-semibold">Origem:</span>
                            <span className="text-[#1a1a1a]">{solicitacao.unidadeOrigem || solicitacao.dados?.unidadeOrigem || solicitacao.instituicao || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-700 font-semibold">Destino:</span>
                            <span className="text-[#1a1a1a]">{solicitacao.unidadeDestino || solicitacao.dados?.unidadeDestino || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#666] font-semibold">Responsavel Destino:</span>
                            <span className="text-[#1a1a1a]">{solicitacao.responsavelDestino || solicitacao.dados?.responsavelDestino || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#666] font-semibold">Data:</span>
                            <span className="text-[#1a1a1a]">{solicitacao.dados?.data || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#666] font-semibold">TMBP/PMS:</span>
                            <span className="text-[#1a1a1a]">{solicitacao.tmbpPms || solicitacao.dados?.tmbpPms || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#666] font-semibold">Situacao:</span>
                            <span className="text-[#1a1a1a]">{solicitacao.situacao || solicitacao.dados?.situacao || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#666] font-semibold">Condicao:</span>
                            <span className="text-[#1a1a1a]">{solicitacao.condicao || solicitacao.dados?.condicao || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#666] font-semibold">Itens:</span>
                            <span className="text-[#1a1a1a]">{(solicitacao.itensTransferencia || solicitacao.dados?.itens || []).length} patrimonio(s)</span>
                          </div>
                          {(solicitacao.arquivoLaudo || solicitacao.dados?.arquivoLaudo) && (
                            <div className="flex items-center gap-2 col-span-2 md:col-span-4 mt-1">
                              <span className="text-green-700 font-semibold">Laudo Anexado:</span>
                              <span className="text-green-700 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {solicitacao.arquivoLaudo || solicitacao.dados?.arquivoLaudo}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {solicitacoesFiltradas.length === 0 && (
                <div className="px-6 py-12 text-center text-[#aaa]">
                  Nenhuma solicitacao encontrada.
                </div>
              )}
            </div>
          </div>
          )}
        </main>
      </div>

      {/* Chat Panel */}
      {showChatPanel && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
          <div className="w-[440px] bg-white h-full flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#111c44]">
              <h3 className="text-white font-semibold">Mensagens das Escolas</h3>
              <button onClick={() => setShowChatPanel(false)} className="p-1 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Conversation list */}
              <div className="w-2/5 border-r border-[#e5e5e5] overflow-y-auto bg-[#fafafa]">
                {conversas.map((conversa) => (
                  <button
                    key={conversa.instituicao}
                    onClick={() => setConversaSelecionada(conversa.instituicao)}
                    className={`w-full p-3 text-left border-b border-[#e5e5e5] transition-colors ${
                      conversaSelecionada === conversa.instituicao ? "bg-[#111c44]/10" : "hover:bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#111c44] flex items-center justify-center text-white text-xs font-semibold mb-1">
                      {conversa.instituicao.charAt(0)}
                    </div>
                    <p className="text-xs font-medium text-[#1a1a1a] truncate">{conversa.instituicao}</p>
                    {conversa.naoLidas > 0 && (
                      <span className="text-xs text-[#111c44] font-semibold">{conversa.naoLidas} novas</span>
                    )}
                  </button>
                ))}
                {conversas.length === 0 && (
                  <p className="p-4 text-[#aaa] text-xs text-center">Nenhuma conversa</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 flex flex-col">
                {conversaSelecionada ? (
                  <>
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fafafa]">
                      {mensagensConversa.map((msg) => (
                        <div
                          key={msg.id}
                          className={`max-w-[85%] p-3 rounded-xl text-sm ${
                            msg.remetente === "patrimonio"
                              ? "bg-[#111c44] text-white ml-auto rounded-br-sm"
                              : "bg-white border border-[#e5e5e5] text-[#1a1a1a] rounded-bl-sm"
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {msg.remetente === "escola" ? msg.nomeRemetente : "Equipe Patrimonio"}
                          </p>
                          <p>{msg.mensagem}</p>
                          <p className="text-xs mt-1 opacity-50">{msg.dataHora}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-[#e5e5e5] bg-white">
                      <div className="flex gap-2">
                        <Textarea
                          value={novaMensagem}
                          onChange={(e) => setNovaMensagem(e.target.value)}
                          placeholder="Digite sua resposta..."
                          className="flex-1 min-h-[50px] text-sm resize-none border-[#e5e5e5]"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarResposta(); } }}
                        />
                        <Button onClick={enviarResposta} size="icon" className="bg-[#111c44] hover:bg-[#0e1735] text-white shrink-0">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#aaa] text-sm">
                    Selecione uma conversa
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-[#e5e5e5]">
          <DialogHeader>
            <DialogTitle className="text-[#1a1a1a] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#111c44]" />
              Detalhes da Solicitacao
            </DialogTitle>
          </DialogHeader>
          {selectedSolicitacao && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-[#fafafa] p-4 rounded-lg border border-[#e5e5e5]">
                <div>
                  <p className="text-xs text-[#999] font-medium">Data/Hora</p>
                  <p className="text-sm text-[#1a1a1a]">{selectedSolicitacao.dataHora}</p>
                </div>
                <div>
                  <p className="text-xs text-[#999] font-medium">Tipo</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(selectedSolicitacao.tipo).bg}`}>
                    {getTypeBadge(selectedSolicitacao.tipo).label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#999] font-medium">Nome</p>
                  <p className="text-sm text-[#1a1a1a]">{selectedSolicitacao.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-[#999] font-medium">Matricula</p>
                  <p className="text-sm text-[#1a1a1a]">{selectedSolicitacao.matricula}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#999] font-medium">Instituicao</p>
                  <p className="text-sm text-[#1a1a1a]">{selectedSolicitacao.instituicao}</p>
                </div>
              </div>

              {selectedSolicitacao.tipo === "kits-uniformes" && (
                <>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <p className="text-xs text-emerald-600 font-medium">Uniformes</p>
                      <p className="text-lg font-bold text-[#1a1a1a]">{selectedSolicitacao.uniformes || 0}</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 font-medium">Calcados</p>
                      <p className="text-lg font-bold text-[#1a1a1a]">{selectedSolicitacao.calcados || 0}</p>
                    </div>
                    <div className="bg-sky-50 p-2 rounded-lg border border-sky-200">
                      <p className="text-xs text-sky-600 font-medium">Kits</p>
                      <p className="text-lg font-bold text-[#1a1a1a]">{selectedSolicitacao.kitsAluno || 0}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                      <p className="text-xs text-indigo-600 font-medium">Polos</p>
                      <p className="text-lg font-bold text-[#1a1a1a]">{selectedSolicitacao.polosProf || 0}</p>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <p className="text-xs text-rose-600 font-medium">Mochilas</p>
                      <p className="text-lg font-bold text-[#1a1a1a]">{selectedSolicitacao.mochilas || 0}</p>
                    </div>
                  </div>

                  {selectedSolicitacao.uniformesDetalhes && selectedSolicitacao.uniformesDetalhes.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-emerald-500 text-white px-4 py-2 text-sm font-semibold">Uniformes Solicitados</div>
                      <div className="p-3 space-y-2">
                        {selectedSolicitacao.uniformesDetalhes.map((item, idx) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-emerald-700">Tipo:</strong> {item.tipo}</span>
                            <span><strong className="text-emerald-700">Genero:</strong> {item.genero}</span>
                            <span><strong className="text-emerald-700">Tamanho:</strong> {item.tamanho}</span>
                            <span><strong className="text-emerald-700">Qtd:</strong> {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSolicitacao.calcadosDetalhes && selectedSolicitacao.calcadosDetalhes.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-amber-500 text-white px-4 py-2 text-sm font-semibold">Calcados Solicitados</div>
                      <div className="p-3 space-y-2">
                        {selectedSolicitacao.calcadosDetalhes.map((item, idx) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-amber-700">Tamanho:</strong> {item.tamanho}</span>
                            <span><strong className="text-amber-700">Qtd:</strong> {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSolicitacao.kitsAlunoDetalhes && selectedSolicitacao.kitsAlunoDetalhes.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-sky-500 text-white px-4 py-2 text-sm font-semibold">Kits de Aluno</div>
                      <div className="p-3 space-y-2">
                        {selectedSolicitacao.kitsAlunoDetalhes.map((item, idx) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-sky-700">Tipo:</strong> {item.tipo}</span>
                            <span><strong className="text-sky-700">Qtd:</strong> {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSolicitacao.polosProfDetalhes && selectedSolicitacao.polosProfDetalhes.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-indigo-500 text-white px-4 py-2 text-sm font-semibold">Kit Professor - Polo</div>
                      <div className="p-3 space-y-2">
                        {selectedSolicitacao.polosProfDetalhes.map((item, idx) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-indigo-700">Tipo:</strong> {item.tipo}</span>
                            <span><strong className="text-indigo-700">Tamanho:</strong> {item.tamanho}</span>
                            <span><strong className="text-indigo-700">Qtd:</strong> {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSolicitacao.mochilasDetalhes && selectedSolicitacao.mochilasDetalhes.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-rose-500 text-white px-4 py-2 text-sm font-semibold">Mochilas</div>
                      <div className="p-3 space-y-2">
                        {selectedSolicitacao.mochilasDetalhes.map((item, idx) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-rose-700">Tipo:</strong> {item.tipo}</span>
                            <span><strong className="text-rose-700">Qtd:</strong> {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {(selectedSolicitacao.tipo === "almoxarifado") && (
                <>
                  {selectedSolicitacao.papelaria && selectedSolicitacao.papelaria.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-amber-500 text-white px-4 py-2 text-sm font-semibold">Itens de Papelaria</div>
                      <div className="p-3 space-y-2">
                        {selectedSolicitacao.papelaria.map((item, idx) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-amber-700">Item:</strong> {item.tipo}</span>
                            <span><strong className="text-amber-700">Qtd:</strong> {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedSolicitacao.cozinha && selectedSolicitacao.cozinha.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-teal-500 text-white px-4 py-2 text-sm font-semibold">Itens de Cozinha</div>
                      <div className="p-3 space-y-2">
                        {selectedSolicitacao.cozinha.map((item, idx) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-teal-700">Item:</strong> {item.tipo}</span>
                            <span><strong className="text-teal-700">Qtd:</strong> {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedSolicitacao.dados?.creche && selectedSolicitacao.dados.creche.length > 0 && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-pink-500 text-white px-4 py-2 text-sm font-semibold">Itens de Creche</div>
                      <div className="p-3 space-y-2">
                        {selectedSolicitacao.dados.creche.map((item: { tipo: string; quantidade: number }, idx: number) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-pink-700">Item:</strong> {item.tipo}</span>
                            <span><strong className="text-pink-700">Qtd:</strong> {item.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedSolicitacao.tipo === "patrimonio" && selectedSolicitacao.itens && selectedSolicitacao.itens.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-rose-500 text-white px-4 py-2 text-sm font-semibold">Itens de Patrimonio</div>
                  <div className="p-3 space-y-2">
                    {selectedSolicitacao.itens.map((item, idx) => (
                      <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                        <span><strong className="text-rose-700">Item:</strong> {item.tipo}</span>
                        <span><strong className="text-rose-700">Qtd:</strong> {item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSolicitacao.tipo === "transferencia" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#fafafa] p-4 rounded-lg border border-[#e5e5e5]">
                      <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-sky-500" /> Unidade de Origem
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-[#999] font-medium">Unidade</p>
                          <p className="text-[#1a1a1a]">{selectedSolicitacao.unidadeOrigem || selectedSolicitacao.dados?.unidadeOrigem || selectedSolicitacao.instituicao || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#999] font-medium">Responsavel</p>
                          <p className="text-[#1a1a1a]">{selectedSolicitacao.dados?.responsavelOrigem || selectedSolicitacao.nome || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#999] font-medium">Matricula</p>
                          <p className="text-[#1a1a1a]">{selectedSolicitacao.dados?.matriculaOrigem || selectedSolicitacao.matricula || "-"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#fafafa] p-4 rounded-lg border border-[#e5e5e5]">
                      <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-green-500" /> Unidade de Destino
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-[#999] font-medium">Unidade</p>
                          <p className="text-[#1a1a1a]">{selectedSolicitacao.unidadeDestino || selectedSolicitacao.dados?.unidadeDestino || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#999] font-medium">Responsavel</p>
                          <p className="text-[#1a1a1a]">{selectedSolicitacao.responsavelDestino || selectedSolicitacao.dados?.responsavelDestino || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#999] font-medium">Matricula</p>
                          <p className="text-[#1a1a1a]">{selectedSolicitacao.matriculaDestino || selectedSolicitacao.dados?.matriculaDestino || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#fafafa] p-4 rounded-lg border border-[#e5e5e5]">
                    <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3">Detalhes da Transferencia</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-[#999] font-medium">TMBP/PMS</p>
                        <p className="text-[#1a1a1a]">{selectedSolicitacao.tmbpPms || selectedSolicitacao.dados?.tmbpPms || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#999] font-medium">Data</p>
                        <p className="text-[#1a1a1a]">{selectedSolicitacao.dados?.data || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#999] font-medium">Situacao do Item</p>
                        <p className="text-[#1a1a1a]">{selectedSolicitacao.situacao || selectedSolicitacao.dados?.situacao || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#999] font-medium">Condicao</p>
                        <p className="text-[#1a1a1a]">{selectedSolicitacao.condicao || selectedSolicitacao.dados?.condicao || "-"}</p>
                      </div>
                    </div>
                  </div>
                  {(selectedSolicitacao.itensTransferencia?.length > 0 || selectedSolicitacao.dados?.itens?.length > 0) && (
                    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                      <div className="bg-sky-500 text-white px-4 py-2 text-sm font-semibold">Itens Transferidos</div>
                      <div className="p-3 space-y-2">
                        {(selectedSolicitacao.itensTransferencia || selectedSolicitacao.dados?.itens || []).map((item: { id?: number; numeroPatrimonio?: string; descricaoItem?: string }, idx: number) => (
                          <div key={idx} className="bg-[#fafafa] p-2.5 rounded-lg text-xs flex gap-4 border border-[#e5e5e5]">
                            <span><strong className="text-sky-700">N Patrimonio:</strong> {item.numeroPatrimonio || "-"}</span>
                            <span><strong className="text-sky-700">Descricao:</strong> {item.descricaoItem || "-"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selectedSolicitacao.arquivoLaudo || selectedSolicitacao.dados?.arquivoLaudo) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-semibold mb-0.5">Laudo da Protomar Anexado</p>
                          <p className="text-sm text-green-800 font-medium">{selectedSolicitacao.arquivoLaudo || selectedSolicitacao.dados?.arquivoLaudo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar Solicitacao */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white border-[#e5e5e5] p-6">
          <DialogHeader>
            <DialogTitle className="text-[#1a1a1a] flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-[#111c44]" />
              Ver / Editar Solicitacao
            </DialogTitle>
          </DialogHeader>
          {editingSolicitacao && (
            <div className="space-y-6 mt-4">
              {/* Info do solicitante */}
              <div className="bg-[#fafafa] p-4 rounded-lg border border-[#e5e5e5] text-sm text-[#666]">
                <span className="font-semibold text-[#1a1a1a]">{editingSolicitacao.nome}</span> - {editingSolicitacao.instituicao} - Mat: {editingSolicitacao.matricula}
                <span className={`ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(editingSolicitacao.tipo).bg}`}>{getTypeBadge(editingSolicitacao.tipo).label}</span>
              </div>

              {/* Uniformes */}
              {editingSolicitacao.uniformesDetalhes && editingSolicitacao.uniformesDetalhes.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-emerald-500 text-white px-4 py-2 text-sm font-semibold">Uniformes</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.uniformesDetalhes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">{item.tipo} | {item.genero} | Tam: {item.tamanho}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.uniformesDetalhes = [...(copy.uniformesDetalhes || [])];
                              copy.uniformesDetalhes[idx] = { ...copy.uniformesDetalhes[idx], quantidade: Math.max(0, copy.uniformesDetalhes[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.uniformesDetalhes = [...(copy.uniformesDetalhes || [])];
                              copy.uniformesDetalhes[idx] = { ...copy.uniformesDetalhes[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.uniformesDetalhes = [...(copy.uniformesDetalhes || [])];
                              copy.uniformesDetalhes[idx] = { ...copy.uniformesDetalhes[idx], quantidade: copy.uniformesDetalhes[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calcados */}
              {editingSolicitacao.calcadosDetalhes && editingSolicitacao.calcadosDetalhes.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-amber-500 text-white px-4 py-2 text-sm font-semibold">Calcados</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.calcadosDetalhes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">Tamanho: {item.tamanho}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.calcadosDetalhes = [...(copy.calcadosDetalhes || [])];
                              copy.calcadosDetalhes[idx] = { ...copy.calcadosDetalhes[idx], quantidade: Math.max(0, copy.calcadosDetalhes[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.calcadosDetalhes = [...(copy.calcadosDetalhes || [])];
                              copy.calcadosDetalhes[idx] = { ...copy.calcadosDetalhes[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.calcadosDetalhes = [...(copy.calcadosDetalhes || [])];
                              copy.calcadosDetalhes[idx] = { ...copy.calcadosDetalhes[idx], quantidade: copy.calcadosDetalhes[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kits Aluno */}
              {editingSolicitacao.kitsAlunoDetalhes && editingSolicitacao.kitsAlunoDetalhes.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-sky-500 text-white px-4 py-2 text-sm font-semibold">Kits Aluno</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.kitsAlunoDetalhes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">{item.tipo}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.kitsAlunoDetalhes = [...(copy.kitsAlunoDetalhes || [])];
                              copy.kitsAlunoDetalhes[idx] = { ...copy.kitsAlunoDetalhes[idx], quantidade: Math.max(0, copy.kitsAlunoDetalhes[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.kitsAlunoDetalhes = [...(copy.kitsAlunoDetalhes || [])];
                              copy.kitsAlunoDetalhes[idx] = { ...copy.kitsAlunoDetalhes[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.kitsAlunoDetalhes = [...(copy.kitsAlunoDetalhes || [])];
                              copy.kitsAlunoDetalhes[idx] = { ...copy.kitsAlunoDetalhes[idx], quantidade: copy.kitsAlunoDetalhes[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Polos Professor */}
              {editingSolicitacao.polosProfDetalhes && editingSolicitacao.polosProfDetalhes.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-indigo-500 text-white px-4 py-2 text-sm font-semibold">Kit Professor - Polo</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.polosProfDetalhes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">{item.tipo} | Tam: {item.tamanho}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.polosProfDetalhes = [...(copy.polosProfDetalhes || [])];
                              copy.polosProfDetalhes[idx] = { ...copy.polosProfDetalhes[idx], quantidade: Math.max(0, copy.polosProfDetalhes[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.polosProfDetalhes = [...(copy.polosProfDetalhes || [])];
                              copy.polosProfDetalhes[idx] = { ...copy.polosProfDetalhes[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.polosProfDetalhes = [...(copy.polosProfDetalhes || [])];
                              copy.polosProfDetalhes[idx] = { ...copy.polosProfDetalhes[idx], quantidade: copy.polosProfDetalhes[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mochilas */}
              {editingSolicitacao.mochilasDetalhes && editingSolicitacao.mochilasDetalhes.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-rose-500 text-white px-4 py-2 text-sm font-semibold">Mochilas</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.mochilasDetalhes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">{item.tipo}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.mochilasDetalhes = [...(copy.mochilasDetalhes || [])];
                              copy.mochilasDetalhes[idx] = { ...copy.mochilasDetalhes[idx], quantidade: Math.max(0, copy.mochilasDetalhes[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.mochilasDetalhes = [...(copy.mochilasDetalhes || [])];
                              copy.mochilasDetalhes[idx] = { ...copy.mochilasDetalhes[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.mochilasDetalhes = [...(copy.mochilasDetalhes || [])];
                              copy.mochilasDetalhes[idx] = { ...copy.mochilasDetalhes[idx], quantidade: copy.mochilasDetalhes[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Papelaria (almoxarifado) */}
              {editingSolicitacao.papelaria && editingSolicitacao.papelaria.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-amber-500 text-white px-4 py-2 text-sm font-semibold">Papelaria</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.papelaria.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">{item.tipo}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.papelaria = [...(copy.papelaria || [])];
                              copy.papelaria[idx] = { ...copy.papelaria[idx], quantidade: Math.max(0, copy.papelaria[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.papelaria = [...(copy.papelaria || [])];
                              copy.papelaria[idx] = { ...copy.papelaria[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.papelaria = [...(copy.papelaria || [])];
                              copy.papelaria[idx] = { ...copy.papelaria[idx], quantidade: copy.papelaria[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cozinha (almoxarifado) */}
              {editingSolicitacao.cozinha && editingSolicitacao.cozinha.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-teal-500 text-white px-4 py-2 text-sm font-semibold">Cozinha</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.cozinha.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">{item.tipo}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.cozinha = [...(copy.cozinha || [])];
                              copy.cozinha[idx] = { ...copy.cozinha[idx], quantidade: Math.max(0, copy.cozinha[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.cozinha = [...(copy.cozinha || [])];
                              copy.cozinha[idx] = { ...copy.cozinha[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.cozinha = [...(copy.cozinha || [])];
                              copy.cozinha[idx] = { ...copy.cozinha[idx], quantidade: copy.cozinha[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creche (almoxarifado) */}
              {editingSolicitacao.dados?.creche && editingSolicitacao.dados.creche.length > 0 && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-pink-500 text-white px-4 py-2 text-sm font-semibold">Itens de Creche</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.dados.creche.map((item: { tipo: string; quantidade: number }, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">{item.tipo}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.dados = { ...copy.dados };
                              copy.dados.creche = [...(copy.dados.creche || [])];
                              copy.dados.creche[idx] = { ...copy.dados.creche[idx], quantidade: Math.max(0, copy.dados.creche[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.dados = { ...copy.dados };
                              copy.dados.creche = [...(copy.dados.creche || [])];
                              copy.dados.creche[idx] = { ...copy.dados.creche[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.dados = { ...copy.dados };
                              copy.dados.creche = [...(copy.dados.creche || [])];
                              copy.dados.creche[idx] = { ...copy.dados.creche[idx], quantidade: copy.dados.creche[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itens patrimonio - cada item individual com seu numero de lacre */}
              {editingSolicitacao.itens && editingSolicitacao.itens.length > 0 && editingSolicitacao.tipo === "patrimonio" && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-rose-500 text-white px-4 py-2 text-sm font-semibold flex items-center justify-between">
                    <span>Itens de Patrimonio</span>
                    <span className="text-xs font-normal opacity-80">
                      Total: {editingSolicitacao.itens.reduce((acc, item) => acc + (item.lacresIndividuais?.length || item.quantidade || 0), 0)} itens
                    </span>
                  </div>
                  <div className="p-3 space-y-3">
                    {editingSolicitacao.itens.map((item, idx) => {
                      // Expandir itens para ter lacres individuais
                      const lacres = item.lacresIndividuais || Array(item.quantidade).fill("").map((_, i) => item.numeroLacre && i === 0 ? item.numeroLacre : "");
                      return (
                        <div key={idx} className="bg-[#fafafa] p-3 rounded-lg border border-[#e5e5e5] space-y-3">
                          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
                            <span className="text-sm font-medium text-[#333]">{item.tipo}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const copy = { ...editingSolicitacao };
                                  copy.itens = [...(copy.itens || [])];
                                  const currentLacres = copy.itens[idx].lacresIndividuais || Array(copy.itens[idx].quantidade).fill("");
                                  if (currentLacres.length > 0) {
                                    copy.itens[idx] = {
                                      ...copy.itens[idx],
                                      quantidade: Math.max(0, currentLacres.length - 1),
                                      lacresIndividuais: currentLacres.slice(0, -1)
                                    };
                                    setEditingSolicitacao(copy);
                                  }
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                              >-</button>
                              <span className="text-sm font-semibold text-[#111c44] min-w-[24px] text-center">{lacres.length}</span>
                              <button
                                onClick={() => {
                                  const copy = { ...editingSolicitacao };
                                  copy.itens = [...(copy.itens || [])];
                                  const currentLacres = copy.itens[idx].lacresIndividuais || Array(copy.itens[idx].quantidade).fill("");
                                  copy.itens[idx] = {
                                    ...copy.itens[idx],
                                    quantidade: currentLacres.length + 1,
                                    lacresIndividuais: [...currentLacres, ""]
                                  };
                                  setEditingSolicitacao(copy);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                              >+</button>
                            </div>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {lacres.map((lacre, lacreIdx) => (
                              <div key={lacreIdx} className="flex items-center gap-2 bg-white p-2 rounded border border-[#e5e5e5]">
                                <span className="text-xs text-[#999] font-mono w-6">#{lacreIdx + 1}</span>
                                <Input
                                  type="text"
                                  placeholder={`N. Lacre/Placa do item ${lacreIdx + 1}`}
                                  value={lacre}
                                  onChange={(e) => {
                                    const copy = { ...editingSolicitacao };
                                    copy.itens = [...(copy.itens || [])];
                                    const currentLacres = [...(copy.itens[idx].lacresIndividuais || Array(copy.itens[idx].quantidade).fill(""))];
                                    currentLacres[lacreIdx] = e.target.value;
                                    copy.itens[idx] = { ...copy.itens[idx], lacresIndividuais: currentLacres };
                                    setEditingSolicitacao(copy);
                                  }}
                                  className="flex-1 h-8 text-xs border-[#e5e5e5]"
                                />
                                <button
                                  onClick={() => {
                                    const copy = { ...editingSolicitacao };
                                    copy.itens = [...(copy.itens || [])];
                                    const currentLacres = [...(copy.itens[idx].lacresIndividuais || Array(copy.itens[idx].quantidade).fill(""))];
                                    currentLacres.splice(lacreIdx, 1);
                                    copy.itens[idx] = {
                                      ...copy.itens[idx],
                                      quantidade: Math.max(0, currentLacres.length),
                                      lacresIndividuais: currentLacres
                                    };
                                    setEditingSolicitacao(copy);
                                  }}
                                  className="w-7 h-7 flex items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50 text-xs"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Itens generico (outros tipos) */}
              {editingSolicitacao.itens && editingSolicitacao.itens.length > 0 && editingSolicitacao.tipo !== "patrimonio" && (
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <div className="bg-rose-500 text-white px-4 py-2 text-sm font-semibold">Itens</div>
                  <div className="p-3 space-y-2">
                    {editingSolicitacao.itens.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                        <span className="flex-1 text-xs text-[#555]">{item.tipo}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.itens = [...(copy.itens || [])];
                              copy.itens[idx] = { ...copy.itens[idx], quantidade: Math.max(0, copy.itens[idx].quantidade - 1) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >-</button>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) => {
                              const copy = { ...editingSolicitacao };
                              copy.itens = [...(copy.itens || [])];
                              copy.itens[idx] = { ...copy.itens[idx], quantidade: Math.max(0, parseInt(e.target.value) || 0) };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-16 h-7 text-center text-sm border-[#e5e5e5]"
                          />
                          <button
                            onClick={() => {
                              const copy = { ...editingSolicitacao };
                              copy.itens = [...(copy.itens || [])];
                              copy.itens[idx] = { ...copy.itens[idx], quantidade: copy.itens[idx].quantidade + 1 };
                              setEditingSolicitacao(copy);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e5e5] text-[#666] hover:bg-[#f0f0f0] text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botoes de acao */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#e5e5e5]">
                <Button
                  onClick={() => { setEditDialogOpen(false); setEditingSolicitacao(null); }}
                  variant="outline"
                  className="flex-1 border-[#e5e5e5] text-[#666]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleSaveEdit(editingSolicitacao)}
                  className="flex-1 bg-[#111c44] hover:bg-[#0e1735] text-white"
                >
                  Salvar Alteracoes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Inventario */}
      <Dialog open={inventarioDialogOpen} onOpenChange={setInventarioDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white border-[#e5e5e5]">
          <DialogHeader>
            <DialogTitle className="text-[#1a1a1a] flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#111c44]" />
              Detalhes do Inventario
            </DialogTitle>
          </DialogHeader>
          {inventarioSelecionado && (
            <div className="space-y-4">
              {/* Info do inventario */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#fafafa] p-3 rounded-lg border border-[#e5e5e5]">
                  <p className="text-xs text-[#999] mb-1">Escola</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{inventarioSelecionado.escola}</p>
                </div>
                <div className="bg-[#fafafa] p-3 rounded-lg border border-[#e5e5e5]">
                  <p className="text-xs text-[#999] mb-1">Setor</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{inventarioSelecionado.setor}</p>
                </div>
                <div className="bg-[#fafafa] p-3 rounded-lg border border-[#e5e5e5]">
                  <p className="text-xs text-[#999] mb-1">Solicitante</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{inventarioSelecionado.solicitante}</p>
                  <p className="text-xs text-[#666]">Mat: {inventarioSelecionado.matricula}</p>
                </div>
                <div className="bg-[#fafafa] p-3 rounded-lg border border-[#e5e5e5]">
                  <p className="text-xs text-[#999] mb-1">Ano do Inventario</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{inventarioSelecionado.ano}</p>
                  <p className="text-xs text-[#666]">Enviado em: {inventarioSelecionado.dataHora}</p>
                </div>
              </div>

              {/* Tabela de itens */}
              <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                <div className="bg-[#111c44] text-white px-4 py-2 text-sm font-semibold">
                  Itens do Inventario ({inventarioSelecionado.itens.length})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#fafafa] border-b border-[#e5e5e5]">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-[#666]">N. Placa</th>
                        <th className="px-3 py-2 text-left font-semibold text-[#666]">Caracteristica</th>
                        <th className="px-3 py-2 text-left font-semibold text-[#666]">Marca/Modelo</th>
                        <th className="px-3 py-2 text-left font-semibold text-[#666]">N. Serie</th>
                        <th className="px-3 py-2 text-left font-semibold text-[#666]">Setor</th>
                        <th className="px-3 py-2 text-left font-semibold text-[#666]">Local</th>
                        <th className="px-3 py-2 text-left font-semibold text-[#666]">Obs.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarioSelecionado.itens.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                          <td className="px-3 py-2 font-medium text-[#111c44]">{item.numeroPlaca || "-"}</td>
                          <td className="px-3 py-2 text-[#333]">{item.caracteristica || "-"}</td>
                          <td className="px-3 py-2 text-[#666]">{item.marcaModelo || "-"}</td>
                          <td className="px-3 py-2 text-[#666]">{item.numeroSerie || "-"}</td>
                          <td className="px-3 py-2 text-[#666]">{item.setor || "-"}</td>
                          <td className="px-3 py-2 text-[#666]">{item.local || "-"}</td>
                          <td className="px-3 py-2 text-[#999]">{item.observacao || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assinatura */}
              {inventarioSelecionado.assinatura && (
                <div className="bg-[#fafafa] p-3 rounded-lg border border-[#e5e5e5]">
                  <p className="text-xs text-[#999] mb-1">Assinatura Digital</p>
                  <p className="text-sm text-[#1a1a1a]">{inventarioSelecionado.assinatura}</p>
                </div>
              )}

              {/* Acoes */}
              <div className="flex gap-3 pt-2">
                <Select
                  value={inventarioSelecionado.status}
                  onValueChange={(newStatus) => {
                    updateInventario(inventarioSelecionado.id, { status: newStatus as SolicitacaoInventario["status"] });
                    setInventarios(getInventarios());
                    setInventarioSelecionado({ ...inventarioSelecionado, status: newStatus as SolicitacaoInventario["status"] });
                  }}
                >
                  <SelectTrigger className="w-48 h-9 text-sm border-[#e5e5e5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Analise">Em Analise</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setInventarioDialogOpen(false)}
                  className="border-[#e5e5e5] text-[#666]"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
