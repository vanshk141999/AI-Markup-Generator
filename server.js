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

app.use(express.json());

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

  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    console.log("Vector Exists..");
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  } else {
    const text = fs.readFileSync(txtPath, "utf8");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.createDocuments([text]);
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    await vectorStore.save(VECTOR_STORE_PATH);
  }

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const markup = await chain.call({
    query: question,
  });

  res.send(markup);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
