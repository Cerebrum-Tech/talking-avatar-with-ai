import axios from "axios";

export default async function sendToCereInsight(message: string) {
  const options = {
    method: "POST",
    url: "https://iga2025.cereinsight.com/api/teams/chat",
    headers: {
      "x-api-key": process.env.CERE_API_KEY,
      "Content-Type": "application/json",
    },
    data: {
      question: message,
    },
  };

  return await axios.request(options);
}
