import express from 'express';
import cors from "cors";
import { Page, Browser } from "puppeteer";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader, JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";

const app = express();
app.use(cors());
app.use(express.json());

app.post('/query', async (req, res) => {
    try {
        const url = req.body.url;
        const query = req.body.query;

        if (!url || !query) {
            return res.status(400).json({ error: 'URL and query are required' });
        }

        const loader = new CheerioWebBaseLoader(url,
            {
                selector: "p, a, [href]",
            });
        const data = await loader.load();
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100,
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
            query: query,
        });

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
