"use client";
import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function MobileAppTecnico() {
  const [mounted, setMounted] = useState(false);
  const [ordens, setOrdens] = useState<any[]>([]);
  const [selectedOS, setSelectedOS] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const signatureRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/os?status=PENDENTE")
      .then(res => res.json())
      .then(data => {
        setOrdens(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!mounted) return <div style={{ padding: "20px" }}>🔋 Fortalecendo conexão...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1e272e", color: "#fff", fontFamily: "sans-serif", padding: "15px" }}>
      <header style={{ borderBottom: "2px solid #fbc531", paddingBottom: "10px", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#fbc531" }}>⚙️ Cordeiro Service Mobile</h2>
        <p style={{ margin: 0, fontSize: "12px", color: "#7f8fa6" }}>Operacional de Campo v1.0</p>
      </header>

      {loading ? (
        <p>Carregando tarefas...</p>
      ) : !selectedOS ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ color: "#fbc531" }}>Minhas Ordens de Serviço</h4>
          {ordens.map((os: any) => (
            <div key={os.id} onClick={() => setSelectedOS(os)} style={{ backgroundColor: "#2f3640", padding: "15px", borderRadius: "10px", border: "1px solid #7f8fa6" }}>
              <strong style={{ display: "block" }}>OS #{os.numeroOS}</strong>
              <span style={{ fontSize: "14px", color: "#dcdde1" }}>{os.obra?.nome}</span>
              <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#7f8fa6" }}>{os.servicoEscopo}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedOS(null)} style={{ background: "none", border: "none", color: "#fbc531", fontSize: "14px", marginBottom: "20px", cursor: "pointer" }}>← VOLTAR</button>
          <div style={{ backgroundColor: "#2f3640", padding: "20px", borderRadius: "10px", border: "1px solid #fbc531" }}>
            <h3>Executar OS #{selectedOS.numeroOS}</h3>
            <p style={{ fontSize: "14px", color: "#dcdde1", marginBottom: "20px" }}>{selectedOS.servicoEscopo} - {selectedOS.obra?.nome}</p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "10px", color: "#fbc531" }}>✍️ Assinatura do Cliente</label>
              <div style={{ backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden", minHeight: "150px" }}>
                <SignatureCanvas 
                  ref={signatureRef} 
                  penColor="#2c3e50" 
                  canvasProps={{ width: 350, height: 150, className: "sigCanvas" }} 
                />
              </div>
              <button onClick={() => signatureRef.current?.clear()} style={{ background: "none", border: "none", color: "#7f8fa6", fontSize: "12px", marginTop: "5px" }}>Limpar</button>
            </div>

            <button style={{ width: "100%", padding: "15px", backgroundColor: "#fbc531", color: "#2f3640", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px" }}>
              FINALIZAR E ENVIAR RELATÓRIO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
