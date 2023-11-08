import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
} from "langchain/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

const zodSchema = z.object({
    albums: z
        .array(
            z.object({
                name: z.string().describe("The name of the album"),
                artist: z.string().describe("The artist(s) that made the album"),
                length: z.number().describe("The length of the album in minutes"),
                genre: z.string().optional().describe("The genre of the album"),
            })
        )
        .describe("An array of music albums mentioned in the text"),
});
const prompt = new ChatPromptTemplate({
    promptMessages: [
        SystemMessagePromptTemplate.fromTemplate(
            "List all music albums mentioned in the following text."
        ),
        HumanMessagePromptTemplate.fromTemplate("{inputText}"),
    ],
    inputVariables: ["inputText"],
});
const llm = new ChatOpenAI({
    temperature: 1,
    azureOpenAIApiKey: "4651951117f244f59453d04b3fb6f170",
    azureOpenAIApiVersion: "2023-07-01-preview",
    azureOpenAIApiInstanceName: "luia",
    azureOpenAIApiDeploymentName: "Luia",
});
const functionCallingModel = llm.bind({
    functions: [
        {
            name: "output_formatter",
            description: "Should always be used to properly format output",
            parameters: zodToJsonSchema(zodSchema),
        },
    ],
    function_call: { name: "output_formatter" },
});

const outputParser = new JsonOutputFunctionsParser();
const chain = prompt.pipe(functionCallingModel).pipe(outputParser);
const response = await chain.invoke({
    inputText: "My favorite albums are: 2001, To Pimp a Butterfly and Led Zeppelin IV",
});

console.log(JSON.stringify(response, null, 2));