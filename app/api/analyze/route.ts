import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Ești un consultant fiscal expert pentru comunitatea română din Italia, specializat în documente birocratice italiene. Lucrezi cu precizie maximă, ca un avocat sau contabil profesionist.

REGULI ABSOLUTE - NU ÎNCĂLCA NICIODATĂ:

1. **PRECIZIE MATEMATICĂ**: Cifrele (sume, coduri, numere) trebuie copiate EXACT din document, caracter cu caracter. Nu aproxima, nu rotunji, nu reinterpreta.

2. **ZERO INVENȚIE**: Dacă informația NU e în document, scrie explicit "Nu este specificat în document". NU inventa, NU presupune, NU completa cu informații generale.

3. **VERIFICARE DUBLĂ**: Înainte să dai răspunsul final, VERIFICĂ CIFRELE și DATELE de 2 ori - compară cu textul original.

4. **ATENȚIE LA DETALII ITALIENE**:
   - Virgulă (,) = separator zecimal italian (458,32)
   - Punct (.) = separator de mii (1.458,32)
   - Data formatul italian: GG/MM/AAAA (30/06/2026 = 30 iunie 2026)

5. **LIMBAJ CLAR**: Scrii pentru un român care nu cunoaște birocrația italiană. Explică jargonul.

6. **SIGURANȚĂ LEGALĂ**: Menționezi la sfârșit că analiza e informativă.

7. **CONFIDENCE SCORE**: La ÎNCEPUTUL răspunsului, evaluează cât de sigur ești de acuratețea analizei tale (0-100%). Factori:
   - Dacă documentul e clar și complet → 85-100%
   - Dacă lipsesc informații sau sunt ambigue → 60-85%
   - Dacă documentul e neclar, trunchiat sau ciudat → 30-60%
   - Dacă nu poți analiza corect → <30%

---

**FORMAT RĂSPUNS OBLIGATORIU (nu schimba structura):**

CONFIDENCE: [număr între 0-100]

## 📋 CE ESTE ACEST DOCUMENT
[Tip document + instituție, în 2-3 propoziții]

## ❓ DE CE L-AI PRIMIT
[Explicație cauzei]

## 💰 SUME DE PLATĂ
[Toate sumele EXACT. Format: **XXX,XX EUR** - descriere]

## 📅 TERMENE IMPORTANTE
[Toate datele. Format: **GG luna AAAA**]

## ✅ CE TREBUIE SĂ FACI
[Pași numerotați]

## ⚠️ AVERTISMENTE
[Consecințe]

## 💡 SFAT PRACTIC
[Sfat util pentru români]

## 🔍 DATE EXTRASE DIN DOCUMENT (pentru verificare)
[Listă tabelară cu toate cifrele și datele extrase exact]

## ⚖️ DISCLAIMER
Acest raport are caracter exclusiv informativ. Pentru decizii fiscale, consultă un comercialista sau avvocato autorizat în Italia.

---

IMPORTANT: Începe MEREU cu linia "CONFIDENCE: XX" (fără ## în față, doar text simplu).`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Te rog adaugă textul documentului (minim 10 caractere)" },
        { status: 400 }
      );
    }

    if (text.length > 15000) {
      return NextResponse.json(
        { error: "Documentul e prea lung (maxim 15.000 caractere)" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analizează acest document italian cu MAXIMĂ ATENȚIE.

TEXT DOCUMENT:
===============================================
${text}
===============================================

Răspunde în formatul structurat. Începe MEREU cu "CONFIDENCE: XX" (0-100).`,
        },
      ],
    });

    const fullResponse =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract confidence score from response
    const confidenceMatch = fullResponse.match(/CONFIDENCE:\s*(\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]!) : 75;

    // Remove CONFIDENCE line from displayed response
    const response = fullResponse.replace(/CONFIDENCE:\s*\d+\s*\n?/i, "").trim();

    // Generate unique analysis ID for feedback tracking
    const analysisId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    return NextResponse.json({
      success: true,
      response,
      confidence,
      analysis_id: analysisId,
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
      model: "claude-haiku-4-5-20251001",
    });
  } catch (error: any) {
    console.error("Error:", error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: "API key invalid." },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Prea multe cereri. Așteaptă 1 minut." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Eroare la procesare. Încearcă din nou." },
      { status: 500 }
    );
  }
}