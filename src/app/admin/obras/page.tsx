"use client";
import React, { useState, useEffect } from "react";

export default function RelatorioObrasDashboard() {
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/obras")
      .then(res => res.json())
      .then(data => {
        setObras(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "Calibri, sans-serif" }}>
      <header style={{ borderBottom: "3px solid #2980b9", paddingBottom: "10px", marginBottom: "30px" }}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>📊 Evolução de Obras</h1>
        <p style={{ margin: 0, color: "#7f8c8d" }}>Acompanhamento em Tempo Real das Metas de Campo</p>
      </header>

      {loading ? (
        <p>Sincronizando Projetos Dashboard...</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {obras.length === 0 ? (
            <p>Nenhum projeto cadastrado.</p>
          ) : (
             obras.map(obra => {
               const total = obra.ordensServico?.length || 0;
               const finalizadas = obra.ordensServico?.filter((o:any) => o.status === "FINALIZADA").length || 0;
               const pct = total > 0 ? Math.round((finalizadas / total) * 100) : 0;
               return (
                 <div key={obra.id} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ecf0f1", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <strong>{obra.nome}</strong>
                        <span style={{ fontWeight: "bold", color: "#2980b9" }}>{pct}%</span>
                    </div>
                    <div style={{ width: "100%", height: "10px", backgroundColor: "#ecf0f1", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#27ae60" }} />
                    </div>
                 </div>
               )
             })
          )}
        </div>
      )}
    </div>
  );
}
