import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";


const loader = new CheerioWebBaseLoader(
    "https://lilianweng.github.io/posts/2023-06-23-agent/"
);
const data = await loader.load();
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 20,
});

const splitDocs = await textSplitter.splitDocuments(data);

const embeddings = new OpenAIEmbeddings({
    temperature: 1,
    azureOpenAIApiKey: "4651951117f244f59453d04b3fb6f170",
    azureOpenAIApiVersion: "2023-07-01-preview",
    azureOpenAIApiInstanceName: "luia",
    azureOpenAIApiDeploymentName: "matrix",
});

const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
);

const model = new ChatOpenAI({
    temperature: 1,
    azureOpenAIApiKey: "4651951117f244f59453d04b3fb6f170",
    azureOpenAIApiVersion: "2023-07-01-preview",
    azureOpenAIApiInstanceName: "luia",
    azureOpenAIApiDeploymentName: "Luia",
});
const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

const response = await chain.call({
    query: "Summarize the information",
});
console.log(response);