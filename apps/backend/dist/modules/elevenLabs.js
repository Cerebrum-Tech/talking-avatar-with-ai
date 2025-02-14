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
exports.voice = void 0;
exports.convertTextToSpeech = convertTextToSpeech;
const elevenlabs_node_1 = __importDefault(require("elevenlabs-node"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.ELEVEN_LABS_VOICE_ID;
const modelID = process.env.ELEVEN_LABS_MODEL_ID;
const voice = new elevenlabs_node_1.default({
    apiKey: elevenLabsApiKey,
    voiceId: voiceID,
});
exports.voice = voice;
function convertTextToSpeech(_a) {
    return __awaiter(this, arguments, void 0, function* ({ text, fileName }) {
        yield voice.textToSpeech({
            fileName: fileName,
            textInput: text,
            voiceId: voiceID,
            stability: 0.5,
            similarityBoost: 0.5,
            modelId: modelID,
            style: 1,
            speakerBoost: true,
        });
    });
}
