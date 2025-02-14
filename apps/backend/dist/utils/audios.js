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
exports.convertAudioToMp3 = convertAudioToMp3;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const files_1 = require("./files");
function convertAudioToMp3(_a) {
    return __awaiter(this, arguments, void 0, function* ({ audioData }) {
        const dir = 'tmp';
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        const inputPath = path_1.default.join(dir, "input.webm");
        fs_1.default.writeFileSync(inputPath, audioData);
        const outputPath = path_1.default.join(dir, "output.mp3");
        yield (0, files_1.execCommand)({ command: `ffmpeg -i ${inputPath} ${outputPath}` });
        const mp3AudioData = fs_1.default.readFileSync(outputPath);
        fs_1.default.unlinkSync(inputPath);
        fs_1.default.unlinkSync(outputPath);
        return mp3AudioData;
    });
}
