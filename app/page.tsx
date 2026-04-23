"use client";

import { useState, useRef } from "react";

interface Analysis {
  id: number;
  text: string;
  response: string;
  timestamp: string;
  confidence: number;
}

export default function Home() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [analysisId, setAnalysisId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Analysis[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<string>("");

  // Image upload states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("");
  const [imageFileName, setImageFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setError("");

    // Text file
    if (file.type === "text/plain") {
      const content = await file.text();
      setText(content);
      clearImage();
      return;
    }

    // Image file
    if (file.type.startsWith("image/")) {
      // Limit 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError("Imaginea e prea mare (maxim 10MB)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove "data:image/xxx;base64," prefix
        const base64 = result.split(",")[1];
        setImageBase64(base64);
        setImagePreview(result);
        setImageType(file.type);
        setImageFileName(file.name);
        setText(""); // Clear text if image uploaded
      };
      reader.readAsDataURL(file);
      return;
    }

    setError("Formate acceptate: .txt, .jpg, .png. PDF în curând!");
  }

  function clearImage() {
    setImagePreview(null);
    setImageBase64(null);
    setImageType("");
    setImageFileName("");
  }

  async function analyze() {
    if (!text.trim() && !imageBase64) return;
    setLoading(true);
    setResponse("");
    setError("");
    setFeedbackGiven(false);
    setShowCommentBox(false);
    setFeedbackComment("");

    try {
      const body: any = {};
      if (imageBase64) {
        body.image = imageBase64;
        body.imageType = imageType;
      } else {
        body.text = text;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) setError(data.error);
      else {
        setResponse(data.response);
        setConfidence(data.confidence || 75);
        setAnalysisId(data.analysis_id || "");
        setTokensUsed(data.tokens_used || 0);
        setHistory((prev) => [
          {
            id: Date.now(),
            text: imageFileName
              ? `📷 ${imageFileName}`
              : text.substring(0, 80) + "...",
            response: data.response,
            timestamp: new Date().toLocaleString("ro-RO", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            confidence: data.confidence || 75,
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

  async function submitFeedback(rating: string, withComment: boolean = false) {
    if (withComment && !feedbackComment.trim()) {
      alert("Te rog adaugă o observație");
      return;
    }

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_id: analysisId,
          rating,
          comment: feedbackComment || null,
          document_text: text || imageFileName,
          response,
        }),
      });

      setFeedbackGiven(true);
      setFeedbackMessage(
        rating === "positive"
          ? "Mulțumim! Feedback-ul ajută AI-ul să se îmbunătățească."
          : rating === "negative"
            ? "Mulțumim pentru sesizare. Vom analiza problema."
            : "Mulțumim pentru feedback!"
      );
      setShowCommentBox(false);
    } catch (err) {
      console.error(err);
    }
  }

  function getConfidenceColor(score: number) {
    if (score >= 85) return "text-[#1B4D3E]";
    if (score >= 70) return "text-[#2D6A5A]";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  }

  function getConfidenceLabel(score: number) {
    if (score >= 85) return "Foarte ridicat";
    if (score >= 70) return "Ridicat";
    if (score >= 50) return "Mediu";
    return "Scăzut";
  }

  function formatResponse(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <div key={i} className="mt-8 mb-3 first:mt-0">
            <h3 className="font-playfair font-semibold text-[#1B4D3E] text-[19px] tracking-tight">
              {line.replace("## ", "")}
            </h3>
          </div>
        );
      }
      if (line.startsWith("* **") || line.startsWith("- ")) {
        return (
          <li key={i} className="text-gray-700 text-[15px] leading-relaxed ml-6 mb-2 list-disc marker:text-[#1B4D3E]">
            {line.replace(/^\* /, "").replace(/^- /, "")}
          </li>
        );
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return (
        <p key={i} className="text-gray-700 text-[15px] leading-relaxed mb-2">
          {line}
        </p>
      );
    });
  }

  const hasInput = text.trim() || imageBase64;

  return (
    <div className="min-h-screen bg-[#FAFAF7]">

      {/* NAVBAR */}
      <nav className="border-b border-gray-100 bg-[#FAFAF7] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="https://burocraziaspiegata.it" className="flex items-baseline gap-1">
            <span className="font-playfair text-2xl font-semibold text-[#0A0A0A]">Burocrazia</span>
            <span className="font-serif italic text-2xl text-[#1B4D3E]">Spiegata</span>
          </a>

          <div className="flex items-center gap-5">
            <a href="https://burocraziaspiegata.it#come" className="text-sm text-gray-600 hover:text-[#1B4D3E] font-medium hidden md:block">
              Cum funcționează
            </a>
            <a href="https://burocraziaspiegata.it#prezzi" className="text-sm text-gray-600 hover:text-[#1B4D3E] font-medium hidden md:block">
              Prețuri
            </a>
            <a href="https://burocraziaspiegata.it" className="text-sm bg-[#0A0A0A] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#1B4D3E] transition-colors">
              Acasă
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#F5F1E8] border border-gray-200 rounded-full px-4 py-1.5 mb-8">
            <span className="text-xs font-medium text-[#1B4D3E] tracking-wide">
              🇷🇴 Pentru românii din Italia
            </span>
          </div>

          <h1 className="font-playfair text-5xl md:text-6xl text-[#0A0A0A] leading-[1.1] mb-6">
            Analizează orice<br />
            <span className="font-serif italic text-[#1B4D3E]">document italian</span>
            <br />
            în <span className="highlight-yellow">30 secunde.</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Fotografiază documentul sau lipește textul. AI-ul îți explică ce spune, ce trebuie să faci, până când — în română curată.
          </p>
        </div>
      </section>

      {/* MAIN APP */}
      <section className="max-w-5xl mx-auto px-6 pb-16">

        <div className="bg-white border border-gray-200 rounded-2xl card-shadow overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-[#F5F1E8]">
            {[
              { id: "analyze", label: "Analiză Document", icon: "📋" },
              { id: "history", label: `Istoric${history.length > 0 ? ` (${history.length})` : ""}`, icon: "🗂️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? "text-[#0A0A0A] bg-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F4D35E]"></div>
                )}
              </button>
            ))}
          </div>

          {/* TAB: ANALIZEAZĂ */}
          {activeTab === "analyze" && (
            <div className="p-8 md:p-10">
              {!response ? (
                <>
                  {/* Image Preview (dacă user a încărcat) */}
                  {imagePreview && (
                    <div className="mb-6 animate-fade-in">
                      <div className="relative bg-[#F5F1E8] rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-start gap-4">
                          <img
                            src={imagePreview}
                            alt="Document preview"
                            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl border border-gray-200"
                          />
                          <div className="flex-1">
                            <p className="font-playfair font-semibold text-[#0A0A0A] mb-1">
                              📷 Imagine încărcată
                            </p>
                            <p className="text-sm text-gray-600 mb-3 truncate">
                              {imageFileName}
                            </p>
                            <button
                              onClick={clearImage}
                              className="text-xs text-[#D62828] hover:underline font-medium"
                            >
                              ✕ Șterge imaginea
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Options - Grid 3 butoane pe desktop, stacked pe mobil */}
                  {!imagePreview && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      {/* Camera Button (mobil-first) */}
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="relative border-2 border-gray-200 hover:border-[#1B4D3E] bg-white hover:bg-[#F5F1E8]/30 rounded-2xl p-5 text-center transition-all group cursor-pointer"
                      >
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        <div className="w-12 h-12 mx-auto bg-[#F5F1E8] group-hover:bg-[#1B4D3E] rounded-full flex items-center justify-center mb-3 transition-colors">
                          <svg className="w-6 h-6 text-[#1B4D3E] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-[#0A0A0A] text-sm mb-0.5">
                          📷 Fotografiază
                        </p>
                        <p className="text-xs text-gray-500">
                          Cu camera
                        </p>
                      </button>

                      {/* Upload Image Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="relative border-2 border-gray-200 hover:border-[#1B4D3E] bg-white hover:bg-[#F5F1E8]/30 rounded-2xl p-5 text-center transition-all group cursor-pointer"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.txt"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        <div className="w-12 h-12 mx-auto bg-[#F5F1E8] group-hover:bg-[#1B4D3E] rounded-full flex items-center justify-center mb-3 transition-colors">
                          <svg className="w-6 h-6 text-[#1B4D3E] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="font-semibold text-[#0A0A0A] text-sm mb-0.5">
                          📁 Încarcă fișier
                        </p>
                        <p className="text-xs text-gray-500">
                          .jpg, .png, .txt
                        </p>
                      </button>

                      {/* Text Button */}
                      <button
                        onClick={() => {
                          const textarea = document.getElementById("text-input");
                          textarea?.focus();
                          textarea?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className="relative border-2 border-gray-200 hover:border-[#1B4D3E] bg-white hover:bg-[#F5F1E8]/30 rounded-2xl p-5 text-center transition-all group cursor-pointer"
                      >
                        <div className="w-12 h-12 mx-auto bg-[#F5F1E8] group-hover:bg-[#1B4D3E] rounded-full flex items-center justify-center mb-3 transition-colors">
                          <svg className="w-6 h-6 text-[#1B4D3E] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-[#0A0A0A] text-sm mb-0.5">
                          ✍️ Lipește text
                        </p>
                        <p className="text-xs text-gray-500">
                          Copy-paste
                        </p>
                      </button>
                    </div>
                  )}

                  {/* Textarea - dacă nu e imagine */}
                  {!imagePreview && (
                    <div className="mb-6">
                      <textarea
                        id="text-input"
                        className="w-full border border-gray-200 rounded-2xl p-5 h-52 text-[15px] resize-none focus:outline-none focus:border-[#1B4D3E] focus:ring-4 focus:ring-[#1B4D3E]/10 text-gray-800 placeholder-gray-400 leading-relaxed font-sans"
                        placeholder="Sau lipește textul documentului aici... (ex: AGENZIA DELLE ENTRATE - Avviso Bonario...)"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                      />
                      {text && (
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={() => setText("")}
                            className="text-xs text-gray-500 hover:text-[#D62828] font-medium"
                          >
                            ✕ Șterge
                          </button>
                          <span className="text-xs text-gray-400">{text.length} caractere</span>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-3 bg-red-50 border-l-4 border-[#D62828] p-4 mb-6 rounded-r-xl">
                      <svg className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-[#D62828]">Eroare</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={analyze}
                    disabled={loading || !hasInput}
                    className="w-full bg-[#0A0A0A] hover:bg-[#1B4D3E] text-white py-4 rounded-full font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                        {imageBase64 ? "Analizez imaginea..." : "Se procesează..."}
                      </span>
                    ) : (
                      "Explică documentul — GRATIS"
                    )}
                  </button>

<p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
                    Non siamo commercialisti né avvocati. Le spiegazioni hanno scopo puramente informativo.
                  </p>
                  {loading && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      {imageBase64
                        ? "AI-ul citește imaginea și analizează... 15-25 secunde"
                        : "Durata estimată: 10-15 secunde"}
                    </p>
                  )}
                </>
              ) : (
                /* REZULTAT */
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#F5F1E8] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#1B4D3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-playfair text-xl font-semibold text-[#0A0A0A]">
                          Raport Complet
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {tokensUsed} tokens · Claude Haiku 4.5
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setResponse(""); setText(""); setError(""); setFeedbackGiven(false); clearImage(); }}
                      className="text-sm text-[#1B4D3E] hover:text-[#123530] font-semibold"
                    >
                      Document nou →
                    </button>
                  </div>

                  {/* CONFIDENCE SCORE */}
                  <div className="bg-[#F5F1E8] border border-gray-100 rounded-2xl p-5 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E5E5" strokeWidth="4" />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke={confidence >= 85 ? "#1B4D3E" : confidence >= 70 ? "#2D6A5A" : confidence >= 50 ? "#d97706" : "#D62828"}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${(confidence / 100) * 175.9} 175.9`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-sm font-bold ${getConfidenceColor(confidence)}`}>
                            {confidence}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A0A0A]">
                          Nivel încredere: <span className={getConfidenceColor(confidence)}>{getConfidenceLabel(confidence)}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {confidence >= 85
                            ? "Analiza are acuratețe ridicată."
                            : confidence >= 70
                              ? "Analiză corectă. Verifică cifrele importante."
                              : confidence >= 50
                                ? "Document parțial neclar. Poză mai bună sau expert."
                                : "Fotografie neclară. Încearcă altă poză."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 mb-6">
                    {formatResponse(response)}
                  </div>

                  {/* FEEDBACK */}
                  {!feedbackGiven ? (
                    <div className="bg-[#F5F1E8] border border-gray-200 rounded-2xl p-6 mb-6">
                      <h4 className="font-playfair font-semibold text-[#0A0A0A] mb-4 text-base">
                        Cum a fost analiza?
                      </h4>

                      {!showCommentBox ? (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => submitFeedback("positive")}
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:border-[#1B4D3E] hover:text-[#1B4D3E] transition-colors"
                          >
                            👍 Foarte util
                          </button>
                          <button
                            onClick={() => {
                              setFeedbackRating("partial");
                              setShowCommentBox(true);
                            }}
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:border-amber-500 hover:text-amber-700 transition-colors"
                          >
                            🤔 Parțial corect
                          </button>
                          <button
                            onClick={() => {
                              setFeedbackRating("negative");
                              setShowCommentBox(true);
                            }}
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:border-[#D62828] hover:text-[#D62828] transition-colors"
                          >
                            👎 Greșit
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">
                            Spune-ne ce a fost greșit (ne ajută să îmbunătățim):
                          </p>
                          <textarea
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm h-24 resize-none focus:outline-none focus:border-[#1B4D3E] bg-white"
                            placeholder="Ex: Suma X a fost citită greșit..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => submitFeedback(feedbackRating, true)}
                              className="bg-[#0A0A0A] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#1B4D3E] transition-colors"
                            >
                              Trimite feedback
                            </button>
                            <button
                              onClick={() => {
                                setShowCommentBox(false);
                                setFeedbackComment("");
                              }}
                              className="text-gray-600 px-5 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors"
                            >
                              Anulează
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#1B4D3E]/5 border border-[#1B4D3E]/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
                      <span className="text-[#1B4D3E] text-xl">✓</span>
                      <p className="text-sm text-[#1B4D3E]">{feedbackMessage}</p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-[#F4D35E]/20 border-l-4 border-[#F4D35E] p-4 rounded-r-xl mb-6">
                    <p className="text-sm text-gray-700">
                      <strong>⚠️ Notă Legală:</strong> Acest raport are caracter informativ. Nu înlocuiește consultanța unui expert fiscal sau avocat autorizat.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(response)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      📋 Copiază
                    </button>
                    <button
                      onClick={() => { setResponse(""); setText(""); setFeedbackGiven(false); clearImage(); }}
                      className="flex-1 bg-[#0A0A0A] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#1B4D3E] transition-colors"
                    >
                      Document nou
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ISTORIC */}
          {activeTab === "history" && (
            <div className="p-8 md:p-10">
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto bg-[#F5F1E8] rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-[#1B4D3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-[#0A0A0A] mb-2">
                    Niciun document în istoric
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Analizele efectuate vor apărea aici
                  </p>
                  <button
                    onClick={() => setActiveTab("analyze")}
                    className="bg-[#0A0A0A] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#1B4D3E] transition-colors"
                  >
                    Începe prima analiză
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setResponse(item.response); setConfidence(item.confidence); setActiveTab("analyze"); }}
                      className="border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-[#1B4D3E] hover:bg-[#F5F1E8]/30 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-[#F5F1E8] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[#1B4D3E] text-xs font-bold">{item.confidence}%</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0A0A0A] truncate">
                              {item.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                          </div>
                        </div>
                        <span className="text-[#1B4D3E] group-hover:translate-x-1 transition-all">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A0A0A] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-baseline gap-1">
              <span className="font-playfair text-xl font-semibold">Burocrazia</span>
              <span className="font-serif italic text-xl text-[#F4D35E]">Spiegata</span>
            </div>
            <p className="text-sm text-white/60">
              © 2026 · Făcut în Vicenza de români pentru români
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}