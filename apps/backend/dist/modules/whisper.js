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
exports.convertAudioToText = convertAudioToText;
const openai_whisper_audio_1 = require("langchain/document_loaders/fs/openai_whisper_audio");
const audios_js_1 = require("../utils/audios.js");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openAIApiKey = process.env.OPENAI_API_KEY;
function convertAudioToText(_a) {
    return __awaiter(this, arguments, void 0, function* ({ audioData }) {
        const mp3AudioData = yield (0, audios_js_1.convertAudioToMp3)({ audioData });
        const outputPath = "/tmp/output.mp3";
        fs_1.default.writeFileSync(outputPath, mp3AudioData);
        const loader = new openai_whisper_audio_1.OpenAIWhisperAudio(outputPath, { clientOptions: { apiKey: openAIApiKey } });
        const doc = (yield loader.load()).shift();
        const transcribedText = doc.pageContent;
        fs_1.default.unlinkSync(outputPath);
        return transcribedText;
    });
}
