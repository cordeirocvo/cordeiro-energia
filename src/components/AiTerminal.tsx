"use client";
import React, { useState } from "react";
import { Terminal, Send, X, Bot } from "lucide-react";

export default function AiTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);

  const handleSend = async () => {
    if(!input.trim()) return;
    const newMsg = { role: "user", content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    try {
      const res = await fetch("/api/ve-ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Erro na resposta." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao conectar com o cérebro da IA." }]);
    }
  };

  if(!isOpen) return (
    <button onClick={() => setIsOpen(true)} style={{ position: "fixed", bottom: "20px", right: "20px", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#fbc531", border: "none", boxShadow: "0 5px 15px rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", zIndex: 9999 }}>
        <Bot color="#2c3e50" size={30} />
    </button>
  );

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", width: "350px", height: "450px", backgroundColor: "#1e272e", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", border: "1px solid #7f8fa6", zIndex: 9999, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "15px", backgroundColor: "#2f3640", borderBottom: "1px solid #7f8fa6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Terminal size={18} color="#fbc531" />
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: "14px" }}>Cordeiro AI Assistant</span>
            </div>
            <X size={20} color="#fff" style={{ cursor: "pointer" }} onClick={() => setIsOpen(false)} />
        </div>
        
        <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.length === 0 && <p style={{ color: "#7f8fa6", fontSize: "13px", textAlign: "center" }}>Pergunte sobre dimensionamento, normas NBR ou viabilidade de carregamento VE.</p>}
            {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: m.role === 'user' ? '#fbc531' : '#2f3640', color: m.role === 'user' ? '#2c3e50' : '#fff', padding: "8px 12px", borderRadius: "8px", maxWidth: "80%", fontSize: "13px" }}>
                    {m.content}
                </div>
            ))}
        </div>

        <div style={{ padding: "15px", backgroundColor: "#2f3640", display: "flex", gap: "8px" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Sua dúvida técnica..." style={{ flex: 1, backgroundColor: "#1e272e", border: "1px solid #7f8fa6", borderRadius: "5px", padding: "8px", color: "#fff", outline: "none", fontSize: "13px" }} />
            <button onClick={handleSend} style={{ backgroundColor: "#fbc531", border: "none", padding: "8px", borderRadius: "5px", cursor: "pointer" }}>
                <Send size={18} color="#2c3e50" />
            </button>
        </div>
    </div>
  );
}
