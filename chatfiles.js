import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader, JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";


const getPDFs = async () => {
    try {
        const directoryLoader = new DirectoryLoader("./documents",
            {
                ".json": (path) => new JSONLoader(path, "/texts"),
                ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
                ".txt": (path) => new TextLoader(path),
                ".csv": (path) => new CSVLoader(path, "text"), }
        );

        const docs = await directoryLoader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            separators: ["\n"],
        });

        const splitDocs = await textSplitter.splitDocuments(docs);

        // Ada-002 embeddings
        const embeddings = new OpenAIEmbeddings({
            temperature: 1,
            azureOpenAIApiKey: "4651951117f244f59453d04b3fb6f170",
            azureOpenAIApiVersion: "2023-07-01-preview",
            azureOpenAIApiInstanceName: "luia",
            azureOpenAIApiDeploymentName: "matrix",
        });
        const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);


        // GPT-3.5 model
        const llm = new ChatOpenAI({
            temperature: 1,
            azureOpenAIApiKey: "4651951117f244f59453d04b3fb6f170",
            azureOpenAIApiVersion: "2023-07-01-preview",
            azureOpenAIApiInstanceName: "luia",
            azureOpenAIApiDeploymentName: "Luia",
        });
        const memory = new BufferMemory({ memoryKey: "chat_history", returnMessages: true });

        const conversationChain = ConversationalRetrievalQAChain.fromLLM(llm, vectorStore.asRetriever(), { memory });
        console.log('Documents are loaded...');

        return conversationChain;
    } catch (error) {
        console.error(error);
    }
}

import readline from 'readline';
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const listenConsole = (conversation) => {
    rl.question('Question: ', (cmd) => {
        try {
            if (cmd.toLowerCase() === 'exit') {
                console.log('Exit...');
                rl.close();
            } else {
                conversation?.call({ question: cmd }).then((answer) => {
                    console.log(`Answer: ${answer?.text}`);
                    listenConsole(conversation);
                });
            }
        } catch (error) {
            console.error(error);
        }
    });
}

async function main() {
    console.log('Documents are loading...');
    const conversation = await getPDFs();
    listenConsole(conversation);
}

main();