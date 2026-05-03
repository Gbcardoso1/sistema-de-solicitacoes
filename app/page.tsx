"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LogIn,
  Shirt,
  Package,
  Armchair,
  ArrowRightLeft,
  ClipboardList,
  HelpCircle,
  MessageCircle,
  X,
  Send,
  Search,
  Eye,
  EyeOff,
  Lock,
  Bluetooth,
} from "lucide-react";

// Adicionar estilos de animação
const animationStyles = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse-scale {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .menu-item {
    animation: slideInRight 0.5s ease-out forwards;
  }

  .menu-item:nth-child(2) { animation-delay: 0.1s; }
  .menu-item:nth-child(3) { animation-delay: 0.2s; }
  .menu-item:nth-child(4) { animation-delay: 0.3s; }
  .menu-item:nth-child(5) { animation-delay: 0.4s; }
  .menu-item:nth-child(6) { animation-delay: 0.5s; }
  .menu-item:nth-child(7) { animation-delay: 0.6s; }
  .menu-item:nth-child(8) { animation-delay: 0.7s; }
`;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addChatMessage,
  getChatPorInstituicao,
  type ChatMessage,
} from "@/lib/solicitacoes-store";
import { getInstituicoesAtivas } from "@/lib/instituicoes-store";

// Menu items - left column
const menuItemsLeft = [
  { href: "/patrimonio", label: "SOLICITAR PATRIMONIO", icon: Armchair },
  { href: "/almoxarifado", label: "SOLICITAR ALMOXARIFADO", icon: Package },
  { href: "/uniformes", label: "SOLICITAR UNIFORMES", icon: Shirt },
  { href: "/kits", label: "SOLICITAR KITS", icon: Package },
];

// Menu items - right column
const menuItemsRight = [
  { href: "/transferencia", label: "TRANSFERENCIA DE ITENS", icon: ArrowRightLeft },
  { href: "/inventario", label: "INVENTARIO ANUAL", icon: ClipboardList },
  { href: "/minhas-solicitacoes", label: "VERIFICAR SOLICITACAO", icon: Armchair },
  { href: "/duvidas", label: "DUVIDAS FREQUENTES", icon: HelpCircle },
];

export default function HomePage() {
  const router = useRouter();

  // Login modal state
  const [showLogin, setShowLogin] = useState(false);
  const [loginUsuario, setLoginUsuario] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginErro, setLoginErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = () => {
    if (loginUsuario === "patrimonio" && loginSenha === "#cmpp123") {
      router.push("/admin");
    } else {
      setLoginErro("Usuario ou senha incorretos");
    }
  };

  const fecharLogin = () => {
    setShowLogin(false);
    setLoginUsuario("");
    setLoginSenha("");
    setLoginErro("");
    setMostrarSenha(false);
  };

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatStep, setChatStep] = useState<"info" | "chat">("info");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [instituicaoUsuario, setInstituicaoUsuario] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (instituicaoUsuario && chatStep === "chat") {
      const msgs = getChatPorInstituicao(instituicaoUsuario);
      setMensagens(msgs);
    }
  }, [instituicaoUsuario, chatStep]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const iniciarChat = () => {
    if (nomeUsuario.trim() && instituicaoUsuario.trim()) {
      setChatStep("chat");
    }
  };

  const enviarMensagem = () => {
    if (mensagem.trim()) {
      const novaMensagem = addChatMessage({
        remetente: "escola",
        nomeRemetente: nomeUsuario,
        instituicao: instituicaoUsuario,
        mensagem: mensagem.trim(),
        conversaId: instituicaoUsuario.toLowerCase().replace(/\s+/g, "-"),
      });
      setMensagens((prev) => [...prev, novaMensagem]);
      setMensagem("");
    }
  };

  const fecharChat = () => {
    setShowChat(false);
    setChatStep("info");
    setNomeUsuario("");
    setInstituicaoUsuario("");
    setMensagem("");
    setMensagens([]);
  };

  const openLogin = () => {
    setShowLogin(true);
  };

  const openChat = () => {
    setShowChat(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a4e]">
      <style>{animationStyles}</style>
      {/* Header - Dark Navy */}
      <header className="relative bg-[#1a1a4e] py-7 lg:py-15">
        {/* Login button top-left */}
        <button
          onClick={openLogin}
          className="absolute top-4 left-4 lg:top-6 lg:left-6 w-10 h-10 rounded-full border-2 border-white/30 hover:border-white/60 hover:bg-white/10 flex items-center justify-center transition-all duration-300 z-30"
          title="Acesso Administrativo"
        >
          <LogIn className="w-5 h-5 text-white" />
        </button>

        {/* Logo and title centered */}
        <div className="flex flex-col items-center justify-center px-4">
          <div className="relative w-48 h-30 lg:w-63 lg:h-40 mb--1">
            <Image
              src="/images/logo-saquarema.png"
              alt="Prefeitura de Saquarema"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-white/60 text-xs lg:text-xs font-medium tracking-[0.15em] uppercase text-center">
            Sistema Integrado de Solicitacoes Digitais
          </p>
        </div>
      </header>

      {/* Main content - Cream/Beige background with curved top */}
      <main
        className="flex-1 relative bg-[#f5f5eb] border-t-7 border-[#2fc7a1] mt-0"
        style={{
          marginTop: "10px",
          borderTopLeftRadius: "30px",
          borderTopRightRadius: "30px",
        }}
      >
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-9 lg:mb-7 text-left">
              <div className="flex items-left justify-left gap-3 mb-1">
                <div className="w-1 h-5 bg-[#0fb992] rounded-full"></div>
                <h1 className="text-3xl lg:text-2xl font-bold text-[#1a1a4e]">Bem-vindo!</h1>
              </div>
              <p className="text-gray-600 text-[11px] lg:text-xs">Escolha uma das opções abaixo para iniciar sua solicitação.</p>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-4">
              {menuItemsLeft.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="menu-item group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-xl hover:border-[#0fb992] hover:-translate-y-1 transition-all duration-300 ease-out active:scale-[0.98] flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-lg bg-[#0fb992] flex items-center justify-center shrink-0 group-hover:bg-[#0da881] group-hover:shadow-lg group-hover:shadow-[#0fb992]/40 transition-all duration-300">
                    <item.icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#1a1a4e] uppercase tracking-tight leading-tight group-hover:text-[#0fb992] transition-colors duration-300">{item.label}</h3>
                    <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">
                      {item.label === "SOLICITAR PATRIMONIO" && "Solicite novos patrimônios."}
                      {item.label === "SOLICITAR ALMOXARIFADO" && "Solicite materiais do almoxarifado."}
                      {item.label === "SOLICITAR UNIFORMES" && "Solicite uniformes para sua equipe."}
                      {item.label === "SOLICITAR KITS" && "Solicite kits disponíveis."}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0fb992] group-hover:translate-x-1 transition-all duration-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}

              {menuItemsRight.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="menu-item group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-xl hover:border-[#0fb992] hover:-translate-y-1 transition-all duration-300 ease-out active:scale-[0.98] flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-lg bg-[#0fb992] flex items-center justify-center shrink-0 group-hover:bg-[#0da881] group-hover:shadow-lg group-hover:shadow-[#0fb992]/40 transition-all duration-300">
                    <item.icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#1a1a4e] uppercase tracking-tight leading-tight group-hover:text-[#0fb992] transition-colors duration-300">{item.label}</h3>
                    <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">
                      {item.label === "TRANSFERENCIA DE ITENS" && "Solicite transferência de itens."}
                      {item.label === "INVENTARIO ANUAL" && "Realize o inventário anual."}
                      {item.label === "VERIFICAR SOLICITACAO" && "Acompanhe suas solicitações."}
                      {item.label === "DUVIDAS FREQUENTES" && "Tire suas dúvidas."}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0fb992] group-hover:translate-x-1 transition-all duration-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Footer Text */}
            <div className="text-center mt-4 lg:mt-6">
              <p className="text-xs text-[#0fb992] font-medium tracking-wide">Seguro, ágil e eficiente.</p>
            </div>

            {/* Chat Online button */}
            <button
              onClick={openChat}
              className="fixed bottom-6 right-6 w-14 h-14 bg-[#1a1a4e] hover:bg-[#261da0] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 group"
            >
              <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
              </div>
            </button>

          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={fecharLogin}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            {/* Close button */}
            <button
              onClick={fecharLogin}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] hover:text-[#475569] transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-[#1a1a4e]" />
              </div>
              <h2 className="text-xl font-bold text-[#1a1a4e]">Acesso Administrativo</h2>
              <p className="text-sm text-[#64748b] mt-1 text-center">
                Digite suas credenciais para acessar o painel de gestao
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Login</label>
                <Input
                  value={loginUsuario}
                  onChange={(e) => { setLoginUsuario(e.target.value); setLoginErro(""); }}
                  placeholder="Digite o login"
                  className="h-11 bg-white border-[#e2e8f0] focus:border-[#1a1a4e] text-[#1e293b] placeholder:text-[#94a3b8]"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Senha</label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    value={loginSenha}
                    onChange={(e) => { setLoginSenha(e.target.value); setLoginErro(""); }}
                    placeholder="Digite a senha"
                    className="h-11 bg-white border-[#e2e8f0] focus:border-[#1a1a4e] text-[#1e293b] placeholder:text-[#94a3b8] pr-11"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors duration-200"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginErro && (
                <p className="text-sm text-red-500">{loginErro}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={fecharLogin}
                  variant="outline"
                  className="flex-1 h-11 border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleLogin}
                  className="flex-1 h-11 bg-[#1a1a4e] hover:bg-[#252566] text-white font-semibold transition-all duration-300 hover:shadow-lg"
                >
                  Acessar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 sm:items-center sm:justify-center sm:p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={fecharChat}
          />
          {/* Dialog */}
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#1a1a4e] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold text-sm">Fale com o Patrimonio</span>
              </div>
              <button onClick={fecharChat} className="hover:bg-white/20 p-1 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {chatStep === "info" ? (
              <div className="flex flex-col p-6 gap-5">
                <p className="text-sm text-[#64748b] text-center">Preencha seus dados para iniciar o atendimento:</p>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#1e293b]">Seu Nome</label>
                  <Input value={nomeUsuario} onChange={(e) => setNomeUsuario(e.target.value)} placeholder="Digite seu nome" className="h-10 text-sm border-[#e2e8f0]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-[#1e293b]">Nome da Instituicao</label>
                  <Select value={instituicaoUsuario} onValueChange={setInstituicaoUsuario}>
                    <SelectTrigger className="h-10 text-sm border-[#e2e8f0]"><SelectValue placeholder="Selecione a escola" /></SelectTrigger>
                    <SelectContent className="max-h-60">{getInstituicoesAtivas().map(inst => <SelectItem key={inst} value={inst} className="text-sm">{inst}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={iniciarChat} disabled={!nomeUsuario.trim() || !instituicaoUsuario.trim()} className="w-full h-10 bg-[#1a1a4e] hover:bg-[#252566] text-white text-sm font-semibold transition-all duration-200">
                  Iniciar Conversa
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc] h-80">
                  {mensagens.length === 0 ? (
                    <div className="text-center text-[#94a3b8] text-sm py-8">
                      <p>Ola, {nomeUsuario}!</p>
                      <p className="mt-1">Como podemos ajudar?</p>
                    </div>
                  ) : (
                    mensagens.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.remetente === "escola" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.remetente === "escola" ? "bg-[#1a1a4e] text-white rounded-br-none" : "bg-white border text-[#1e293b] rounded-bl-none"}`}>
                          <p className="font-medium text-xs mb-1 opacity-70">{msg.remetente === "escola" ? "Voce" : "Patrimonio"}</p>
                          <p>{msg.mensagem}</p>
                          <p className="text-xs mt-1 opacity-50">{msg.dataHora}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t bg-white">
                  <div className="flex gap-2">
                    <Textarea
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="min-h-[40px] max-h-[80px] text-sm resize-none"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensagem(); } }}
                    />
                    <Button onClick={enviarMensagem} disabled={!mensagem.trim()} size="icon" className="bg-[#1a1a4e] hover:bg-[#252566] text-white shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
