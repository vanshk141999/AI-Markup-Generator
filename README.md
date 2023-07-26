# AI Markup Generator

This app generates a custom form Markup using OpenAI API & Langchain.

## Prerequisites

1. Node

## Get Started

Please follow these steps to get started.

1. Add a `.env` file to the project root folder and add the following code - `OPENAI_API_KEY = "your key"`
2. Run the following commands -
   ```
   npm i
   npm run build
   node server.js
   ```

## How to train your custom data

Please follow these steps to train your custom data.

1. In the `data` folder there is a `input.txt` file. Replace the content of the file with your content in txt format.
2. Delete the `input.input` folder present in the project root.
3. Run the following commands -
   ```
   node server.js
   ```
4. After running the above command new Vector Index will be created.
