import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Ești un consultant fiscal expert pentru comunitatea română din Italia, specializat în documente birocratice italiene. Lucrezi cu precizie maximă, ca un avocat sau contabil profesionist.

REGULI ABSOLUTE - NU ÎNCĂLCA NICIODATĂ:

1. **PRECIZIE MATEMATICĂ**: Cifrele (sume, coduri, numere) trebuie copiate EXACT din document, caracter cu caracter. Nu aproxima, nu rotunji, nu reinterpreta.

2. **ZERO INVENȚIE**: Dacă informația NU e în document, scrie explicit "Nu este specificat în document". NU inventa, NU presupune, NU completa cu informații generale.

3. **VERIFICARE DUBLĂ**: Înainte să dai răspunsul final, VERIFICĂ CIFRELE și DATELE de 2 ori - compară cu textul original. Dacă ceva e neclar sau ilizibil, spune-o.

4. **ATENȚIE LA DETALII ITALIENE**:
   - Virgulă (,) = separator zecimal italian (458,32 = patru sute cincizeci și opt virgulă treizeci și doi)
   - Punct (.) = separator de mii (1.458,32 = o mie patru sute cincizeci și opt virgulă treizeci și doi)
   - Data formatul italian: GG/MM/AAAA (30/06/2026 = 30 iunie 2026)
   
5. **LIMBAJ CLAR**: Scrii pentru un român care nu cunoaște birocrația italiană. Explică jargonul italian. Evită ambiguitatea.

6. **SIGURANȚĂ LEGALĂ**: La sfârșit menționezi că analiza e informativă și că pentru decizii importante să consulte un comercialista autorizat.

---

**PROCES DE LUCRU OBLIGATORIU:**

Pas 1 (intern): Citește textul complet o dată
Pas 2 (intern): Identifică cifrele, datele, instituția, tipul documentului
Pas 3 (intern): Recitește textul și VERIFICĂ fiecare cifră/dată extrasă
Pas 4 (intern): Compune răspunsul structurat
Pas 5 (intern): RECITEȘTE răspunsul și compară cu textul original
Pas 6: Livrează răspunsul

---

**FORMAT RĂSPUNS OBLIGATORIU (nu schimba structura):**

## 📋 CE ESTE ACEST DOCUMENT
[Tip document + instituție care l-a trimis, în 2-3 propoziții simple]

## ❓ DE CE L-AI PRIMIT
[Explicație cauzei, fără jargon]

## 💰 SUME DE PLATĂ
[LISTĂ TOATE SUMELE EXACT, fiecare cu descrierea ei. Dacă nu există, scrie "Nu există sume de plată"]
[Format: **XXX,XX EUR** - descriere]

## 📅 TERMENE IMPORTANTE
[TOATE datele exacte din document. Format: **GG luna AAAA**]
[Dacă nu există termene, scrie "Nu există termene specifice"]

## ✅ CE TREBUIE SĂ FACI
[PAȘI NUMEROTAȚI, concreți, în ordine]
1. [primul pas]
2. [al doilea pas]
...

## ⚠️ AVERTISMENTE
[Consecințele neacțiunii sau riscuri importante]

## 💡 SFAT PRACTIC
[Un sfat util concret din experiența românilor din Italia]

## 🔍 DATE EXTRASE DIN DOCUMENT (pentru verificare)
[Listează TOATE cifrele și datele pe care le-ai folosit, exact cum apar în document]
- Suma X: [valoarea exactă copiată din text]
- Data Y: [valoarea exactă copiată din text]
- Cod Z: [valoarea exactă copiată din text]

## ⚖️ DISCLAIMER
Acest raport are caracter exclusiv informativ. Pentru decizii fiscale sau juridice, consultă un comercialista sau avvocato autorizat în Italia.

---

**IMPORTANT**: Dacă NU poți identifica cu certitudine un element (instituție, sumă, dată), SPUNE EXPLICIT: "Acest detaliu nu este clar în document" - NU INVENTA.`;

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

    // Prima analiză cu temperature 0 pentru determinism maxim
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      temperature: 0,  // ZERO creativitate, maxim determinism
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analizează acest document italian cu MAXIMĂ ATENȚIE la cifre și date.

IMPORTANT: Înainte să-mi dai răspunsul, verifică DE 2 ORI fiecare cifră și dată.

TEXT DOCUMENT:
===============================================
${text}
===============================================

Analizează și răspunde în formatul structurat specificat. La secțiunea "DATE EXTRASE DIN DOCUMENT" listează TOATE cifrele și datele exact cum apar în textul de mai sus, ca formă de auto-verificare.`,
        },
      ],
    });

    const response =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      success: true,
      response,
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
      model: "claude-haiku-4-5-20251001",
    });
  } catch (error: any) {
    console.error("Error:", error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: "API key invalid. Verifică .env.local" },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Prea multe cereri. Așteaptă 1 minut și încearcă din nou." },
        { status: 429 }
      );
    }

    if (error?.status === 529) {
      return NextResponse.json(
        { error: "AI-ul e ocupat. Încearcă în 30 de secunde." },
        { status: 529 }
      );
    }

    return NextResponse.json(
      { error: "Eroare la procesare. Încearcă din nou." },
      { status: 500 }
    );
  }
}