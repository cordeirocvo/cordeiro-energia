"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Search, Filter, Settings, Users, LogOut, PlusCircle, X } from "lucide-react";

// Helpers
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

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); 
    reader.onerror = error => reject(error);
});

export default function AdminPage() {
  const [instalacoes, setInstalacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // UI States
  const [selectedInstalacao, setSelectedInstalacao] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [showNovaAtividade, setShowNovaAtividade] = useState(false);
  const [savingNova, setSavingNova] = useState(false);

  // Filtros Globais
  const [pesquisaCliente, setPesquisaCliente] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  // Estado do Formulário Controlado
  const [formValues, setFormValues] = useState<any>({});

  // Efeito para sincronizar selectedInstalacao com o formulário controlado
  useEffect(() => {
    if (selectedInstalacao) {
      setFormValues({ ...selectedInstalacao });
    } else {
      setFormValues({});
    }
  }, [selectedInstalacao]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const fetchInstalacoes = async () => {
    setLoading(true);
    // Adicionado ?t para evitar cache do navegador
    const res = await fetch(`/api/instalacoes?t=${Date.now()}`);
    if (res.ok) {
        const { data } = await res.json();
        
        // Filtragem (apenas pendentes)
        const filtrados = data.filter((item: any) => {
          if (!item.cliente || item.cliente.trim() === '') return false;
          
          const instaladoStr = item.instalacao?.trim().toUpperCase();
          const statusStr = item.status?.trim().toUpperCase();
          
          // Lógica definita de finalização (Filtra de Admin e TV)
          const isConcluded = (
            statusStr === "FINALIZADO" || 
            statusStr === "FINALIZADA" || 
            statusStr === "CONCLUIDO" || 
            statusStr === "CONCLUÍDO" || 
            statusStr === "CONCLUIDA" || 
            statusStr === "CONCLUÍDA" || 
            instaladoStr === "TRUE" || 
            instaladoStr === "SIM"
          );
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
    setLoading(false);
  };

  const loadStatusOptions = async () => {
    const res = await fetch("/api/status");
    if(res.ok) {
      const { data } = await res.json();
      setStatusOptions(data);
    }
  };

  useEffect(() => {
    fetchInstalacoes();
    loadStatusOptions();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.ok) {
        alert("Sincronização com Google concluída com sucesso!");
        fetchInstalacoes();
      } else {
        alert("Erro na sincronização.");
      }
    } catch (e) {
      alert("Erro crítico na sincronização Google.");
    }
    setSyncing(false);
  };

  const handleNovaAtividade = async (e: any) => {
    e.preventDefault();
    setSavingNova(true);
    const formData = new FormData(e.target);
    const payload: any = Object.fromEntries(formData);

    const fotoFile = e.target.foto?.files[0];
    if (fotoFile) {
      const reader = new FileReader();
      payload.anexoFotos = await new Promise((res, rej) => {
        reader.readAsDataURL(fotoFile);
        reader.onload = () => res((reader.result as string).split(',')[1]);
        reader.onerror = rej;
      });
    }

    try {

      const res = await fetch('/api/publico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Atividade registrada com sucesso!');
        setShowNovaAtividade(false);
        e.target.reset();
        fetchInstalacoes();
      } else {
        alert('Erro ao registrar atividade.');
      }
    } catch {
      alert('Erro de conexão.');
    }
    setSavingNova(false);
  };

  const handleUpdate = async (e: any) => {
      e.preventDefault();
      setSaving(true);
      
      const dataUpdate = { ...formValues };
      
      const fotosFile = e.target.anexoFotos?.files[0];
      if (fotosFile) dataUpdate.anexoFotos = await toBase64(fotosFile);
      else delete dataUpdate.anexoFotos;

      // Log para depuração local
      console.log("=== INÍCIO DO SALVAMENTO ===");
      console.log("STATUS SENDO ENVIADO:", dataUpdate.status);
      console.log("DADOS COMPLETOS:", dataUpdate);

      const arquivosFile = e.target.anexoArquivos?.files[0];
      if (arquivosFile) dataUpdate.anexoArquivos = await toBase64(arquivosFile);
      else delete dataUpdate.anexoArquivos;

      try {
          const res = await fetch(`/api/instalacoes/${selectedInstalacao.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dataUpdate)
          });

          if (res.ok) {
              alert("Salvo com sucesso!");
              setSelectedInstalacao(null);
              fetchInstalacoes();
          } else {
              alert("Erro ao salvar no banco local.");
          }
      } catch(err) {
          alert("Erro de conexão com servidor interno ao salvar.");
      }
      setSaving(false);
  };

  const hojeFormatado = new Date().toISOString().split("T")[0];

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleSolisAccess = () => {
    const pass = prompt("Digite a senha de acesso técnico:");
    if (pass === "a123") {
      window.location.href = "/admin/solis-test";
    } else if (pass !== null) {
      alert("Senha incorreta.");
    }
  };

  // Filtragem Dinâmica da Tabela
  const instalacoesFiltradas = instalacoes.filter(item => {
     const mathCliente = item.cliente.toLowerCase().includes(pesquisaCliente.toLowerCase());
     const matchStatus = filtroStatus === "" || (item.status && item.status.toLowerCase().includes(filtroStatus.toLowerCase()));
     return mathCliente && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-[1500px] mx-auto">
        
        {/* NAV BAR INTERNA */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md mb-8 border border-gray-200">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
               <div className="bg-white p-2 rounded-lg shadow-sm border">
                  <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
               </div>
               <h1 className="text-3xl font-extrabold text-brand-blue tracking-tight">
                  Painel <span className="text-brand-orange">Administrativo</span>
               </h1>
            </div>
            
            <div className="flex flex-wrap gap-3">
                <a href="/admin/kpis" className="flex items-center text-sm font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm hover:bg-blue-100 transition">
                    📊 Dashboards KPIs
                </a>
                <a href="/admin/calculadora" className="flex items-center text-sm font-bold bg-yellow-50 text-yellow-700 px-4 py-2 rounded shadow-sm hover:bg-yellow-100 transition">
                    ⚡ Calculadora Elétrica
                </a>
                <a href="/admin/status" className="flex items-center text-sm font-bold bg-gray-100 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-200 transition">
                    <Settings className="w-4 h-4 mr-2" /> Status Customizados
                </a>
                <a href="/admin/usuarios" className="flex items-center text-sm font-bold bg-gray-100 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-200 transition">
                    <Users className="w-4 h-4 mr-2" /> Senhas e Acessos
                </a>
                <button onClick={() => setShowNovaAtividade(true)} className="flex items-center text-sm bg-green-600 text-white px-4 py-2 rounded shadow font-bold hover:bg-green-700 transition">
                    <PlusCircle className="w-4 h-4 mr-2" /> Nova Atividade
                </button>
                <button onClick={handleSync} disabled={syncing} className="flex items-center text-sm bg-brand-orange text-white px-4 py-2 rounded shadow font-bold hover:bg-orange-600 transition disabled:opacity-50">
                    {syncing ? '🔄 Baixando...' : '🔄 Sincronizar Google'}
                </button>
                <button onClick={handleLogout} className="flex items-center text-sm bg-red-100 text-red-600 px-4 py-2 rounded shadow-sm font-bold hover:bg-red-200 transition">
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                </button>
                <a href="/" className="flex items-center text-sm bg-brand-blue text-white px-4 py-2 rounded shadow font-bold hover:bg-blue-800 transition">
                    🏠 Voltar ao Portal
                </a>
                {/* Botão Oculto Solis */}
                <button 
                  onClick={handleSolisAccess}
                  className="w-2 h-2 bg-transparent hover:bg-gray-200 rounded-full ml-1 opacity-10 hover:opacity-100 transition-opacity"
                  title="Configurações Técnicas"
                />
            </div>
        </div>

        {/* BARRA DE PESQUISA SUPERIOR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
             <div className="relative flex-1">
                 <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                 <input 
                    type="text" 
                    placeholder="Busca Global no Banco de Dados (Qualquer Cliente)..." 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-gray-700 shadow-inner"
                    value={pesquisaCliente}
                    onChange={(e) => setPesquisaCliente(e.target.value)}
                 />
             </div>
             
             <div className="relative w-full md:w-64">
                 <Filter className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                 <select 
                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-brand-blue bg-white appearance-none"
                   value={filtroStatus}
                   onChange={(e) => setFiltroStatus(e.target.value)}
                 >
                    <option value="">Todos os Status</option>
                    {statusOptions.map(o => (
                       <option key={o.id} value={o.label}>{o.label}</option>
                    ))}
                 </select>
             </div>
        </div>

        {/* TABELA DE DADOS */}
        {loading ? (
          <div className="flex justify-center p-12">
             <p className="text-xl animate-pulse font-bold text-gray-400">Descriptografando banco de dados local...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                          <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                              <th className="p-4 border-b">Ação Rápida</th>
                              <th className="p-4 border-b">Cliente Encontrado</th>
                              <th className="p-4 border-b text-center">Prev. Instalação</th>
                              <th className="p-4 border-b">Vencimento Parecer</th>
                              <th className="p-4 border-b">Status / Vendedor</th>
                          </tr>
                      </thead>
                      <tbody>
                          {instalacoesFiltradas.length === 0 && (
                              <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Nenhuma atividade condiz com esse filtro.</td></tr>
                          )}
                          {instalacoesFiltradas.map((item) => {
                              // Cores Semáforo UI Clean
                              let rowClass = "hover:bg-gray-50";
                              let badgeColor = "bg-gray-200 text-gray-800";
                              const d = item.diaPrevNum;
                              
                              if (d >= 40) {
                                  rowClass = "hover:bg-green-50";
                                  badgeColor = "bg-green-100 text-green-800 font-bold border border-green-300";
                              } else if (d < 40 && d >= 20) {
                                  rowClass = "hover:bg-yellow-50 bg-yellow-50/20";
                                  badgeColor = "bg-yellow-200 text-yellow-900 font-bold border border-yellow-400";
                              } else if (d < 20) {
                                  rowClass = "hover:bg-red-50 bg-red-50/40";
                                  badgeColor = "bg-red-200 text-red-900 font-bold border border-red-500 shadow-sm";
                              }

                              const pulseClass = item.isCriticalParecer ? "animate-pulse border-l-4 border-l-brand-orange bg-orange-50/50" : "";

                              return (
                                  <tr key={item.id} className={`${rowClass} ${pulseClass} border-b transition-colors`}>
                                      <td className="p-4 w-32">
                                          <button 
                                            onClick={() => setSelectedInstalacao(item)}
                                            className="bg-brand-blue text-white text-xs uppercase font-extrabold px-4 py-2 rounded-md shadow hover:bg-blue-800 w-full"
                                          >
                                              ABRIR FORMULÁRIO
                                          </button>
                                      </td>
                                      <td className="p-4 font-bold max-w-xs truncate text-gray-700" title={item.cliente}>
                                         <div className="flex items-center space-x-2">
                                           {item.isCriticalParecer && <AlertTriangle className="text-brand-orange w-5 h-5 flex-shrink-0" />}
                                           <span>{item.cliente}</span>
                                         </div>
                                      </td>
                                      <td className="p-4 text-center">
                                          <span className={`px-3 py-1 rounded-full text-sm ${badgeColor}`}>
                                            {item.diaPrev || '-'}
                                          </span>
                                      </td>
                                      <td className="p-4 font-semibold text-gray-600 text-sm">
                                          {item.vencimentoParecer || '-'}
                                      </td>
                                      <td className="p-4">
                                          <p className="font-bold text-gray-800 text-xs truncate max-w-[200px]">{item.status || 'Não Iniciado'}</p>
                                          <p className="text-gray-400 text-xs truncate max-w-[200px]">{item.vendedorOriginal || '-'}</p>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
        )}
      </div>

      {selectedInstalacao && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              {/* Modal Card Clean UI */}
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
                  
                  <div className="flex justify-between items-center p-6 border-b bg-brand-blue text-white rounded-t-2xl sticky top-0 z-10 shadow-sm">
                      <div>
                        <h2 className="text-2xl font-black tracking-wide uppercase">{selectedInstalacao.cliente}</h2>
                        <p className="text-sm text-blue-100 font-medium mt-1">
                          Vencimento Parecer: <span className={selectedInstalacao.isCriticalParecer ? "text-brand-orange font-extrabold" : "text-white font-bold"}>{selectedInstalacao.vencimentoParecer || 'N/A'}</span>
                        </p>
                      </div>
                      <button onClick={() => setSelectedInstalacao(null)} className="text-white hover:text-red-300 bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl transition-colors">X</button>
                  </div>

                  <form 
                    key={selectedInstalacao.id} 
                    onSubmit={handleUpdate} 
                    className="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50"
                  >
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                          <div>
                            <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Previsão Instalação</span>
                            <span className="font-bold text-gray-700">{selectedInstalacao.diaPrev}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Obs Planilha Original</span>
                            <span className="font-semibold text-gray-700 truncate block">{selectedInstalacao.obsInstalacao || '-'}</span>
                          </div>
                          <div>
                            <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Vendedor Nativo</span>
                            <span className="font-semibold text-gray-700 truncate block">{selectedInstalacao.vendedorOriginal || '-'}</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-bold text-brand-blue mb-1">Status Dinâmico (Configurável)</label>
                                  <select 
                                    name="status" 
                                    value={formValues.status || ""} 
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 border p-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-brand-blue text-gray-700 font-bold"
                                  >
                                      <option value="">Aguardando Inicio</option>
                                      {statusOptions.map(opt => (
                                          <option key={opt.id} value={opt.label}>{opt.label}</option>
                                      ))}
                                      {!statusOptions.find(o => o.label.toUpperCase() === "FINALIZADO") && (
                                        <option value="Finalizado">Finalizado</option>
                                      )}
                                  </select>
                              </div>
                              
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Solicitação Ativa</label>
                                  <input 
                                    name="solicitacao" 
                                    value={formValues.solicitacao || ""} 
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 border p-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-brand-orange" 
                                  />
                              </div>

                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Vendedor Substituto</label>
                                  <input 
                                    name="vendedor" 
                                    value={formValues.vendedor || formValues.vendedorOriginal || ""} 
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 border p-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-brand-orange" 
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Data Solicitação</label>
                                    <input 
                                      type="date" 
                                      name="dataSolicitacao" 
                                      value={formValues.dataSolicitacao ? new Date(formValues.dataSolicitacao).toISOString().split('T')[0] : hojeFormatado} 
                                      onChange={handleInputChange}
                                      className="w-full border-gray-300 border p-3 rounded-lg bg-white shadow-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Data Prevista</label>
                                    <input 
                                      type="date" 
                                      name="dataPrevista" 
                                      value={formValues.dataPrevista || ""} 
                                      onChange={handleInputChange}
                                      className="w-full border-gray-300 border p-3 rounded-lg bg-white shadow-sm" 
                                    />
                                </div>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Telefone Cliente (WhatsApp)</label>
                                  <input 
                                    name="telefoneCliente" 
                                    value={formValues.telefoneCliente || formValues.telefoneOriginal || ""} 
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 border p-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-brand-orange" 
                                  />
                              </div>

                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Local / Cidade Base</label>
                                  <input 
                                    name="cidade" 
                                    value={formValues.cidade || formValues.cidadeOriginal || ""} 
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 border p-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-brand-orange" 
                                  />
                              </div>

                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Anotações Relevantes de Atendimento</label>
                                  <textarea 
                                    name="observacao" 
                                    value={formValues.observacao || ""} 
                                    onChange={handleInputChange}
                                    rows={4} 
                                    className="w-full border-gray-300 border p-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-brand-orange focus:outline-none" 
                                    placeholder="Digite os diários de obra..."
                                  ></textarea>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-200 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
                          <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">📸 Substítuir Anexo de Imagem (Opcional)</label>
                            <input name="anexoFotos" type="file" accept="image/*" capture="environment" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-brand-blue hover:file:bg-gray-200 cursor-pointer" />
                            {selectedInstalacao.anexoFotos && <p className="text-xs text-green-600 mt-2 font-bold">✓ Uma fotografia já está salva digitalmente no banco.</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">📁 Substituir Cópia Arquivo Documental</label>
                            <input name="anexoArquivos" type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
                            {selectedInstalacao.anexoArquivos && <p className="text-xs text-green-600 mt-2 font-bold">✓ PDF ou Arquivo Documental já ancorado na nuvem.</p>}
                          </div>
                      </div>

                      <div className="sticky bottom-0 bg-gray-50 pt-4 border-t border-gray-200 mt-6 flex justify-end">
                          <button type="button" onClick={() => setSelectedInstalacao(null)} className="mr-4 px-6 py-3 font-bold text-gray-400 hover:text-gray-600">Voltar sem Salvar</button>
                          <button type="submit" disabled={saving} className="bg-brand-blue hover:bg-blue-800 text-white font-extrabold py-3 px-8 rounded-lg shadow-md transition transform hover:-translate-y-1 disabled:opacity-50">
                              {saving ? 'Criptografando para Nuvem...' : 'Salvar Cliente'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL NOVA ATIVIDADE */}
      {showNovaAtividade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b bg-brand-blue text-white rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-black tracking-wide uppercase">Nova Atividade</h2>
                <p className="text-sm text-blue-100 mt-1">Registre uma nova instalação ou solicitação</p>
              </div>
              <button onClick={() => setShowNovaAtividade(false)} className="text-white hover:text-red-300 bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNovaAtividade} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cliente *</label>
                  <input name="cliente" required placeholder="Nome Completo / Empresa" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cidade *</label>
                  <input name="cidade" required placeholder="Cidade da instalação" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Endereço</label>
                  <input name="endereco" placeholder="Rua, Número, Bairro" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Telefone / WhatsApp *</label>
                  <input name="telefone" type="tel" required placeholder="(00) 00000-0000" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Solicitação / Observações *</label>
                <textarea name="solicitacao" rows={3} required placeholder="Descreva os detalhes da tarefa..." className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"></textarea>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <label className="block text-sm font-bold text-gray-700 mb-2">📸 Anexar Foto (opcional)</label>
                <input name="foto" type="file" accept="image/*" className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-800" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data da Solicitação</label>
                <input name="dataSolicitacao" type="date" defaultValue={hojeFormatado} className="w-full border p-3 rounded-lg bg-gray-50" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t">
                <button type="button" onClick={() => setShowNovaAtividade(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
                <button type="submit" disabled={savingNova} className="bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 px-8 rounded-lg shadow-md transition disabled:opacity-50">
                  {savingNova ? 'Salvando...' : '✓ Registrar Atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
