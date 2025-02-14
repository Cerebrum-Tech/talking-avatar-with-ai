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
exports.defaultResponse = void 0;
exports.sendDefaultMessages = sendDefaultMessages;
const files_1 = require("../utils/files");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openAIApiKey = process.env.OPENAI_API_KEY;
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
function sendDefaultMessages(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userMessage }) {
        let messages;
        if (!userMessage) {
            messages = [
                {
                    text: "Hey there... How was your day?",
                    audio: yield (0, files_1.audioFileToBase64)({ fileName: "audios/intro_0.wav" }),
                    lipsync: yield (0, files_1.readJsonTranscript)({ fileName: "audios/intro_0.json" }),
                    facialExpression: "smile",
                    animation: "TalkingOne",
                },
                {
                    text: "I'm Jack, your personal AI assistant. I'm here to help you with anything you need.",
                    audio: yield (0, files_1.audioFileToBase64)({ fileName: "audios/intro_1.wav" }),
                    lipsync: yield (0, files_1.readJsonTranscript)({ fileName: "audios/intro_1.json" }),
                    facialExpression: "smile",
                    animation: "TalkingTwo",
                },
            ];
            return messages;
        }
        if (!elevenLabsApiKey || !openAIApiKey) {
            messages = [
                {
                    text: "Please my friend, don't forget to add your API keys!",
                    audio: yield (0, files_1.audioFileToBase64)({ fileName: "audios/api_0.wav" }),
                    lipsync: yield (0, files_1.readJsonTranscript)({ fileName: "audios/api_0.json" }),
                    facialExpression: "angry",
                    animation: "TalkingThree",
                },
                {
                    text: "You don't want to ruin Jack with a crazy ChatGPT and ElevenLabs bill, right?",
                    audio: yield (0, files_1.audioFileToBase64)({ fileName: "audios/api_1.wav" }),
                    lipsync: yield (0, files_1.readJsonTranscript)({ fileName: "audios/api_1.json" }),
                    facialExpression: "smile",
                    animation: "Angry",
                },
            ];
            return messages;
        }
    });
}
const defaultResponse = [
    {
        text: "I'm sorry, there seems to be an error with my brain, or I didn't understand. Could you please repeat your question?",
        facialExpression: "sad",
        animation: "Idle",
    },
];
exports.defaultResponse = defaultResponse;
