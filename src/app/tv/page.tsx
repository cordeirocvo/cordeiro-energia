"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

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

export default function TVDashboard() {
  const [instalacoes, setInstalacoes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState("");

  const fetchData = async () => {
    const res = await fetch("/api/instalacoes");
    if (res.ok) {
        const { data } = await res.json();

        const filtrados = data.filter((item: any) => {
          if (!item.cliente || item.cliente.trim() === '') return false;
          const instaladoStr = item.instalacao?.trim().toUpperCase();
          const statusStr = item.status?.trim().toUpperCase();
          const isConcluded = (statusStr === "FINALIZADO" || instaladoStr === "TRUE");
          return !isConcluded;
        });

        const processados = filtrados.map((item: any) => {
          const numDiaPrev = parseInt(item.diaPrev, 10);
          const diaPrevNum = isNaN(numDiaPrev) ? 999999 : numDiaPrev;
          
          const dataParecer = parseDateBR(item.vencimentoParecer);
          const isCriticalParecer = dataParecer ? getDaysDiff(dataParecer) < 30 : false;

          return { ...item, diaPrevNum, isCriticalParecer };
        });

        processados.sort((a: any, b: any) => {
          if (a.isCriticalParecer && !b.isCriticalParecer) return -1;
          if (!a.isCriticalParecer && b.isCriticalParecer) return 1;
          return a.diaPrevNum - b.diaPrevNum;
        });

        setInstalacoes(processados);
    }

    fetch("/api/sync", { method: "POST" })
      .then(r => {
        if(r.ok) setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
      })
      .catch(e => console.error("Sync background error", e));
  };

  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, 180000); // 3 min
    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    if (instalacoes.length === 0) return;
    const slideInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 15 >= instalacoes.length ? 0 : prev + 15));
    }, 15000);
    return () => clearInterval(slideInterval);
  }, [instalacoes]);

  if (instalacoes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-8">
         <h1 className="text-4xl font-extrabold animate-pulse text-brand-orange mb-4">Carregando Painel Cordeiro Energia...</h1>
         <p className="text-gray-500 text-xl font-medium">Buscando e Descriptografando Planilha de Instalações...</p>
      </div>
    );
  }

  const currentBatch = instalacoes.slice(currentIndex, currentIndex + 15);
  const totalPages = Math.ceil(instalacoes.length / 15);
  const currentPage = Math.floor(currentIndex / 15) + 1;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8 flex flex-col font-sans overflow-hidden">
      {/* HEADER TELA TV CLEAN */}
      <div className="flex justify-between items-center mb-8 w-full border-b-[6px] border-brand-orange pb-6">
        <div>
          <h1 className="text-5xl font-black text-brand-blue uppercase drop-shadow-sm tracking-tight mb-2">
            Acompanhamento de <span className="text-brand-orange">Instalações</span>
          </h1>
          <p className="text-xl text-gray-500 font-bold tracking-widest uppercase">CORDEIRO ENERGIA - GESTÃO À VISTA</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono text-brand-blue font-extrabold bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-md">
            Pág {currentPage} / {totalPages}
          </p>
          <p className="text-sm font-bold text-gray-400 mt-3">Sincronizado: {lastSyncTime}</p>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <div className="grid grid-cols-12 gap-6 text-gray-400 font-extrabold uppercase text-xs tracking-wider mb-4 px-6">
          <div className="col-span-3">Cliente Operacional</div>
          <div className="col-span-4">Anotações Relevantes de Atendimento</div>
          <div className="col-span-2 text-center text-brand-blue">Prev. Instal. Fotovoltaico</div>
          <div className="col-span-2 text-center text-brand-orange">Prev. Instal. Outros Serviços</div>
          <div className="col-span-1 text-center">Venc. Parecer</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-4"
          >
            {currentBatch.map((item) => {
              // Semáforo Light Mode Clean
              let rowClass = "border-gray-300 bg-white text-gray-800";
              let badgeColor = "bg-gray-100 text-gray-700";
              const d = item.diaPrevNum;
              
              if (d >= 40) {
                 rowClass = "border-green-400 bg-green-50 hover:bg-green-100 text-green-900";
                 badgeColor = "bg-green-200 text-green-800 font-black border border-green-300 shadow-sm";
              } else if (d < 40 && d >= 20) {
                 rowClass = "border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-900";
                 badgeColor = "bg-yellow-200 text-yellow-800 font-black border border-yellow-400 shadow-sm";
              } else if (d < 20) {
                 rowClass = "border-red-500 bg-red-50 hover:bg-red-100 text-red-900";
                 badgeColor = "bg-red-200 text-red-800 font-black border border-red-500 shadow-sm";
              }

              const alertClass = item.isCriticalParecer ? "animate-pulse ring-4 ring-red-400/60 shadow-[0_0_20px_rgba(239,68,68,0.3)] !bg-red-50" : "";

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-6 items-center rounded-2xl p-4 shadow-lg border-l-[8px] transition-colors ${rowClass} ${alertClass}`}
                >
                  <div className="col-span-3 font-black text-xl uppercase truncate flex items-center space-x-3 tracking-tight" title={item.cliente}>
                    {d < 20 && (
                        <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                          <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
                        </motion.div>
                    )}
                    <span className="truncate">{item.cliente}</span>
                  </div>
                  
                  <div className="col-span-4 text-sm font-semibold text-gray-500 italic truncate pr-4" title={item.obsInstalacao}>
                    "{item.observacao || item.obsInstalacao || '-'}"
                  </div>

                  <div className="col-span-2 text-center text-lg font-bold text-gray-700">
                     {item.prevInstala || '-'}
                  </div>

                  <div className="col-span-2 text-center">
                     <span className={`px-5 py-2 rounded-xl text-xl ${badgeColor}`}>
                       {item.diaPrev || '-'}
                     </span>
                  </div>

                  <div className="col-span-1 text-center font-bold">
                     <span className={`px-3 py-2 block rounded-lg text-lg ${item.isCriticalParecer ? 'bg-red-500 text-white font-black shadow-lg' : 'bg-gray-100 border text-gray-600'}`}>
                       {item.vencimentoParecer || '-'}
                     </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 text-center text-gray-400 text-sm font-bold border-t border-gray-200 pt-4 uppercase tracking-widest flex justify-between px-8">
         <span>Exibindo {currentBatch.length} instalações abertas • Tecnologia Sistêmica Cordeiro Energia</span>
         <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); window.location.href = "/login"; }} className="text-gray-300 hover:text-red-500 transition cursor-pointer">Desconectar / Sair</button>
      </div>
    </div>
  );
}
