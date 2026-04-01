"use client";
import { useState } from "react";

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); 
    reader.onerror = error => reject(error);
});

export default function PublicForm() {
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const hoje = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: any) => {
      e.preventDefault();
      setSaving(true);
      setSuccessMsg("");
      
      const formData = new FormData(e.target);
      const payload: any = Object.fromEntries(formData);
      
      // Upload handle
      const fotosFile = e.target.foto?.files[0];
      if (fotosFile) payload.anexoFotos = await toBase64(fotosFile);

      const arquivosFile = e.target.arquivo?.files[0];
      if (arquivosFile) payload.anexoArquivos = await toBase64(arquivosFile);

      try {
          const res = await fetch(`/api/publico`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });

          if (res.ok) {
              setSuccessMsg("Atividade registrada com sucesso! Ela já consta no nosso painel.");
              e.target.reset(); // limpa formulário
          } else {
              alert("Ocorreu um erro ao enviar.");
          }
      } catch(err) {
          alert("Erro de conexão ao enviar atividade.");
      }
      setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg flex justify-end mb-2">
         <button onClick={() => { document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = "/login"; }} className="text-gray-500 font-bold hover:text-red-600">Sair do Sistema</button>
      </div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border-t-8 border-brand-orange overflow-hidden">
        
        <div className="bg-brand-blue p-6 text-center">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Cordeiro Energia</h1>
            <p className="text-blue-200 text-sm mt-1">Registrar Nova Atividade / Vistoria</p>
        </div>

        <div className="p-6 sm:p-8">
            {successMsg && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center font-bold">
                    ✓ {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cliente</label>
                    <input name="cliente" required className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange" placeholder="Nome Completo / Empresa" />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cidades</label>
                    <input name="cidade" required className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange" placeholder="Cidade da instalação" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Endereço Completo</label>
                    <input name="endereco" className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange" placeholder="Rua, Número, Bairro" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                    <input name="telefone" type="tel" required className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange" placeholder="(00) 00000-0000" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Solicitação / Observações Iniciais</label>
                    <textarea name="solicitacao" rows={3} required className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange" placeholder="Descreva os detalhes da tarefa ou apontamentos..."></textarea>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg border">
                    <label className="block text-sm font-bold text-gray-700 mb-2">📸 Anexar Foto (Tirar foto ou Galeria)</label>
                    <input name="foto" type="file" accept="image/*" capture="environment" className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-800" />
                </div>

                <div className="bg-gray-100 p-4 rounded-lg border">
                    <label className="block text-sm font-bold text-gray-700 mb-2">📁 Anexar Arquivos Variados</label>
                    <input name="arquivo" type="file" className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-300 file:text-gray-700" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Data da Solicitação</label>
                    <input name="dataSolicitacao" type="date" required defaultValue={hoje} className="w-full border p-3 rounded-lg shadow-sm bg-gray-50" />
                </div>

                <button type="submit" disabled={saving} className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-4 rounded-lg shadow-md transition-all text-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Enviando Dados...' : 'Registrar na Base'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
