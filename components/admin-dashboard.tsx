"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";
import type { Solicitacao, SolicitacaoInventario, SolicitacaoInventarioSetor } from "@/lib/solicitacoes-store";
import { getItensEstoqueBaixo } from "@/lib/itens-catalogo-store";
import type { Usuario } from "@/lib/usuarios-store";

const PIE_COLORS = ["#16a34a", "#3b82f6", "#d97706"];

interface AdminDashboardProps {
  solicitacoes: Solicitacao[];
  inventarios?: SolicitacaoInventario[];
  inventariosSetor?: SolicitacaoInventarioSetor[];
  usuarios?: Usuario[];
  instituicoes?: string[];
}

export default function AdminDashboard({ 
  solicitacoes, 
  inventarios = [], 
  inventariosSetor = [],
  usuarios = [],
  instituicoes = [],
}: AdminDashboardProps) {
  
  // Estatisticas gerais do sistema
  const estatisticasGerais = useMemo(() => {
    const hoje = new Date();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
    const anoAtual = String(hoje.getFullYear());
    
    const solicitacoesMesAtual = solicitacoes.filter(s => {
      const parts = s.dataHora.split("/");
      return parts.length >= 3 && parts[1] === mesAtual && parts[2]?.includes(anoAtual);
    });
    
    return {
      totalSolicitacoes: solicitacoes.length,
      solicitacoesMes: solicitacoesMesAtual.length,
      finalizados: solicitacoes.filter(s => s.status === "Finalizado").length,
      pendentes: solicitacoes.filter(s => (s.status || "Pendente") === "Pendente").length,
      processamento: solicitacoes.filter(s => s.status === "Processamento").length,
      encaminhados: solicitacoes.filter(s => s.encaminhadoLogistica).length,
      entregues: solicitacoes.filter(s => s.entregaRegistrada).length,
    };
  }, [solicitacoes]);

  // Estatisticas de inventarios
  const estatisticasInventarios = useMemo(() => {
    const totalInventarios = inventarios.length + inventariosSetor.length;
    const finalizados = inventarios.filter(i => i.status === "Finalizado").length + 
                       inventariosSetor.filter(i => i.status === "Finalizado").length;
    const pendentes = inventarios.filter(i => i.status === "Pendente").length + 
                     inventariosSetor.filter(i => i.status === "Pendente").length;
    
    return { total: totalInventarios, finalizados, pendentes };
  }, [inventarios, inventariosSetor]);

  // Estatisticas de transferencias
  const estatisticasTransferencias = useMemo(() => {
    const transferencias = solicitacoes.filter((s) => s.tipo === "transferencia");
    return {
      total: transferencias.length,
      finalizadas: transferencias.filter((s) => s.status === "Finalizado").length,
      pendentes: transferencias.filter((s) => (s.status || "Pendente") === "Pendente").length,
    };
  }, [solicitacoes]);

  // Estatisticas de usuarios
  const estatisticasUsuarios = useMemo(() => {
    const ativos = usuarios.filter(u => u.ativo).length;
    const pendentesAprov = usuarios.filter(u => u.pendente).length;
    
    return { total: usuarios.length, ativos, pendentesAprov };
  }, [usuarios]);

  // Itens mais solicitados (top 6)
  const itensMaisSolicitados = useMemo(() => {
    const contagem: Record<string, number> = {};

    solicitacoes.forEach((s) => {
      if (s.papelaria?.length) s.papelaria.forEach((i) => { contagem[i.tipo] = (contagem[i.tipo] || 0) + i.quantidade; });
      if (s.cozinha?.length) s.cozinha.forEach((i) => { contagem[i.tipo] = (contagem[i.tipo] || 0) + i.quantidade; });
      if (s.itens?.length) s.itens.forEach((i) => { contagem[i.tipo] = (contagem[i.tipo] || 0) + i.quantidade; });
      if (s.uniformesDetalhes?.length) s.uniformesDetalhes.forEach((i) => { const key = `Uniforme ${i.tipo}`; contagem[key] = (contagem[key] || 0) + i.quantidade; });
      if (s.calcadosDetalhes?.length) s.calcadosDetalhes.forEach((i) => { const key = `Calcado Tam ${i.tamanho}`; contagem[key] = (contagem[key] || 0) + i.quantidade; });
      if (s.kitsAlunoDetalhes?.length) s.kitsAlunoDetalhes.forEach((i) => { contagem[i.tipo] = (contagem[i.tipo] || 0) + i.quantidade; });
      if (s.mochilasDetalhes?.length) s.mochilasDetalhes.forEach((i) => { const key = `Mochila ${i.tipo}`; contagem[key] = (contagem[key] || 0) + i.quantidade; });
      if (s.polosProfDetalhes?.length) s.polosProfDetalhes.forEach((i) => { const key = `Polo Prof ${i.tamanho}`; contagem[key] = (contagem[key] || 0) + i.quantidade; });
    });

    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nome, qtd]) => ({
        nome: nome.length > 18 ? nome.slice(0, 15) + "..." : nome,
        quantidade: qtd,
      }));
  }, [solicitacoes]);

  // Estoque critico (top 5)
  const estoqueCritico = useMemo(() => {
    return getItensEstoqueBaixo().slice(0, 5);
  }, []);

  // Distribuicao por status
  const distribuicaoStatus = useMemo(() => {
    return [
      { name: "Finalizados", value: estatisticasGerais.finalizados, color: "#16a34a" },
      { name: "Processamento", value: estatisticasGerais.processamento, color: "#3b82f6" },
      { name: "Pendentes", value: estatisticasGerais.pendentes, color: "#d97706" },
    ];
  }, [estatisticasGerais]);

  // Calcular porcentagem de conclusao
  const taxaConclusao = estatisticasGerais.totalSolicitacoes > 0 
    ? Math.round((estatisticasGerais.finalizados / estatisticasGerais.totalSolicitacoes) * 100) 
    : 0;

  return (
    <div className="space-y-5">
      {/* KPI Cards - Status das Solicitacoes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Total Solicitacoes</p>
            <Package className="w-4 h-4 text-[#111c44]" />
          </div>
          <p className="text-2xl font-bold text-[#111c44]">{estatisticasGerais.totalSolicitacoes}</p>
          <p className="text-xs text-[#8c8c8c] mt-1">{estatisticasGerais.solicitacoesMes} este mes</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Pendentes</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{estatisticasGerais.pendentes}</p>
          <p className="text-xs text-[#8c8c8c] mt-1">aguardando analise</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Em Processamento</p>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{estatisticasGerais.processamento}</p>
          <p className="text-xs text-[#8c8c8c] mt-1">{estatisticasGerais.encaminhados} encaminhados</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Finalizados</p>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{estatisticasGerais.finalizados}</p>
          <p className="text-xs text-[#8c8c8c] mt-1">{taxaConclusao}% taxa conclusao</p>
        </div>
      </div>

      {/* Graficos e Resumos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Distribuicao por Status */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">Status das Solicitacoes</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicaoStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribuicaoStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, ""]}
                  contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {distribuicaoStatus.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-[#666]">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Itens Mais Solicitados */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">Itens Mais Solicitados</h3>
          {itensMaisSolicitados.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itensMaisSolicitados} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#8c8c8c" }} />
                  <YAxis dataKey="nome" type="category" width={100} tick={{ fontSize: 11, fill: "#666" }} />
                  <Tooltip 
                    formatter={(value: number) => [value, "Quantidade"]}
                    contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                  />
                  <Bar dataKey="quantidade" fill="#111c44" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[#8c8c8c] text-sm">
              Nenhuma solicitacao registrada
            </div>
          )}
        </div>
      </div>

      {/* Cards Secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inventarios */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">Inventarios</p>
              <p className="text-xs text-[#8c8c8c]">{estatisticasInventarios.total} total</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#666]">Finalizados</span>
              <span className="font-medium text-green-600">{estatisticasInventarios.finalizados}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#666]">Pendentes</span>
              <span className="font-medium text-amber-600">{estatisticasInventarios.pendentes}</span>
            </div>
          </div>
        </div>

        {/* Transferencias */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">Transferencias</p>
              <p className="text-xs text-[#8c8c8c]">{estatisticasTransferencias.total} total</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#666]">Finalizadas</span>
              <span className="font-medium text-green-600">{estatisticasTransferencias.finalizadas}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#666]">Pendentes</span>
              <span className="font-medium text-amber-600">{estatisticasTransferencias.pendentes}</span>
            </div>
          </div>
        </div>

        {/* Entregas */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <PackageCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">Entregas</p>
              <p className="text-xs text-[#8c8c8c]">{estatisticasGerais.entregues} realizadas</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#666]">Encaminhados</span>
              <span className="font-medium text-blue-600">{estatisticasGerais.encaminhados}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#666]">Instituicoes</span>
              <span className="font-medium text-[#111c44]">{instituicoes.filter(i => i !== "Todas Instituicoes").length}</span>
            </div>
          </div>
        </div>

        {/* Estoque Critico */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">Estoque Baixo</p>
              <p className="text-xs text-[#8c8c8c]">{estoqueCritico.length} itens</p>
            </div>
          </div>
          {estoqueCritico.length > 0 ? (
            <div className="space-y-1.5">
              {estoqueCritico.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-[#666] truncate max-w-[120px]">{item.nome}</span>
                  <span className="font-medium text-red-600">{item.estoque}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-green-600">Estoque OK</p>
          )}
        </div>
      </div>
    </div>
  );
}
