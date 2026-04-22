"use client";

import { useState } from "react";

interface Analysis {
  id: number;
  text: string;
  response: string;
  timestamp: string;
}

export default function Home() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Analysis[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const [tokensUsed, setTokensUsed] = useState(0);

  async function handleFileUpload(file: File) {
    if (file.type === "text/plain") {
      const content = await file.text();
      setText(content);
    } else {
      setError("Momentan suportăm doar fișiere .txt");
    }
  }

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (data.error) setError(data.error);
      else {
        setResponse(data.response);
        setTokensUsed(data.tokens_used || 0);
        setHistory((prev) => [
          {
            id: Date.now(),
            text: text.substring(0, 80) + "...",
            response: data.response,
            timestamp: new Date().toLocaleString("ro-RO", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setError("Eroare de conexiune.");
    } finally {
      setLoading(false);
    }
  }

  function formatResponse(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <div key={i} className="mt-8 mb-3 first:mt-0 flex items-center gap-3">
            <div className="w-1 h-6 bg-[#0a2540]"></div>
            <h3 className="font-semibold text-[#0a2540] text-[15px] tracking-tight">
              {line.replace("## ", "")}
            </h3>
          </div>
        );
      }
      if (line.startsWith("* **") || line.startsWith("- ")) {
        return (
          <li key={i} className="text-gray-700 text-[14px] leading-relaxed ml-6 mb-2 list-disc marker:text-[#0a2540]">
            {line.replace(/^\* /, "").replace(/^- /, "")}
          </li>
        );
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return (
        <p key={i} className="text-gray-700 text-[14px] leading-relaxed mb-2">
          {line}
        </p>
      );
    });
  }

  return (
    <div className="min-h-screen bg-white">

      {/* TOP BAR - Official */}
      <div className="bg-[#0a2540] text-white text-xs py-2">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>🇷🇴 Română</span>
            <span className="text-white/60">|</span>
            <span className="text-white/60">🇮🇹 Italiano</span>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <span>📞 +39 xxx xxx xxxx</span>
            <span>✉️ ciao@burocraziaspiegata.it</span>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0a2540] rounded flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">BS</span>
            </div>
            <div>
              <div className="font-heading font-bold text-xl text-[#0a2540]">
                Burocrazia Spiegata
              </div>
              <div className="text-[11px] text-gray-500 tracking-wide uppercase">
                Consulenza Burocratica Online
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-gray-600 hover:text-[#0a2540] font-medium">Servicii</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#0a2540] font-medium">Prețuri</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#0a2540] font-medium">Despre</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#0a2540] font-medium">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-sm font-medium text-gray-600 hover:text-[#0a2540]">
              Autentificare
            </button>
            <button className="text-sm bg-[#0a2540] text-white px-5 py-2.5 rounded font-medium hover:bg-[#1a3a5c] transition-colors">
              Începe Acum
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-b from-[#f9fafb] to-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#0a2540]/5 border border-[#0a2540]/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              <span className="text-xs font-medium text-[#0a2540] tracking-wide uppercase">
                Serviciu Certificat · Comunitatea Română Italia
              </span>
            </div>

            <h1 className="font-heading font-bold text-5xl md:text-6xl text-[#0a2540] leading-tight mb-6">
              Documentele italiene,<br />
              <span className="text-[#0a2540]/70 italic">explicate profesional.</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
              Consultanță AI avansată pentru documentele birocratice italiene. Obțineți o analiză completă, profesională, în limba română, în doar 15 secunde.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white border border-gray-200 rounded px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0a2540]/5 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0a2540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-[#0a2540]">93%</div>
                  <div className="text-[11px] text-gray-500 tracking-wide uppercase">Acuratețe</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0a2540]/5 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0a2540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-[#0a2540]">15s</div>
                  <div className="text-[11px] text-gray-500 tracking-wide uppercase">Timp răspuns</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0a2540]/5 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0a2540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-[#0a2540]">100%</div>
                  <div className="text-[11px] text-gray-500 tracking-wide uppercase">Confidențial</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN APP */}
      <section className="max-w-5xl mx-auto px-6 py-16">

        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-[#0a2540] tracking-[0.2em] uppercase">
            Serviciul Nostru
          </span>
          <h2 className="font-heading font-bold text-3xl text-[#0a2540] mt-2">
            Analizați documentul dumneavoastră
          </h2>
          <div className="w-16 h-0.5 bg-[#0a2540] mx-auto mt-4"></div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-lg overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: "analyze", label: "Analiză Document", icon: "📋" },
              { id: "history", label: `Istoric${history.length > 0 ? ` (${history.length})` : ""}`, icon: "🗂️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? "text-[#0a2540] bg-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a2540]"></div>
                )}
              </button>
            ))}
          </div>

          {/* TAB: ANALIZEAZĂ */}
          {activeTab === "analyze" && (
            <div className="p-10 animate-fade-in">

              {!response ? (
                <>
                  {/* Section title */}
                  <div className="mb-6">
                    <h3 className="font-heading font-bold text-xl text-[#0a2540] mb-2">
                      Instrucțiuni
                    </h3>
                    <p className="text-sm text-gray-600">
                      Încărcați fișierul documentului sau introduceți textul manual. Serviciul este gratuit și confidențial.
                    </p>
                  </div>

                  {/* Upload zone */}
                  <div className="relative border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#0a2540] hover:bg-gray-50 transition-all mb-6 group cursor-pointer">
                    <input
                      type="file"
                      accept=".txt"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    <div className="w-12 h-12 mx-auto bg-[#0a2540]/5 group-hover:bg-[#0a2540]/10 rounded flex items-center justify-center mb-3 transition-colors">
                      <svg className="w-6 h-6 text-[#0a2540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-[#0a2540] mb-1">
                      Încărcați fișier
                    </p>
                    <p className="text-xs text-gray-500">
                      Formate acceptate: .TXT · PDF în curând
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">sau introduceți text</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <div className="relative mb-6">
                    <label className="block text-sm font-semibold text-[#0a2540] mb-2">
                      Textul documentului italian
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded p-4 h-48 text-sm resize-none focus:outline-none focus:border-[#0a2540] focus:ring-2 focus:ring-[#0a2540]/10 text-gray-800 placeholder-gray-400 leading-relaxed transition-all"
                      placeholder="Exemplu: AGENZIA DELLE ENTRATE - Avviso Bonario n. 2026/..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    {text && (
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => setText("")}
                          className="text-xs text-gray-500 hover:text-red-600 font-medium"
                        >
                          ✕ Șterge text
                        </button>
                        <span className="text-xs text-gray-400">{text.length} caractere</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-red-800">Eroare</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={analyze}
                    disabled={loading || !text.trim()}
                    className="w-full bg-[#0a2540] hover:bg-[#1a3a5c] text-white py-4 rounded font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                        Se procesează documentul...
                      </span>
                    ) : (
                      "📋 Analizează Documentul"
                    )}
                  </button>

                  {loading && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Durata estimată: 10-15 secunde
                    </p>
                  )}

                  {/* Tipuri documente */}
                  {!loading && (
                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <h4 className="font-heading font-bold text-lg text-[#0a2540] mb-4">
                        Documente Suportate
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { name: "Avviso Bonario", desc: "Diferență impozit IRPEF", category: "Fiscal" },
                          { name: "Cartella Esattoriale", desc: "Somare executorie", category: "Fiscal" },
                          { name: "Busta Paga", desc: "Fluturaș de salariu", category: "Muncă" },
                          { name: "Permesso di Soggiorno", desc: "Permis de ședere", category: "Imigrație" },
                          { name: "Modello F24", desc: "Bollettino pentru plăți", category: "Fiscal" },
                          { name: "CUD / CU", desc: "Certificat anual venituri", category: "Fiscal" },
                        ].map((doc) => (
                          <div
                            key={doc.name}
                            className="border border-gray-200 rounded p-4 hover:border-[#0a2540] hover:bg-gray-50 transition-all cursor-pointer group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-[#0a2540] text-sm">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{doc.desc}</p>
                              </div>
                              <span className="text-[10px] font-semibold text-[#0a2540] bg-[#0a2540]/5 px-2 py-0.5 rounded uppercase tracking-wider">
                                {doc.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* REZULTAT */
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl text-[#0a2540]">
                          Raport Complet
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Procesat · {tokensUsed} tokens · Claude Haiku 4.5
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setResponse(""); setText(""); setError(""); }}
                      className="text-sm text-[#0a2540] hover:text-[#1a3a5c] font-semibold flex items-center gap-1"
                    >
                      Document Nou →
                    </button>
                  </div>

                  {/* Report Content */}
                  <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded p-8 mb-6">
                    {formatResponse(response)}
                  </div>

                  {/* Disclaimer box */}
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-6">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ Notă Legală:</strong> Acest raport are caracter informativ și nu înlocuiește consultanța unui expert fiscal autorizat sau a unui avocat.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(response);
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      📋 Copiază Raport
                    </button>
                    <button
                      onClick={() => { setResponse(""); setText(""); }}
                      className="flex-1 bg-[#0a2540] text-white py-3 rounded text-sm font-semibold hover:bg-[#1a3a5c] transition-colors"
                    >
                      Document Nou
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ISTORIC */}
          {activeTab === "history" && (
            <div className="p-10 animate-fade-in">
              {history.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto bg-[#0a2540]/5 rounded flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-[#0a2540]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#0a2540] mb-2">
                    Niciun Document în Istoric
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Analizele efectuate vor apărea aici pentru referință ulterioară
                  </p>
                  <button
                    onClick={() => setActiveTab("analyze")}
                    className="bg-[#0a2540] text-white px-6 py-3 rounded text-sm font-semibold hover:bg-[#1a3a5c] transition-colors"
                  >
                    Începe Prima Analiză
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-xl text-[#0a2540]">
                      Istoric Analize ({history.length})
                    </h3>
                  </div>
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setResponse(item.response); setActiveTab("analyze"); }}
                      className="border border-gray-200 rounded p-5 cursor-pointer hover:border-[#0a2540] hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-[#0a2540]/5 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#0a2540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0a2540] truncate">
                              {item.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                          </div>
                        </div>
                        <span className="text-[#0a2540]/40 group-hover:text-[#0a2540] group-hover:translate-x-1 transition-all">
                          →
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setHistory([])}
                    className="w-full text-xs text-red-600 hover:text-red-700 py-3 border-t border-gray-200 mt-4 transition-colors font-medium"
                  >
                    Șterge Tot Istoricul
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trust row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Date Private", desc: "Criptate end-to-end" },
            { title: "AI Certificat", desc: "Claude Anthropic" },
            { title: "Suport Român", desc: "În limba maternă" },
            { title: "Disponibil 24/7", desc: "Oricând, oriunde" },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded p-4 text-center">
              <p className="text-sm font-semibold text-[#0a2540]">{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a2540] text-white mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                  <span className="font-heading font-bold text-[#0a2540]">BS</span>
                </div>
                <span className="font-heading font-bold text-lg">Burocrazia Spiegata</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Consultanță birocratică online pentru comunitatea română din Italia.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Servicii</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white">Analiză Documente</a></li>
                <li><a href="#" className="hover:text-white">Consultanță Fiscală</a></li>
                <li><a href="#" className="hover:text-white">Suport Rezidență</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Companie</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white">Despre Noi</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Cariere</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Termeni și Condiții</a></li>
                <li><a href="#" className="hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-white/60">
              © 2026 Burocrazia Spiegata · Toate drepturile rezervate
            </p>
            <p className="text-xs text-white/60">
              📍 Vicenza, Veneto, Italia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}