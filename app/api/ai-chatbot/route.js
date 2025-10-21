import { NextResponse } from "next/server";
import { getGroqChatCompletion } from "@/lib/groq";

export async function POST(request) {
  try {
    const { message } = await request.json();
    // Add prompt for markdown bullet points only, no tables
    const prompt = `You are an expert hardware assistant. Answer the following user query about hardware components in clear, concise bullet points only. Do not use tables. Use headings and icons if possible.\n\n${message}`;
    const result = await getGroqChatCompletion(prompt);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { result: "Error: " + error.message },
      { status: 500 }
    );
  }
}
