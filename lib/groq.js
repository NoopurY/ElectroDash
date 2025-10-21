"use server";

import { Groq } from "groq-sdk";

export async function getGroqChatCompletion(userMessage) {
  const groq = new Groq({ apiKey: process.env.NEXT_GROQ_KEY });

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
    model: "openai/gpt-oss-20b",
    temperature: 1,
    max_completion_tokens: 8192,
    top_p: 1,
    stream: false,
    reasoning_effort: "medium",
    stop: null,
  });

  // Return the full response content
  return chatCompletion.choices[0]?.message?.content || "";
}
