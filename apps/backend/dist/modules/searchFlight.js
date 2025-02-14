"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = searchFlight;
const { getJson } = require("serpapi");
function searchFlight(flightNumber) {
    return new Promise((resolve, reject) => {
        getJson({
            q: flightNumber,
            location: "Istanbul, Turkiye",
            hl: "tr",
            gl: "tr",
            google_domain: "google.com.tr",
            api_key: process.env.SERP_API_KEY,
        }, (json) => {
            if (json.error) {
                reject(json.error);
            }
            else {
                resolve(json);
            }
        });
    });
}
