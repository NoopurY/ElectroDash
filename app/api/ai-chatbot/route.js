import { NextResponse } from "next/server";
import { getGroqChatCompletion } from "@/lib/groq";
import { requireAuth } from "@/lib/apiAuth";

const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request) {
  // Only logged-in users can use the chatbot, so strangers can't burn the Groq key
  const { response } = requireAuth(request);
  if (response) {
    return NextResponse.json(
      { result: "🔒 Please log in to use the AI assistant." },
      { status: 401 }
    );
  }

  try {
    const { message } = await request.json();
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ result: "Please type a question." }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { result: `Please keep your question under ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Add prompt for markdown bullet points only, no tables
    const prompt = `You are an expert hardware assistant. Answer the following user query about hardware components in clear, concise bullet points only. Do not use tables. Use headings and icons if possible.\n\n${message}`;
    const result = await getGroqChatCompletion(prompt);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI chatbot error:", error);
    return NextResponse.json(
      { result: "❌ Sorry, the AI assistant is unavailable right now. Please try again later." },
      { status: 500 }
    );
  }
}
