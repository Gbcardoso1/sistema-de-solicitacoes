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
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Package,
  ArrowRightLeft,
  AlertTriangle,
  BarChart3,
  Building2,
  Boxes,
} from "lucide-react";
import type { Solicitacao } from "@/lib/solicitacoes-store";
import { getItensEstoqueBaixo } from "@/lib/itens-catalogo-store";

const CORES = {
  azul: "#111c44",
  azulClaro: "#3b82f6",
  verde: "#16a34a",
  amarelo: "#d97706",
  rosa: "#e11d48",
  cinza: "#6b7280",
  teal: "#0d9488",
};

const PIE_COLORS = ["#111c44", "#3b82f6", "#d97706", "#0d9488", "#e11d48", "#6b7280"];

interface AdminDashboardProps {
  solicitacoes: Solicitacao[];
}

export default function AdminDashboard({ solicitacoes }: AdminDashboardProps) {
  // 1. Itens mais solicitados
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
      .slice(0, 10)
      .map(([nome, qtd]) => ({
        nome: nome.length > 25 ? nome.slice(0, 22) + "..." : nome,
        nomeCompleto: nome,
        quantidade: qtd,
      }));
  }, [solicitacoes]);

  // 2. Setores que mais pedem
  const setoresMaisPedem = useMemo(() => {
    const contagem: Record<string, number> = {};
    solicitacoes.forEach((s) => {
      contagem[s.instituicao] = (contagem[s.instituicao] || 0) + 1;
    });
    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nome, total]) => ({
        nome: nome.length > 20 ? nome.slice(0, 17) + "..." : nome,
        nomeCompleto: nome,
        total,
      }));
  }, [solicitacoes]);

  // 3. Patrimonio transferido
  const patrimonioTransferido = useMemo(() => {
    const transferencias = solicitacoes.filter((s) => s.tipo === "transferencia");
    const porMes: Record<string, number> = {};
    transferencias.forEach((s) => {
      const parts = s.dataHora.split("/");
      if (parts.length >= 2) {
        const mesKey = parts[1] + "/" + (parts[2]?.split(",")[0] || "");
        porMes[mesKey] = (porMes[mesKey] || 0) + 1;
      }
    });
    return {
      total: transferencias.length,
      finalizadas: transferencias.filter((s) => s.status === "Finalizado").length,
      pendentes: transferencias.filter((s) => (s.status || "Pendente") === "Pendente").length,
    };
  }, [solicitacoes]);

  // 4. Itens encaminhados para processamento
  const itensBaixados = useMemo(() => {
    const encaminhados = solicitacoes.filter((s) => s.encaminhadoLogistica);
    const totalItens = encaminhados.reduce((acc, s) => {
      return acc + (s.uniformes || 0) + (s.calcados || 0) + (s.kitsAluno || 0) +
        (s.polosProf || 0) + (s.mochilas || 0) + (s.itens?.length || 0) +
        (s.papelaria?.length || 0) + (s.cozinha?.length || 0);
    }, 0);
    return {
      totalPedidos: encaminhados.length,
      totalItens,
      entregues: encaminhados.filter((s) => s.entregaRegistrada).length,
    };
  }, [solicitacoes]);

  // 5. Estoque critico
  const estoqueCritico = useMemo(() => {
    return getItensEstoqueBaixo().slice(0, 8);
  }, []);

  // 6. Grafico mensal
  const dadosMensais = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const anoAtual = new Date().getFullYear().toString();
    const porMes: Record<string, { almoxarifado: number; uniformes: number; patrimonio: number; transferencia: number }> = {};

    meses.forEach((m, i) => {
      const mesNum = String(i + 1).padStart(2, "0");
      porMes[mesNum] = { almoxarifado: 0, uniformes: 0, patrimonio: 0, transferencia: 0 };
    });

    solicitacoes.forEach((s) => {
      const parts = s.dataHora.split("/");
      if (parts.length >= 3) {
        const ano = parts[2]?.split(",")[0]?.trim();
        const mes = parts[1];
        if (ano === anoAtual && porMes[mes]) {
          if (s.tipo === "almoxarifado") porMes[mes].almoxarifado++;
          else if (s.tipo === "uniformes" || s.tipo === "kits-uniformes") porMes[mes].uniformes++;
          else if (s.tipo === "patrimonio") porMes[mes].patrimonio++;
          else if (s.tipo === "transferencia") porMes[mes].transferencia++;
        }
      }
    });

    return meses.map((m, i) => {
      const mesNum = String(i + 1).padStart(2, "0");
      const data = porMes[mesNum];
      return {
        mes: m,
        almoxarifado: data.almoxarifado,
        uniformes: data.uniformes,
        patrimonio: data.patrimonio,
        transferencia: data.transferencia,
        total: data.almoxarifado + data.uniformes + data.patrimonio + data.transferencia,
      };
    });
  }, [solicitacoes]);

  // Distribuicao por tipo (pie chart)
  const distribuicaoTipo = useMemo(() => {
    const tipos: Record<string, number> = {};
    solicitacoes.forEach((s) => {
      const label = s.tipo === "uniformes" || s.tipo === "kits-uniformes" ? "Uniformes" : s.tipo === "kits" ? "Kits" : s.tipo === "almoxarifado" ? "Almoxarifado" : s.tipo === "patrimonio" ? "Patrimonio" : "Transferencia";
      tipos[label] = (tipos[label] || 0) + 1;
    });
    return Object.entries(tipos).map(([name, value]) => ({ name, value }));
  }, [solicitacoes]);

  const totalSolicitacoes = solicitacoes.length;
  const totalFinalizados = solicitacoes.filter((s) => s.status === "Finalizado").length;
  const totalPendentes = solicitacoes.filter((s) => (s.status || "Pendente") === "Pendente").length;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-[#e5e5e5]">
          <p className="text-xs font-semibold text-[#1a1a1a] mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-xs" style={{ color: p.color }}>
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Total Solicitacoes</p>
            <BarChart3 className="w-4 h-4 text-[#111c44]" />
          </div>
          <p className="text-2xl font-bold text-[#1a1a1a]">{totalSolicitacoes}</p>
          <p className="text-xs text-[#8c8c8c] mt-1">{totalFinalizados} finalizados</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Pendentes</p>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{totalPendentes}</p>
          <p className="text-xs text-[#8c8c8c] mt-1">aguardando processamento</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Transferencias</p>
            <ArrowRightLeft className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-[#1a1a1a]">{patrimonioTransferido.total}</p>
          <p className="text-xs text-[#8c8c8c] mt-1">{patrimonioTransferido.finalizadas} concluidas</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8c8c8c] font-medium uppercase tracking-wide">Encaminhados</p>
            <Boxes className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{itensBaixados.totalPedidos}</p>
          <p className="text-xs text-[#8c8c8c] mt-1">{itensBaixados.entregues} entregues</p>
        </div>
      </div>

      {/* Grafico Mensal + Distribuicao */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">Grafico Mensal - {new Date().getFullYear()}</h3>
          <p className="text-xs text-[#8c8c8c] mb-4">Solicitacoes por tipo ao longo do ano</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosMensais} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#8c8c8c" }} />
                <YAxis tick={{ fontSize: 11, fill: "#8c8c8c" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="almoxarifado" name="Almoxarifado" stroke={CORES.amarelo} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="uniformes" name="Uniformes" stroke={CORES.verde} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="patrimonio" name="Patrimonio" stroke={CORES.rosa} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="transferencia" name="Transferencia" stroke={CORES.azulClaro} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">Distribuicao por Tipo</h3>
          <p className="text-xs text-[#8c8c8c] mb-4">Proporcao das solicitacoes</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicaoTipo}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribuicaoTipo.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {distribuicaoTipo.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-xs text-[#666]">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Itens mais solicitados + Setores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#111c44]" />
            <h3 className="text-sm font-bold text-[#1a1a1a]">Itens Mais Solicitados</h3>
          </div>
          <p className="text-xs text-[#8c8c8c] mb-4">Top 10 itens com maior demanda</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itensMaisSolicitados} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#8c8c8c" }} allowDecimals={false} />
                <YAxis type="category" dataKey="nome" width={130} tick={{ fontSize: 9, fill: "#555" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-[#e5e5e5]">
                          <p className="text-xs font-semibold text-[#1a1a1a]">{data.nomeCompleto}</p>
                          <p className="text-xs text-[#111c44]">Quantidade: <strong>{data.quantidade}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="quantidade" fill={CORES.azul} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-[#111c44]" />
            <h3 className="text-sm font-bold text-[#1a1a1a]">Setores que Mais Pedem</h3>
          </div>
          <p className="text-xs text-[#8c8c8c] mb-4">Instituicoes com maior volume</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setoresMaisPedem} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#8c8c8c" }} allowDecimals={false} />
                <YAxis type="category" dataKey="nome" width={130} tick={{ fontSize: 9, fill: "#555" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-[#e5e5e5]">
                          <p className="text-xs font-semibold text-[#1a1a1a]">{data.nomeCompleto}</p>
                          <p className="text-xs text-[#111c44]">Solicitacoes: <strong>{data.total}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="total" fill={CORES.teal} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Patrimonio Transferido + Estoque Critico + Itens Baixados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-[#1a1a1a]">Patrimonio Transferido</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#f0f0f0]">
              <span className="text-sm text-[#666]">Total de transferencias</span>
              <span className="text-sm font-bold text-[#1a1a1a]">{patrimonioTransferido.total}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#f0f0f0]">
              <span className="text-sm text-[#666]">Concluidas</span>
              <span className="text-sm font-bold text-green-600">{patrimonioTransferido.finalizadas}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#666]">Pendentes</span>
              <span className="text-sm font-bold text-amber-600">{patrimonioTransferido.pendentes}</span>
            </div>
            {patrimonioTransferido.total > 0 && (
              <div className="mt-2">
                <div className="w-full bg-[#f0f0f0] rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(patrimonioTransferido.finalizadas / patrimonioTransferido.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#8c8c8c] mt-1">{Math.round((patrimonioTransferido.finalizadas / patrimonioTransferido.total) * 100)}% concluido</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-bold text-[#1a1a1a]">Itens Baixados</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#f0f0f0]">
              <span className="text-sm text-[#666]">Pedidos encaminhados</span>
              <span className="text-sm font-bold text-[#1a1a1a]">{itensBaixados.totalPedidos}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#f0f0f0]">
              <span className="text-sm text-[#666]">Entregas realizadas</span>
              <span className="text-sm font-bold text-green-600">{itensBaixados.entregues}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#666]">Total de itens</span>
              <span className="text-sm font-bold text-[#111c44]">{itensBaixados.totalItens}</span>
            </div>
            {itensBaixados.totalPedidos > 0 && (
              <div className="mt-2">
                <div className="w-full bg-[#f0f0f0] rounded-full h-2">
                  <div
                    className="bg-[#111c44] h-2 rounded-full transition-all"
                    style={{ width: `${(itensBaixados.entregues / itensBaixados.totalPedidos) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#8c8c8c] mt-1">{Math.round((itensBaixados.entregues / itensBaixados.totalPedidos) * 100)}% entregue</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-[#1a1a1a]">Estoque Critico</h3>
          </div>
          {estoqueCritico.length === 0 ? (
            <div className="flex items-center justify-center h-[150px]">
              <p className="text-sm text-[#8c8c8c]">Nenhum item com estoque baixo</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {estoqueCritico.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-xs text-[#1a1a1a] truncate flex-1 mr-2" title={item.nome}>
                    {item.nome.length > 30 ? item.nome.slice(0, 27) + "..." : item.nome}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-amber-700">{item.estoque}</span>
                    <span className="text-[10px] text-amber-500">/ min {item.estoqueMinimo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
