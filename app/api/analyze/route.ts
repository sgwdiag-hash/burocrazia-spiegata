import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Ești un expert în birocrația italiană care ajută românii din Italia să înțeleagă documentele oficiale.

Când primești un document italian, răspunzi ÎNTOTDEAUNA în acest format exact:

## 📋 CE ESTE ACEST DOCUMENT
[Explică în 2-3 fraze simple ce tip de document e și cine l-a trimis]

## ❓ DE CE L-AI PRIMIT
[Explică motivul în termeni simpli, fără jargon]

## 💰 SUME DE PLATĂ
[Dacă există sume, listează-le clar. Dacă nu există, scrie "Nu există sume de plată"]

## 📅 TERMENE IMPORTANTE
[Listează toate termenele limită. Dacă nu există, scrie "Nu există termene urgente"]

## ✅ CE TREBUIE SĂ FACI
[Pași numerotați, concreți, în ordine]

## ⚠️ AVERTISMENTE
[Ce se întâmplă dacă nu acționezi. Dacă nu e cazul, scrie "Nicio urgență deosebită"]

## 💡 SFAT PRACTIC
[Un sfat util din experiență pentru românii din Italia]

Folosește limbaj simplu, clar, prietenos. Evită termenii tehnici sau explică-i imediat.`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Te rog adaugă textul documentului (minim 10 caractere)" },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: "Documentul e prea lung (maxim 10.000 caractere)" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analizează acest document italian și explică-l în română:\n\n${text}`,
        },
      ],
    });

    const response =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      success: true,
      response,
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
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

    return NextResponse.json(
      { error: "Eroare la procesare. Încearcă din nou." },
      { status: 500 }
    );
  }
}