// 1. Import necessary modules and libraries
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import * as dotenv from "dotenv";
import express from "express";

const app = express();

dotenv.config();

app.use(express.json()); // Add this line to parse JSON in request bodies

app.use("/", express.static("build"));

app.post("/markup-generator", async (req, res) => {
  const txtFilename = "input";
  const question = req.body.question;
  const txtPath = `./data/${txtFilename}.txt`;
  const VECTOR_STORE_PATH = `${txtFilename}.index`;

  const model = new OpenAI({
    temperature: 0.8,
    maxTokens: 2048,
  });

  // 6. Check if the vector store file exists
  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    // 6.1. If the vector store file exists, load it into memory
    console.log("Vector Exists..");
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  } else {
    // 6.2. If the vector store file doesn't exist, create it
    // 6.2.1. Read the input text file
    const text = fs.readFileSync(txtPath, "utf8");
    // 6.2.2. Create a RecursiveCharacterTextSplitter with a specified chunk size
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    // 6.2.3. Split the input text into documents
    const docs = await textSplitter.createDocuments([text]);
    // 6.2.4. Create a new vector store from the documents using OpenAIEmbeddings
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    // 6.2.5. Save the vector store to a file
    await vectorStore.save(VECTOR_STORE_PATH);
  }

  // 7. Create a RetrievalQAChain by passing the initialized OpenAI model and the vector store retriever
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  // 8. Call the RetrievalQAChain with the input question, and store the result in the 'res' variable
  const markup = await chain.call({
    query: question,
  });

  res.send(markup);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
