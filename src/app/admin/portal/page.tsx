"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const modules = [
  {
    group: "atividades",
    icon: "📋",
    color: "from-blue-700 to-blue-900",
    borderColor: "border-blue-500",
    title: "Atividades de Campo",
    description: "Acompanhe instalações, equipes e prazos em tempo real.",
    items: [
      { label: "Painel de Instalações", href: "/admin", icon: "🏗️", desc: "Todas as atividades e status" },
      { label: "KPIs e Dashboards", href: "/admin/kpis", icon: "📊", desc: "Indicadores de desempenho" },
      { label: "Usuários e Acessos", href: "/admin/usuarios", icon: "👥", desc: "Gerenciar usuários do sistema" },
      { label: "Status Customizados", href: "/admin/status", icon: "🏷️", desc: "Configurar tipos de status" },
    ],
  },
  {
    group: "engenharia",
    icon: "⚡",
    color: "from-orange-600 to-orange-800",
    borderColor: "border-orange-500",
    title: "Engenharia Elétrica",
    description: "Dimensionamentos, cálculos e relatórios técnicos conforme normas ABNT.",
    items: [
      { label: "Calculadora Elétrica", href: "/admin/calculadora", icon: "⚡", desc: "Cabos, queda de tensão, DPS, disjuntores, curto-circuito" },
      { label: "Fotovoltaico + BESS", href: "/admin/calculadora/bess", icon: "☀️🔋", desc: "Dimensionamento solar com armazenamento e análise de fatura" },
      { label: "Eletrodutos CA/CC", href: "/admin/calculadora/eletrodutos", icon: "🔩", desc: "Dimensionamento de eletrodutos conforme NBR 5410 e NBR 16690" },
      { label: "Média Tensão (MT)", href: "/admin/calculadora/media-tensao", icon: "🔌", desc: "Cabos 8.7/15kV — NBR 14039 + proteção" },
    ],
  },
];

export default function AdminPortal() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white font-sans">
      {/* HEADER */}
      <div className="px-6 pt-10 pb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-xl">
            <span className="text-2xl font-black text-white">CE</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black tracking-tight">Cordeiro Energia</h1>
            <p className="text-blue-300 text-sm">Painel Administrativo — Acesso Exclusivo</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Selecione um módulo para acessar. Todos os cálculos seguem normas ABNT vigentes.
        </p>
      </div>

      {/* MÓDULOS */}
      <div className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {modules.map(mod => (
          <div key={mod.group} className={`rounded-3xl border ${mod.borderColor} bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden`}>
            {/* Card Header */}
            <div className={`bg-gradient-to-r ${mod.color} px-6 py-5`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{mod.icon}</span>
                <div>
                  <h2 className="text-xl font-black">{mod.title}</h2>
                  <p className="text-white/70 text-sm">{mod.description}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="p-4 grid grid-cols-1 gap-3">
              {mod.items.map(item => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-left w-full transition-all duration-200
                    ${hoveredItem === item.href
                      ? "bg-white/20 shadow-lg scale-[1.02]"
                      : "bg-white/8 hover:bg-white/15"
                    }`}
                >
                  <span className="text-3xl flex-shrink-0 w-10 text-center">{item.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{item.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                  <span className="ml-auto text-slate-500 text-lg">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="text-center pb-8 text-slate-600 text-xs">
        Cordeiro Energia © {new Date().getFullYear()} — NBR 5410 • NBR 5419 • NBR 14039 • NBR 16690
      </div>
    </div>
  );
}
