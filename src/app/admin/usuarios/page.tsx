"use client";
import { useEffect, useState } from "react";
import { Trash2, ShieldCheck, MonitorPlay, Users } from "lucide-react";

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/usuarios");
    if (res.ok) {
        const { data } = await res.json();
        setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    
    if (!payload.username || !payload.password || !payload.role) return;

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
       e.target.reset();
       fetchUsers();
    } else {
       alert("Erro ao criar (Talvez usuário já exista).");
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (username === 'admin') {
       alert("O usuário administrador principal original não pode ser apagado por segurança.");
       return;
    }

    const confirm = window.confirm(`Deseja apagar definitivamente o acesso do usuário: ${username}?`);
    if (!confirm) return;

    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
    else alert("Falha ao apagar usuário.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
         <div className="flex justify-between items-center border-b-4 border-brand-orange pb-6 mb-8 mt-4">
            <div>
               <h1 className="text-4xl font-extrabold text-brand-blue tracking-tight">Gerenciador de Acessos</h1>
               <p className="text-gray-500 mt-2 font-medium">Controle as senhas, perfis Nível TV, Administradores e Equipe de Campo.</p>
            </div>
            <a href="/admin" className="px-6 py-3 bg-white text-gray-600 font-bold rounded-lg border shadow-sm hover:bg-gray-100 transition whitespace-nowrap">Voltar p/ Dashboard</a>
         </div>

         <div className="bg-white p-8 rounded-2xl shadow-xl border">
            <h2 className="text-xl font-black mb-6 text-gray-800 border-b pb-2 uppercase tracking-wider text-brand-orange">Criar Novo Operador</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
               <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Nome de Login</label>
                  <input name="username" required placeholder="Ex: instalador01" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Senha Gerada</label>
                  <input name="password" required type="text" placeholder="Senha secreta..." className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Nível de Permissão</label>
                  <select name="role" required className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none font-bold text-gray-700 bg-white">
                      <option value="COMUM">Técnico / Equipe (Lobby de Envios)</option>
                      <option value="TV">Visualizador SmartTV (Só Leituras)</option>
                      <option value="ADMIN">Administrador Geral</option>
                  </select>
               </div>
               <div className="flex items-end">
                  <button type="submit" className="w-full bg-brand-blue text-white p-3 rounded-lg font-bold shadow hover:bg-blue-800 transition">Adicionar</button>
               </div>
            </form>

            <h2 className="text-xl font-black mb-6 text-gray-800 border-b pb-2 uppercase tracking-wider text-brand-orange">Credenciais Existentes e Cadastradas</h2>
            {loading ? (
               <p className="animate-pulse font-bold text-gray-500">Varrendo Banco de Dados de Segurança...</p>
            ) : users.length === 0 ? (
               <p className="text-gray-500 italic">Nenhum operador encontrado na base.</p>
            ) : (
               <div className="space-y-4">
                 {users.map(u => {
                    let Icon = Users;
                    let roleColor = "bg-gray-100 text-gray-600 border-gray-300";
                    let roleLabel = "Comum";

                    if (u.role === "ADMIN") {
                       Icon = ShieldCheck;
                       roleColor = "bg-red-50 text-red-700 border-red-300";
                       roleLabel = "Administrador Master";
                    } else if (u.role === "TV") {
                       Icon = MonitorPlay;
                       roleColor = "bg-blue-50 text-brand-blue border-blue-300";
                       roleLabel = "Monitor de SmartTV";
                    }

                    return (
                        <div key={u.id} className="flex justify-between items-center p-5 bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center space-x-4">
                               <div className={`p-3 rounded-full border ${roleColor}`}>
                                  <Icon className="w-6 h-6" />
                               </div>
                               <div>
                                  <p className="font-extrabold text-lg text-gray-800">{u.username}</p>
                                  <p className="text-sm font-semibold text-gray-400">Ativado sob Perfil de Segurança: {roleLabel}</p>
                               </div>
                            </div>
                            <button onClick={() => handleDelete(u.id, u.username)} title="Revogar Credencial" className="text-gray-400 hover:text-red-600 p-3 bg-gray-50 rounded-full hover:bg-red-100 transition">
                                <Trash2 size={24} />
                            </button>
                        </div>
                    )
                 })}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
