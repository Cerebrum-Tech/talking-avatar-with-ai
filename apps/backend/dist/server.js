"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const lip_sync_1 = require("./modules/lip-sync");
const defaultMessages_1 = require("./modules/defaultMessages");
const elevenLabs_1 = require("./modules/elevenLabs");
const openAI_1 = require("./modules/openAI");
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const file_cache_1 = require("./modules/file-cache");
dotenv_1.default.config();
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
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
    socket.on("hello", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const helloMessage = {
            messages: [
                {
                    text: openAI_1.helloMessages[data.language][0],
                    facialExpression: "default",
                    animation: "DismissingGesture",
                },
            ],
        };
        let preMessages = helloMessage.messages;
        preMessages = yield file_cache_1.FileCache.remember(helloMessage.messages[0].text, file_cache_1.FileCache.MONTH, () => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, lip_sync_1.lipSync)({ messages: preMessages });
        }));
        socket.emit("pre-message", { messages: preMessages });
    }));
    socket.on("tts", (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        console.log("Received POST request at /tts with message:", data.message);
        const userMessage = yield data.message;
        let openAImessages;
        let history = [];
        let flight = null;
        let openMap = false;
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
            }
            else {
                historyBody.push({
                    role: "user",
                    content: userMessage,
                });
            }
            openAImessages = yield (0, openAI_1.sendMessage)(historyBody, data.language, (preMessage) => __awaiter(void 0, void 0, void 0, function* () {
                console.log("Pre-message", preMessage);
                let preMessages = preMessage.messages;
                preMessages = yield file_cache_1.FileCache.remember(preMessage.messages[0].text, file_cache_1.FileCache.MONTH, () => __awaiter(void 0, void 0, void 0, function* () {
                    return yield (0, lip_sync_1.lipSync)({ messages: preMessages });
                }));
                socket.emit("pre-message", { messages: preMessages });
            }));
            history = openAImessages.messages;
            openAImessages = openAImessages.completionMessage;
            //console.log("Received response from OpenAI");
            openAImessages = openAImessages.parsed
                ? openAImessages.parsed
                : JSON.parse((_a = openAImessages.content) === null || _a === void 0 ? void 0 : _a.trim());
            flight = (openAImessages === null || openAImessages === void 0 ? void 0 : openAImessages.flight) || null;
            openMap = openAImessages.openMap || false;
            //console.log("Received response from OpenAI 2", openAImessages);
            // openAImessages = await openAIChain.invoke({
            //   question: userMessage,
            //   format_instructions: parser.getFormatInstructions(),
            // });
            //console.log("Received response from OpenAI");
        }
        catch (error) {
            console.error("Error interacting with OpenAI chain:", error);
            openAImessages = defaultMessages_1.defaultResponse;
        }
        if (!openAImessages || !openAImessages.messages) {
            return;
        }
        console.log("Processing lip sync");
        openAImessages.messages = (_b = openAImessages === null || openAImessages === void 0 ? void 0 : openAImessages.messages) === null || _b === void 0 ? void 0 : _b.map((message) => {
            message.text = replaceLinks(message.text);
            return message;
        });
        openAImessages = yield (0, lip_sync_1.lipSync)({ messages: openAImessages.messages });
        socket.emit("tts", {
            messages: openAImessages,
            history: history,
            flight: flight,
            openMap: openMap,
        });
    }));
});
app.get("/voices", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received GET request at /voices");
    try {
        const voices = yield elevenLabs_1.voice.getVoices(elevenLabsApiKey);
        console.log("Successfully fetched voices");
        res.send(voices);
    }
    catch (error) {
        console.error("Error fetching voices: ", error);
        res.status(500).send({ error: "Error fetching voices" });
    }
}));
app.post("/tts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("Received POST request at /tts with message:", req.body.message);
    const userMessage = yield req.body.message;
    const defaultMessages = yield (0, defaultMessages_1.sendDefaultMessages)({ userMessage });
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
        }
        else {
            historyBody.push({
                role: "user",
                content: userMessage,
            });
        }
        openAImessages = yield (0, openAI_1.sendMessage)(historyBody, req.body.language);
        history = openAImessages.messages;
        openAImessages = openAImessages.completionMessage;
        console.log("Received response from OpenAI");
        openAImessages = openAImessages.parsed
            ? openAImessages.parsed
            : JSON.parse((_a = openAImessages.content) === null || _a === void 0 ? void 0 : _a.trim());
        //console.log("Received response from OpenAI 2", openAImessages);
        // openAImessages = await openAIChain.invoke({
        //   question: userMessage,
        //   format_instructions: parser.getFormatInstructions(),
        // });
        console.log("Received response from OpenAI");
    }
    catch (error) {
        console.error("Error interacting with OpenAI chain:", error);
        openAImessages = defaultMessages_1.defaultResponse;
    }
    console.log("Processing lip sync");
    openAImessages = yield (0, lip_sync_1.lipSync)({ messages: openAImessages.messages });
    res.send({ messages: openAImessages, history: history });
}));
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
