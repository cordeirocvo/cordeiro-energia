"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, ListChecks, Activity } from "lucide-react";

// Helpers idênticos aos demais
function parseDateBR(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const numYear = parseInt(year, 10);
  const finalYear = numYear < 100 ? 2000 + numYear : numYear;
  return new Date(finalYear, parseInt(month, 10) - 1, parseInt(day, 10));
}

function getDaysDiff(targetDate: Date) {
  const diffTime = targetDate.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function KPIDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
     total: 0,
     finalizadas: 0,
     pendentes: 0,
     atrasoLeve: 0,  // < 40 && >= 20
     atrasoGrave: 0, // < 20
     emDia: 0,       // >= 40
     parecerCritico: 0 // < 30 dias
  });

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/instalacoes");
      if (!res.ok) return;
      const { data } = await res.json();

      let m = {
         total: 0, finalizadas: 0, pendentes: 0, 
         atrasoLeve: 0, atrasoGrave: 0, emDia: 0, parecerCritico: 0
      };

      data.forEach((item: any) => {
          // Ignorar vazios
          if (!item.cliente || item.cliente.trim() === '') return;
          m.total++;

          const instaladoStr = item.instalacao?.trim().toUpperCase();
          const statusStr = item.status?.trim().toUpperCase();
          const isConcluded = (statusStr === "FINALIZADO" || instaladoStr === "TRUE");

          if (isConcluded) {
              m.finalizadas++;
          } else {
              m.pendentes++;
              
              // Processar atrasos na Instalação Fotovoltaico
              const numDiaPrev = parseInt(item.diaPrev, 10);
              const d = isNaN(numDiaPrev) ? 999999 : numDiaPrev;
              
              if (d >= 40) m.emDia++;
              else if (d < 40 && d >= 20) m.atrasoLeve++;
              else if (d < 20) m.atrasoGrave++;

              // Processar Criticidade Parecer
              const dataParecer = parseDateBR(item.vencimentoParecer);
              if (dataParecer && getDaysDiff(dataParecer) < 30) {
                 m.parecerCritico++;
              }
          }
      });
      setMetrics(m);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center font-bold text-2xl text-brand-blue animate-pulse">Carregando painel de Indicadores...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
       <div className="max-w-7xl mx-auto">
          
          <div className="flex justify-between items-center mb-10 w-full border-b-4 border-brand-orange pb-4">
             <div>
                <h1 className="text-4xl font-extrabold text-brand-blue">Dashboard de Desempenho (KPI's)</h1>
                <p className="text-gray-500 font-medium tracking-wide mt-2">Visão Executiva • Cordeiro Energia</p>
             </div>
             <div className="flex space-x-4">
                 <a href="/admin" className="px-6 py-3 bg-white text-gray-600 font-bold rounded-lg shadow border hover:bg-gray-100 transition">← Voltar p/ Atividades</a>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             
             {/* Card Total */}
             <div className="bg-white rounded-2xl p-6 shadow-lg border-l-[6px] border-blue-500 flex items-center space-x-4">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                   <ListChecks className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Registradas</p>
                   <p className="text-4xl font-black text-blue-900 mt-1">{metrics.total}</p>
                </div>
             </div>

             {/* Card Concluidas */}
             <div className="bg-white rounded-2xl p-6 shadow-lg border-l-[6px] border-green-500 flex items-center space-x-4">
                <div className="p-4 bg-green-100 text-green-600 rounded-full">
                   <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Concluídas</p>
                   <p className="text-4xl font-black text-green-700 mt-1">{metrics.finalizadas}</p>
                   {metrics.total > 0 && <p className="text-sm font-bold text-green-600 mt-1">~{Math.round((metrics.finalizadas/metrics.total)*100)}% de taxa de conclusão</p>}
                </div>
             </div>

             {/* Card Abertas */}
             <div className="bg-white rounded-2xl p-6 shadow-lg border-l-[6px] border-orange-500 flex items-center space-x-4">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
                   <Activity className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Em Andamento</p>
                   <p className="text-4xl font-black text-orange-600 mt-1">{metrics.pendentes}</p>
                </div>
             </div>

             {/* Parecer Critico */}
             <div className="bg-red-50 rounded-2xl p-6 shadow-lg border-l-[6px] border-red-600 flex items-center space-x-4 relative overflow-hidden">
                <div className="p-4 bg-red-200 text-red-700 rounded-full relative z-10">
                   <AlertTriangle className="w-8 h-8 animate-pulse" />
                </div>
                <div className="relative z-10">
                   <p className="text-red-900 text-sm font-bold uppercase tracking-wider">Parecer Crítico (&lt;30d)</p>
                   <p className="text-4xl font-black text-red-600 mt-1">{metrics.parecerCritico}</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-50"></div>
             </div>
          </div>

          <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-6 text-gray-700">Diagnóstico da Operação (Saúde das Entregas)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="bg-white p-8 rounded-2xl shadow border flex flex-col items-center justify-center">
                 <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center relative mb-4">
                     <span className="text-4xl font-black text-green-600">{metrics.emDia}</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 text-center">No Prazo Saudável</h3>
                 <p className="text-gray-500 text-center mt-2 text-sm font-medium">Instalações com margem de 40+ dias</p>
             </div>

             <div className="bg-white p-8 rounded-2xl shadow border flex flex-col items-center justify-center">
                 <div className="w-32 h-32 rounded-full border-8 border-yellow-500 flex items-center justify-center relative mb-4">
                     <span className="text-4xl font-black text-yellow-600">{metrics.atrasoLeve}</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 text-center">Atenção (Margem Expirando)</h3>
                 <p className="text-gray-500 text-center mt-2 text-sm font-medium">Instalações c/ margem de 20 a 39 dias</p>
             </div>

             <div className="bg-white p-8 rounded-2xl shadow border flex flex-col items-center justify-center transform transition hover:scale-105">
                 <div className="w-32 h-32 rounded-full border-8 border-red-500 flex items-center justify-center relative mb-4 bg-red-50 shadow-inner">
                     <span className="text-4xl font-black text-red-600">{metrics.atrasoGrave}</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 text-center">Atrasos Críticos</h3>
                 <p className="text-gray-500 text-center mt-2 text-sm font-medium">Instalações com margem &lt; 20 dias ou data vencida (-)</p>
             </div>
          </div>
       </div>
    </div>
  );
}
