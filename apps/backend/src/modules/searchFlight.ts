const { getJson } = require("serpapi");

export default function searchFlight(flightNumber: string): Promise<any> {
  return new Promise((resolve, reject) => {
    getJson(
      {
        q: flightNumber,
        location: "Istanbul, Turkiye",
        hl: "tr",
        gl: "tr",
        google_domain: "google.com.tr",
        api_key: process.env.SERP_API_KEY,
      },
      (json) => {
        if (json.error) {
          reject(json.error);
        } else {
          resolve(json);
        }
      }
    );
  });
}
