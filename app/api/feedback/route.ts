import { NextRequest, NextResponse } from "next/server";

// În viitor vom salva în Supabase. Pentru acum, salvăm în log.
// Tu vei vedea feedback-ul în Vercel Logs.

export async function POST(request: NextRequest) {
  try {
    const { analysis_id, rating, comment, document_text, response } =
      await request.json();

    if (!analysis_id || !rating) {
      return NextResponse.json(
        { error: "Date incomplete" },
        { status: 400 }
      );
    }

    // Log feedback (vizibil în Vercel Logs)
    const feedbackData = {
      timestamp: new Date().toISOString(),
      analysis_id,
      rating, // "positive" | "negative" | "partial"
      comment: comment || null,
      document_preview: document_text?.substring(0, 200) || null,
      response_preview: response?.substring(0, 200) || null,
    };

    console.log("📊 FEEDBACK RECEIVED:", JSON.stringify(feedbackData, null, 2));

    // Când vei avea Supabase, vei salva aici
    // await supabase.from('feedback').insert(feedbackData);

    return NextResponse.json({
      success: true,
      message: "Mulțumim pentru feedback!",
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Eroare la salvare feedback" },
      { status: 500 }
    );
  }
}