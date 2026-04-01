"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function ConfigureStatusPage() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");

  const fetchStatuses = async () => {
    setLoading(true);
    const res = await fetch("/api/status");
    if (res.ok) {
        const { data } = await res.json();
        setStatuses(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const res = await fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() })
    });

    if (res.ok) {
       setNewLabel("");
       fetchStatuses();
    } else {
       alert("Erro ao criar (Talvez já exista).");
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Tem certeza que deseja apagar essa etiqueta?");
    if (!confirm) return;

    const res = await fetch(`/api/status/${id}`, { method: "DELETE" });
    if (res.ok) fetchStatuses();
    else alert("Falha ao apagar status.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
         <div className="flex justify-between items-center border-b-4 border-brand-orange pb-4 mb-8">
            <h1 className="text-4xl font-extrabold text-brand-blue">Gerenciador de Status</h1>
            <a href="/admin" className="px-6 py-2 bg-white text-gray-600 font-bold rounded shadow hover:bg-gray-100">Voltar p/ Atividades</a>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-xl border">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Criar Nova Etiqueta</h2>
            <form onSubmit={handleAdd} className="flex space-x-4 mb-8">
               <input 
                 autoFocus
                 required
                 value={newLabel}
                 onChange={e => setNewLabel(e.target.value)}
                 placeholder="Ex: Aguardando Parecer" 
                 className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-brand-orange" 
               />
               <button type="submit" className="bg-brand-orange text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-orange-600">Inserir Nível</button>
            </form>

            <h2 className="text-xl font-bold mb-4 text-gray-800 border-t pt-6">Status Ativos no Sistema</h2>
            {loading ? (
               <p className="animate-pulse">Buscando...</p>
            ) : statuses.length === 0 ? (
               <p className="text-gray-500 italic">Nenhum status padrão carregado. Você pode cadastrar acima.</p>
            ) : (
               <ul className="space-y-3">
                 {statuses.map(s => (
                    <li key={s.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg border">
                       <span className="font-bold text-gray-700">{s.label}</span>
                       <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 transition">
                          <Trash2 size={20} />
                       </button>
                    </li>
                 ))}
               </ul>
            )}
         </div>
         <p className="text-gray-400 text-sm mt-4 text-center">Nota: Apagar um Status não quebra as atividades antigas do banco, apenas remove do Menu Selecionável.</p>
      </div>
    </div>
  );
}
