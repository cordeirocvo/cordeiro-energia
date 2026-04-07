"use client";
import React, { useState, useEffect } from "react";

export default function GestaoOrdensServico() {
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOSModal, setShowOSModal] = useState(false);
  const [obrasList, setObrasList] = useState<any[]>([]);

  // Form State
  const [form, setForm] = useState({
    obraId: "NOVA", cliente: "", endereco: "", telefone: "", tarefa: "", dataPrevista: ""
  });
  const [editForm, setEditForm] = useState<any>(null);

  const carregarOS = () => {
    setLoading(true);
    fetch("/api/os")
      .then((res) => res.json())
      .then((data) => {
        setOrdens(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const carregarObras = () => {
    fetch("/api/obras")
      .then((res) => res.json())
      .then((data) => setObrasList(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    carregarOS();
    carregarObras();
  }, []);

  const handleGerarOS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/os", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if(res.ok) {
        setShowOSModal(false);
        carregarOS();
        setForm({ obraId: "NOVA", cliente: "", endereco: "", telefone: "", tarefa: "", dataPrevista: "" });
        alert("🎉 Nova O.S. Mágica Gerada e Enviada para Campo!");
      }
    } catch (e) {
      alert("Erro ao criar a OS.");
    }
  };

  const handleUpdateOS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/os/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if(res.ok) {
        setEditForm(null);
        carregarOS();
        alert("✅ O.S. Atualizada com Sucesso!");
      }
    } catch (e) {
      alert("Erro ao atualizar a OS.");
    }
  };

  const handleExcluirOS = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir esta O.S.?")) return;
    try {
      const res = await fetch(`/api/os/${id}`, { method: "DELETE" });
      if(res.ok) {
        carregarOS();
        alert("🗑️ O.S. excluída.");
      }
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "Calibri, sans-serif" }}>
      
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "3px solid #f39c12", paddingBottom: "10px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#2c3e50", fontSize: "28px" }}>Gestão Operacional (FSM)</h1>
          <p style={{ margin: 0, color: "#7f8c8d" }}>Controle de Obras, Checklists e Técnicos em Campo</p>
        </div>
        <button 
          onClick={() => setShowOSModal(true)}
          style={{ backgroundColor: "#27ae60", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
        >
          ➕ GERAR NOVA O.S. (MÁGICA)
        </button>
      </header>

      {showOSModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", width: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 15px 0", color: "#2980b9", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>Criar O.S. Automatizada</h2>
            <form onSubmit={handleGerarOS} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label><strong>Nome da Obra/Projeto</strong></label>
              <select value={form.obraId} onChange={(e)=>setForm({...form, obraId: e.target.value})} style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}>
                <option value="NOVA">Nova Obra Genérica (Obra a Definir)</option>
                {obrasList.map((ob: any) => <option key={ob.id} value={ob.id}>{ob.nome} - {ob.cliente}</option>)}
              </select>
              <label><strong>Cliente Designado</strong></label>
              <input required value={form.cliente} onChange={(e)=>setForm({...form, cliente: e.target.value})} style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
              <div style={{ display: "flex", gap: "10px" }}>
                <input value={form.telefone} onChange={(e)=>setForm({...form, telefone: e.target.value})} placeholder="WhatsApp" style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
                <input type="date" value={form.dataPrevista} onChange={(e)=>setForm({...form, dataPrevista: e.target.value})} style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
              </div>
              <textarea required value={form.tarefa} onChange={(e)=>setForm({...form, tarefa: e.target.value})} placeholder="Escopo da tarefa..." rows={3} style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
              <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
                <button type="submit" style={{ flex: 2, padding: "12px", backgroundColor: "#2980b9", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold" }}>ENVIAR PARA CAMPO</button>
                <button type="button" onClick={() => setShowOSModal(false)} style={{ flex: 1, backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "6px" }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LISTAGEM DE OS */}
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1, backgroundColor: "#ecf0f1", borderRadius: "10px", padding: "20px" }}>
          <h3 style={{ borderBottom: "2px solid #bdc3c7", paddingBottom: "10px" }}>🛠 O.S. em Produção</h3>
          {ordens.filter((o: any) => o.status !== "FINALIZADA").map((ordem: any) => (
            <div key={ordem.id} style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "8px", marginBottom: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ color: "#2980b9" }}>OS: #{ordem.numeroOS} - {ordem.obra?.nome || "Obra S/N"}</strong>
                <span style={{ fontSize: "11px", backgroundColor: "#f39c12", color: "#fff", padding: "2px 8px", borderRadius: "4px" }}>{ordem.status}</span>
              </div>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>{ordem.servicoEscopo}</p>
              <p style={{ margin: "5px 0", fontSize: "12px", color: "#7f8c8d" }}>Cliente: {ordem.obra?.cliente}</p>
              <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                <button onClick={() => setEditForm(ordem)} style={{ flex: 1, backgroundColor: "#f39c12", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer" }}>✏️ Editar</button>
                <button onClick={() => handleExcluirOS(ordem.id)} style={{ flex: 1, backgroundColor: "#e74c3c", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer" }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", width: "500px" }}>
            <h2 style={{ margin: "0 0 15px 0" }}>✏️ Editar OS #{editForm.numeroOS}</h2>
            <form onSubmit={handleUpdateOS} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label>Status</label>
              <select value={editForm.status} onChange={(e)=>setEditForm({...editForm, status: e.target.value})} style={{ padding: "10px", borderRadius: "5px" }}>
                <option value="PENDENTE">PENDENTE</option>
                <option value="EM_TRANSITO">EM TRÂNSITO</option>
                <option value="EM_EXECUCAO">EM EXECUÇÃO</option>
                <option value="FINALIZADA">FINALIZADA</option>
              </select>
              <label>Tarefa</label>
              <textarea value={editForm.servicoEscopo} onChange={(e)=>setEditForm({...editForm, servicoEscopo: e.target.value})} rows={3} style={{ padding: "10px", borderRadius: "5px" }} />
              <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
                <button type="submit" style={{ flex: 2, padding: "12px", backgroundColor: "#f39c12", color: "#fff", border: "none", borderRadius: "6px" }}>SALVAR</button>
                <button type="button" onClick={() => setEditForm(null)} style={{ flex: 1, backgroundColor: "#7f8c8d", color: "#fff", border: "none", borderRadius: "6px" }}>Fechar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
