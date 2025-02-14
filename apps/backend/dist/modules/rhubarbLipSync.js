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
exports.getPhonemes = void 0;
const files_1 = require("../utils/files");
const getPhonemes = (_a) => __awaiter(void 0, [_a], void 0, function* ({ message }) {
    try {
        const time = new Date().getTime();
        console.log(`Starting conversion for message ${message}`);
        yield (0, files_1.execCommand)({ command: `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav` }
        // -y to overwrite the file
        );
        console.log(`Conversion done in ${new Date().getTime() - time}ms`);
        yield (0, files_1.execCommand)({
            command: `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`,
        });
        // -r phonetic is faster but less accurate
        console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
    }
    catch (error) {
        console.error(`Error while getting phonemes for message ${message}:`, error);
    }
});
exports.getPhonemes = getPhonemes;
