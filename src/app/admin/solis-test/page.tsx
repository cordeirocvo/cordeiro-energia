'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  LayoutDashboard,
  Clock,
  Database
} from 'lucide-react';

export default function SolisTestPage() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [config, setConfig] = useState<any>(null);
  const [data, setData] = useState<any>({ stations: [], inverters: [], alarms: [] });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/solis/config');
      if (res.ok) {
        const d = await res.json();
        setConfig(d);
        setLastSyncTime(d.lastSync);
      }
    } catch (e) {}
  };

  const handleSyncNow = async () => {
    setSyncStatus('loading');
    try {
      const res = await fetch('/api/solis/sync', { method: 'POST' });
      if (res.ok) {
        setSyncStatus('success');
        fetchConfig();
        // Recarregar dados também
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      setSyncStatus('error');
    }
  };

  const handleUpdateInterval = async (interval: number) => {
    try {
      const res = await fetch('/api/solis/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncInterval: interval, active: interval !== 0 })
      });
      if (res.ok) {
        fetchConfig();
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12 bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700/50 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
            <LayoutDashboard className="text-yellow-500" />
            Solis Cloud Monitoring
          </h1>
          <p className="text-neutral-400 mt-1">Ambiente de Teste e Integração de Dados Supabase</p>
        </div>
        
        <button 
          onClick={handleSyncNow}
          disabled={syncStatus === 'loading'}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-yellow-500/10 ${
            syncStatus === 'loading' 
            ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
            : 'bg-yellow-500 hover:bg-yellow-400 text-neutral-900 active:scale-95'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
          {syncStatus === 'loading' ? 'Sincronizando...' : 'Atualizar Agora'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configurações */}
        <div className="bg-neutral-800/40 p-6 rounded-2xl border border-neutral-700/50">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-400" />
            Configurações de Sync
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm text-neutral-400 block mb-3 uppercase tracking-wider font-bold">
                Intervalo de Atualização
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10, 15, 20, 30].map((interval) => (
                  <button
                    key={interval}
                    onClick={() => handleUpdateInterval(interval)}
                    className={`py-2 rounded-lg text-sm border transition-all ${
                      config?.syncInterval === interval 
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                      : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {interval} min
                  </button>
                ))}
                <button
                  onClick={() => handleUpdateInterval(0)}
                  className={`py-2 rounded-lg text-sm border col-span-3 transition-all ${
                    config?.syncInterval === 0 || !config?.active
                    ? 'bg-red-500/20 border-red-500 text-red-400' 
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                  }`}
                >
                  Não Atualizar Automaticamente
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Último Sync:</span>
                <span className="text-neutral-200 font-mono">
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleString('pt-BR') : 'Nunca'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status e Logs Rápidos */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Dashboard Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-800/40 p-6 rounded-2xl border border-neutral-700/50 flex flex-col items-center">
              <Database className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-2xl font-bold">--</span>
              <span className="text-xs text-neutral-500 uppercase">Usinas</span>
            </div>
            <div className="bg-neutral-800/40 p-6 rounded-2xl border border-neutral-700/50 flex flex-col items-center">
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <span className="text-2xl font-bold">--</span>
              <span className="text-xs text-neutral-500 uppercase">Geração Hoje</span>
            </div>
            <div className="bg-neutral-800/40 p-6 rounded-2xl border border-neutral-700/50 flex flex-col items-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
              <span className="text-2xl font-bold">--</span>
              <span className="text-xs text-neutral-500 uppercase">Alarmes</span>
            </div>
          </div>

          {/* Placeholder for Data visualization */}
          <div className="bg-neutral-800/40 p-6 rounded-2xl border border-neutral-700/50 h-[300px] flex items-center justify-center">
             <div className="text-center">
                <Clock className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500 italic">Os dados sincronizados da Solis aparecerão aqui após o primeiro sync.</p>
             </div>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto mt-12 text-center text-neutral-600 text-sm">
        <p>Conectado à API Solis Cloud (v13333) • Exportação Direta via Prisma para Supabase</p>
      </div>

      {/* Floating Alert for Success/Error */}
      {syncStatus === 'success' && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
           <CheckCircle />
           Dados sincronizados com sucesso!
        </div>
      )}
      {syncStatus === 'error' && (
        <div className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
           <AlertTriangle />
           Erro ao sincronizar. Verifique as credenciais no .env
        </div>
      )}
    </div>
  );
}
