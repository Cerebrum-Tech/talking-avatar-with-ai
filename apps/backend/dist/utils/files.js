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
exports.audioFileToBase64 = exports.readJsonTranscript = exports.execCommand = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const execCommand = ({ command }) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error)
                reject(error);
            resolve(stdout);
        });
    });
};
exports.execCommand = execCommand;
const readJsonTranscript = (_a) => __awaiter(void 0, [_a], void 0, function* ({ fileName }) {
    const data = yield fs_1.promises.readFile(fileName, "utf8");
    return JSON.parse(data);
});
exports.readJsonTranscript = readJsonTranscript;
const audioFileToBase64 = (_a) => __awaiter(void 0, [_a], void 0, function* ({ fileName }) {
    const data = yield fs_1.promises.readFile(fileName);
    return data.toString("base64");
});
exports.audioFileToBase64 = audioFileToBase64;
