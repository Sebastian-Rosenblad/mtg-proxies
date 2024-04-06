import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
let thread: OpenAI.Beta.Threads.Thread | null = null;

function getAssistant(model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo"): string {
  switch (model) {
    case "gpt-4": return process.env.REACT_APP_ASSISTANT_4 || "";
    case "gpt-4-turbo": return process.env.REACT_APP_ASSISTANT_4_TURBO || "";
    default: return process.env.REACT_APP_ASSISTANT_3_5_TURBO || "";
  }
}
export async function chatGPTRequest(prompt: string, instruction: string): Promise<string> {
  try {
    if (thread === null) thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt + `\n\n` + instruction
    });
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: getAssistant("gpt-4-turbo")
    });
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status === "queued" || runStatus.status === "in_progress") {
      console.log(runStatus.status);
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    const messages = await openai.beta.threads.messages.list(thread.id);
    console.log(messages);
    return trimMessge((messages.data[0].content[0] as any).text.value);
  } catch (error) {
    console.error(error);
  }
  return "";
}
function trimMessge(message: string): string {
  const firstIndex: number = message.indexOf("["), lastIndex: number = message.lastIndexOf("]");
  const trimmed: string = message.slice(firstIndex, lastIndex + 1).replaceAll("\n", "");
  return trimmed;
}
