//Funciona muy bien

import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

const chat = new ChatOpenAI({
    temperature: 0.9,
    azureOpenAIApiKey: "c0086bc08dc64d3b8d8c89a710000e6e",
    azureOpenAIApiVersion: "2023-07-01-preview",
    azureOpenAIApiInstanceName: "ysis",
    azureOpenAIApiDeploymentName: "luia",
});
const prompt = PromptTemplate.fromTemplate(`Eres un asistente personal y sugieres ideas importantes a considerar para la actividad del usuario. La actividad del usuario es: {question}`);
const runnable = prompt.pipe(chat);
const response = await runnable.invoke({ question: "Reunión con la viceministra de educación" });
console.log(response);