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
Object.defineProperty(exports, "__esModule", { value: true });
exports.lipSync = void 0;
const elevenLabs_1 = require("./elevenLabs");
const rhubarbLipSync_1 = require("./rhubarbLipSync");
const files_1 = require("../utils/files");
const MAX_RETRIES = 10;
const RETRY_DELAY = 0;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const lipSync = (_a) => __awaiter(void 0, [_a], void 0, function* ({ messages }) {
    yield Promise.all(messages.map((message, index) => __awaiter(void 0, void 0, void 0, function* () {
        const fileName = `audios/message_${index}.mp3`;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                yield (0, elevenLabs_1.convertTextToSpeech)({ text: message.text, fileName });
                yield delay(RETRY_DELAY);
                break;
            }
            catch (error) {
                if (error.response && error.response.status === 429 && attempt < MAX_RETRIES - 1) {
                    yield delay(RETRY_DELAY);
                }
                else {
                    throw error;
                }
            }
        }
        console.log(`Message ${index} converted to speech`);
    })));
    yield Promise.all(messages.map((message, index) => __awaiter(void 0, void 0, void 0, function* () {
        const fileName = `audios/message_${index}.mp3`;
        try {
            yield (0, rhubarbLipSync_1.getPhonemes)({ message: index });
            message.audio = yield (0, files_1.audioFileToBase64)({ fileName });
            message.lipsync = yield (0, files_1.readJsonTranscript)({ fileName: `audios/message_${index}.json` });
        }
        catch (error) {
            console.error(`Error while getting phonemes for message ${index}:`, error);
        }
    })));
    return messages;
});
exports.lipSync = lipSync;
