import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { openAIChain, parser } from "./modules/openAI.mjs";
import { lipSync } from "./modules/lip-sync.mjs";
import { sendDefaultMessages, defaultResponse } from "./modules/defaultMessages.mjs";
import { convertAudioToText } from "./modules/whisper.mjs";

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/voices", async (req, res) => {
  console.log("Received GET request at /voices"); 
  try {
    const voices = await voice.getVoices(elevenLabsApiKey);
    console.log("Successfully fetched voices"); 
    res.send(voices);
  } catch (error) {
    console.error("Error fetching voices: ", error); 
    res.status(500).send({ error: "Error fetching voices" });
  }
});

app.post("/tts", async (req, res) => {
  console.log("Received POST request at /tts with message:", req.body.message); 

  const userMessage = await req.body.message;
  const defaultMessages = await sendDefaultMessages({ userMessage });
  if (defaultMessages) {
    console.log("Sending default messages"); 
    res.send({ messages: defaultMessages });
    return;
  }

  let openAImessages;
  try {
    console.log("Sending request to OpenAI chain"); 
    openAImessages = await openAIChain.invoke({
      question: userMessage,
      format_instructions: parser.getFormatInstructions(),
    });
    console.log("Received response from OpenAI");
  } catch (error) {
    console.error("Error interacting with OpenAI chain:", error); 
    openAImessages = defaultResponse;
  }

  console.log("Processing lip sync"); 
  openAImessages = await lipSync({ messages: openAImessages.messages });

  res.send({ messages: openAImessages });
});

app.post("/sts", async (req, res) => {
  console.log("Received POST request at /sts with audio data"); 

  const base64Audio = req.body.audio;
  const audioData = Buffer.from(base64Audio, "base64");
  const userMessage = await convertAudioToText({ audioData });
  let openAImessages;
  try {
    console.log("Sending request to OpenAI chain"); 
    openAImessages = await openAIChain.invoke({
      question: userMessage,
      format_instructions: parser.getFormatInstructions(),
    });
    console.log("Received response from OpenAI"); 
  } catch (error) {
    console.error("Error interacting with OpenAI chain:", error); 
    openAImessages = defaultResponse;
  }

  console.log("Processing lip sync"); 
  openAImessages = await lipSync({ messages: openAImessages.messages });

  res.send({ messages: openAImessages });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
