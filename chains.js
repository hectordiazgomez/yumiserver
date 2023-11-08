import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import {
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
} from "langchain/prompts";

const template =
    "You are a helpful assistant";
const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(template);
const humanTemplate = "{text}";
const humanMessagePrompt =
    HumanMessagePromptTemplate.fromTemplate(humanTemplate);

const chatPrompt = ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt,
]);

const chat = new ChatOpenAI({
    temperature: 0.9,
    azureOpenAIApiKey: "c0086bc08dc64d3b8d8c89a710000e6e",
    azureOpenAIApiVersion: "2023-07-01-preview",
    azureOpenAIApiInstanceName: "ysis",
    azureOpenAIApiDeploymentName: "luia",
});

const chain = new LLMChain({
    llm: chat,
    prompt: chatPrompt,
});

const result = await chain.call({
    text: "In which programming state are you right now? 0 or 1 or anything else?",
});

console.log(result)