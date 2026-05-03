"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  pergunta: string;
  resposta: string;
}

const faqs: FAQ[] = [
  {
    pergunta: "Como solicitar uniformes escolares?",
    resposta:
      "Acesse o menu principal e clique em 'Solicitar Uniformes'. Preencha os dados do solicitante (nome, matricula e instituicao) e adicione os uniformes desejados informando tipo, genero, tamanho e quantidade. Apos preencher, clique em 'Enviar Solicitacao'.",
  },
  {
    pergunta: "Como solicitar kits escolares?",
    resposta:
      "No menu principal, clique em 'Solicitar Kits'. Preencha seus dados e selecione os kits desejados (Kit Aluno, Mochila, Kit Polo Professor) com os tamanhos e quantidades necessarios. Envie a solicitacao clicando no botao correspondente.",
  },
  {
    pergunta: "Como solicitar itens de almoxarifado?",
    resposta:
      "Acesse 'Solicitar Almoxarifado' no menu principal. Preencha seus dados e adicione os itens de papelaria e/ou cozinha necessarios. Voce pode adicionar multiplos itens clicando no botao 'Adicionar Item' em cada secao.",
  },
  {
    pergunta: "Como solicitar patrimonio?",
    resposta:
      "Clique em 'Solicitar Patrimonio' no menu principal. Informe seus dados, selecione o tipo de patrimonio desejado (mobiliario, equipamento, etc.) e a quantidade. A solicitacao sera encaminhada para a equipe de patrimonio.",
  },
  {
    pergunta: "Como fazer uma transferencia de itens?",
    resposta:
      "Acesse 'Transferencia de Itens' e preencha os dados da unidade de origem e destino, incluindo responsaveis e matriculas. Informe o numero TMBP/PMS, a situacao do item e adicione os itens com seus respectivos numeros de patrimonio e descricoes.",
  },
  {
    pergunta: "Como consultar o inventario anual?",
    resposta:
      "Acesse 'Inventario Anual' no menu principal. Digite o nome da instituicao de ensino e selecione o ano desejado. Clique em 'Buscar' para visualizar todas as solicitacoes de patrimonio. Voce tambem pode exportar os dados em formato CSV ou PDF.",
  },
  {
    pergunta: "Qual o prazo para atendimento das solicitacoes?",
    resposta:
      "O prazo para atendimento das solicitacoes varia conforme o tipo. Solicitacoes de uniformes e kits escolares sao atendidas conforme a disponibilidade em estoque. Solicitacoes de almoxarifado e patrimonio possuem prazos de acordo com a demanda e disponibilidade orcamentaria.",
  },
  {
    pergunta: "Como acompanhar o status de uma solicitacao?",
    resposta:
      "O acompanhamento pode ser feito pelo chat disponivel na pagina principal (icone no canto inferior direito). Informe seu nome e instituicao para iniciar uma conversa com a equipe de patrimonio. Voce tambem pode verificar o status pelo inventario anual.",
  },
  {
    pergunta: "Como entrar em contato com a equipe de patrimonio?",
    resposta:
      "Utilize o chat disponivel na pagina principal (icone de mensagem no canto inferior direito). Preencha seus dados e envie sua mensagem. A equipe respondera o mais breve possivel durante o horario de atendimento.",
  },
  {
    pergunta: "Posso cancelar uma solicitacao ja enviada?",
    resposta:
      "Para cancelar uma solicitacao, entre em contato com a equipe de patrimonio pelo chat na pagina principal. Informe o numero da solicitacao e o motivo do cancelamento. A equipe avaliara a possibilidade de cancelamento.",
  },
];

export default function DuvidasPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Blue Header */}
      <div className="bg-[#111c44] text-white py-4 px-6 flex items-center justify-center gap-3 animate-fade-in-down">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-scale-in">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold tracking-wide">DUVIDAS FREQUENTES</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#111c44] mb-6 hover:underline text-sm font-medium transition-all duration-300 hover:-translate-x-1 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="space-y-3 stagger-children">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[#e2e8f0] border-b border-b-transparent shadow-xl shadow-[#0fb992]/40 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-[#1e293b] pr-4">
                  {faq.pergunta}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#111c44] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#94a3b8] shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 -mt-1">
                  <div className="h-px bg-[#e2e8f0] mb-3" />
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {faq.resposta}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div className="mt-8 bg-white rounded-2xl border border-[#d1d5db] overflow-hidden">
          <div className="px-5 py-5 text-center">
            <h3 className="text-sm font-bold text-[#1e293b] mb-2">
              Nao encontrou o que procurava?
            </h3>
            <p className="text-sm text-[#64748b] mb-4">
              Entre em contato com a equipe de patrimonio pelo chat na pagina
              principal ou envie um e-mail para atendimento.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#111c44] hover:bg-[#0e1735] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Ir para o Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
