"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Armchair, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    setErro("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });

      if (res.ok) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/admin";
        router.push(redirect);
      } else {
        const data = await res.json();
        setErro(data.erro || "Usuário ou senha incorretos");
      }
    } catch {
      setErro("Erro ao conectar. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Login Form */}
        <div className="w-full max-w-sm animate-fade-in-up">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#555] hover:text-[#111c44] transition-all duration-300 mb-8 hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-md flex items-center justify-center mb-4 bg-gradient-to-br from-[#111c44] to-[#1e3a5f] animate-scale-in shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Armchair className="w-10 h-10 text-white/90" />
            </div>
            <h2 className="text-xl text-[#111c44] font-medium animate-fade-in animation-delay-200">
              Patrimonio
            </h2>
          </div>

          <div className="space-y-4 bg-white rounded-xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 p-5">
            <div className="animate-fade-in-up animation-delay-100">
              <Input
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                  setErro("");
                }}
                placeholder="Usuario"
                className="bg-[#f5f5f5] border border-[#ddd] text-[#333] placeholder:text-[#999] h-12 rounded transition-all duration-300 focus:shadow-md focus:border-[#111c44]"
              />
            </div>
            <div className="relative animate-fade-in-up animation-delay-200">
              <Input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro("");
                }}
                placeholder="Senha"
                className="bg-[#f5f5f5] border border-[#ddd] text-[#333] placeholder:text-[#999] h-12 rounded pr-12 transition-all duration-300 focus:shadow-md focus:border-[#111c44]"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#333] transition-all duration-200 hover:scale-110"
              >
                {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {erro && (
              <p className="text-[#e87c03] text-sm animate-fade-in">{erro}</p>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-12 text-white font-medium rounded bg-[#111c44] hover:bg-[#1e3a5f] transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up animation-delay-300"
            >
              Entrar
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-6 text-center animate-fade-in animation-delay-500">
        <p className="text-[#808080] text-xs">
          Sistema de Gestao - Prefeitura de Saquarema
        </p>
      </footer>
    </div>
  );
}
