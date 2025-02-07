import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { lipSync } from "./modules/lip-sync";
import {
  sendDefaultMessages,
  defaultResponse,
} from "./modules/defaultMessages";
import { voice } from "./modules/elevenLabs";
import { sendMessage } from "./modules/openAI";
import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

const app = express();

app.use(express.json());
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const port = 3000;

function replaceLinks(text) {
  // Regex pattern to match markdown links
  const urlPattern = /\[.*?\]\(https?:\/\/[^\s]+?\)/g;

  // Replace matched URLs with "Aşağıdaki linkten"
  const result = text.replace(urlPattern, "Aşağıdaki linkten");

  return result;
}

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.removeAllListeners("tts");

  socket.on("tts", async (data) => {
    console.log("Received POST request at /tts with message:", data.message);

    const userMessage = await data.message;

    let openAImessages;
    let history = [];
    let flight = null
    let openMap = false
    try {
      console.log("Sending request to OpenAI chain");
      let historyBody = data.history;
      if (!historyBody || historyBody.length === 0) {
        historyBody = [
          {
            role: "user",
            content: userMessage,
          },
        ];
      } else {
        historyBody.push({
          role: "user",
          content: userMessage,
        });
      }
      openAImessages = await sendMessage(historyBody,data.language, async (preMessage) => {
        console.log("Pre-message", preMessage);
        let preMessages = preMessage.messages;
        preMessages = await lipSync({ messages: preMessages });

        socket.emit("pre-message", { messages: preMessages });
      });
      

      history = openAImessages.messages;
      openAImessages = openAImessages.completionMessage;
     
      //console.log("Received response from OpenAI");
      openAImessages = openAImessages.parsed
        ? openAImessages.parsed
        : JSON.parse(openAImessages.content?.trim());
        flight = openAImessages?.flight || null
        openMap = openAImessages.openMap || false
      //console.log("Received response from OpenAI 2", openAImessages);

      // openAImessages = await openAIChain.invoke({
      //   question: userMessage,
      //   format_instructions: parser.getFormatInstructions(),
      // });
      //console.log("Received response from OpenAI");
    } catch (error) {
      console.error("Error interacting with OpenAI chain:", error);
      openAImessages = defaultResponse;
    }

    if (!openAImessages || !openAImessages.messages) {
      return;
    }

    console.log("Processing lip sync");
    openAImessages.messages = openAImessages?.messages?.map((message) => {
      message.text = replaceLinks(message.text);
      return message;
    });
    openAImessages = await lipSync({ messages: openAImessages.messages });

    socket.emit("tts", { messages: openAImessages, history: history ,flight: flight, openMap: openMap});
  });
});

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
  let history = [];
  try {
    console.log("Sending request to OpenAI chain");
    let historyBody = req.body.history;
    if (!historyBody || historyBody.length === 0) {
      historyBody = [
        {
          role: "user",
          content: userMessage,
        },
      ];
    } else {
      historyBody.push({
        role: "user",
        content: userMessage,
      });
    }
    openAImessages = await sendMessage(historyBody,req.body.language);
    history = openAImessages.messages;
    openAImessages = openAImessages.completionMessage;
    console.log("Received response from OpenAI");
    openAImessages = openAImessages.parsed
      ? openAImessages.parsed
      : JSON.parse(openAImessages.content?.trim());
    //console.log("Received response from OpenAI 2", openAImessages);

    // openAImessages = await openAIChain.invoke({
    //   question: userMessage,
    //   format_instructions: parser.getFormatInstructions(),
    // });
    console.log("Received response from OpenAI");
  } catch (error) {
    console.error("Error interacting with OpenAI chain:", error);
    openAImessages = defaultResponse;
  }

  console.log("Processing lip sync");
  openAImessages = await lipSync({ messages: openAImessages.messages });

  res.send({ messages: openAImessages, history: history });
});

// app.post("/sts", async (req, res) => {
//   console.log("Received POST request at /sts with audio data");

//   const base64Audio = req.body.audio;
//   const audioData = Buffer.from(base64Audio, "base64");
//   const userMessage = await convertAudioToText({ audioData });
//   let openAImessages;
//   try {
//     console.log("Sending request to OpenAI chain");
//     openAImessages = await openAIChain.invoke({
//       question: userMessage,
//       format_instructions: parser.getFormatInstructions(),
//     });
//     console.log("Received response from OpenAI");
//   } catch (error) {
//     console.error("Error interacting with OpenAI chain:", error);
//     openAImessages = defaultResponse;
//   }

//   console.log("Processing lip sync");
//   openAImessages = await lipSync({ messages: openAImessages.messages });

//   res.send({ messages: openAImessages });
// });

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
