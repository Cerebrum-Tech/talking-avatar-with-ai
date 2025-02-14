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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCache = void 0;
const file_system_cache_1 = require("file-system-cache");
class FileCache {
    static remember(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, time = -1, func, loadInBAckground = false) {
            const cachedValue = yield this.client.get(key);
            if (cachedValue) {
                const cachedData = JSON.parse(cachedValue);
                if (time > 0 &&
                    cachedData.time + cachedData.expTime * 1000 > Date.now()) {
                    return cachedData.data;
                }
                else if (loadInBAckground) {
                    this.remember(key, time, func, false)
                        .then((result) => { })
                        .catch((err) => { });
                    return cachedData.data;
                }
            }
            const result = yield func();
            const cacheData = {
                data: result,
                time: Date.now(),
                expTime: time,
            };
            const options = {};
            if (time > 0) {
                options["ex"] = time;
            }
            this.client.set(key, JSON.stringify(cacheData), time);
            return result;
        });
    }
    static forget(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.remove(key);
        });
    }
}
exports.FileCache = FileCache;
_a = FileCache;
FileCache.MINUTE = 60;
FileCache.HOUR = 60 * 60;
FileCache.DAY = 60 * 60 * 24;
FileCache.WEEK = _a.DAY * 7;
FileCache.MONTH = _a.DAY * 30;
FileCache.YEAR = _a.DAY * 365;
FileCache.client = new file_system_cache_1.Cache({
    basePath: "../.cache", // (optional) Path where cache files are stored (default).
    ns: "iga", // (optional) A grouping namespace for items.
    hash: "sha1", // (optional) A hashing algorithm used within the cache key.
    ttl: _a.YEAR,
});
