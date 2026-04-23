"use client";

import { useState } from "react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });
        if (error) setError(error.message || "Eroare la înregistrare.");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (error) setError(error.message || "Email sau parolă greșite.");
      }
    } catch (err) {
      setError("Eroare de conexiune.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-baseline gap-1">
            <span className="font-playfair text-3xl font-semibold text-[#0A0A0A]">Burocrazia</span>
            <span className="font-serif italic text-3xl text-[#1B4D3E]">Spiegata</span>
          </a>
          <p className="text-sm text-gray-500 mt-2">
            {mode === "login" ? "Accedi al tuo account" : "Crea il tuo account gratuito"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          {/* Toggle */}
          <div className="flex bg-[#F5F1E8] rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === "login"
                  ? "bg-white text-[#0A0A0A] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Accedi
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === "signup"
                  ? "bg-white text-[#0A0A0A] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Registrati
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mario Rossi"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D3E] focus:ring-4 focus:ring-[#1B4D3E]/10 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario@esempio.it"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D3E] focus:ring-4 focus:ring-[#1B4D3E]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caratteri"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D3E] focus:ring-4 focus:ring-[#1B4D3E]/10 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password || (mode === "signup" && !name)}
              className="w-full bg-[#0A0A0A] hover:bg-[#1B4D3E] text-white py-3.5 rounded-full font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  {mode === "login" ? "Accesso..." : "Registrazione..."}
                </span>
              ) : (
                mode === "login" ? "Accedi" : "Crea account gratuito"
              )}
            </button>

          </div>

          {mode === "signup" && (
            <div className="mt-6 bg-[#F5F1E8] rounded-xl p-4">
              <p className="text-xs text-gray-600 text-center">
                ✅ <strong>3 analisi gratuite</strong> incluse · Nessuna carta di credito
              </p>
            </div>
          )}

          {mode === "login" && (
            <p className="text-center text-xs text-gray-400 mt-6">
              Non hai un account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-[#1B4D3E] font-medium hover:underline"
              >
                Registrati gratis
              </button>
            </p>
          )}

        </div>

        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          Continuando accetti i nostri{" "}
          <a href="/cookie-policy" className="underline hover:text-gray-600">Termini</a>
          {" "}e la{" "}
          <a href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</a>
        </p>

      </div>
    </div>
  );
}