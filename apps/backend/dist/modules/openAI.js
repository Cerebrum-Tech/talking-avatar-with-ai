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
exports.helloMessages = exports.possibleWaitMessages = void 0;
exports.sendMessage = sendMessage;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = require("openai");
const zod_2 = require("openai/helpers/zod");
const searchFlight_1 = __importDefault(require("./searchFlight"));
const cereInsight_1 = __importDefault(require("./cereInsight"));
const openai = new openai_1.OpenAI();
dotenv_1.default.config();
const template = `
You are Ayşe, a digital assistant at Istanbul airport. You are chatting with a close friend. You are not a language model and you are not related to openai. You are not a language model.

- If user asks about a flight by providing a flight number, use the get_flight_details tool to get the flight details. While summerizing flight details mention the departure and arrival hours. 
- If user asks a frequently asked question, use the get_faq tool to get the answer. If the faq result is not found, redirect user to a human.
- If it is none of the above, consider it as faq and call the get_faq tool to get the answer.
- Write all numers in words.
- Do not ask any question unless you need to clarify something.
- If the question is not about airport, flights, transportation related, do not answer it.

# Important

Always try to use tools before answering the question except if the question is just salutation or greeting or gratitude.
`;
exports.possibleWaitMessages = {
    tr: [
        "Biraz bekleteceğim. Anlayışınız için teşekkür ederim.",
        "Kontrol sağlıyorum... Bu, bir kaç saniye sürebilir.",
        "Biraz bekleyin, hemen döneceğim.",
        "Ufak bir araştırma yapmam gerekiyor. Biraz bekleyin lütfen.",
    ],
    en: [
        "I'll make you wait a bit. Thank you for your understanding.",
        "Checking... This may take a few seconds.",
        "Wait a minute, I'll be right back.",
        "I need to do a little research. Please wait.",
    ],
    de: [
        "Ich lasse dich ein wenig warten. Danke für dein Verständnis.",
        "Überprüfen... Dies kann einige Sekunden dauern.",
        "Warte mal, ich bin gleich zurück.",
        "Ich muss ein wenig recherchieren. Bitte warten.",
    ],
    fr: [
        "Je vais vous faire attendre un peu. Merci pour votre compréhension.",
        "Vérification... Cela peut prendre quelques secondes.",
        "Attendez une minute, je reviens tout de suite.",
        "J'ai besoin de faire un peu de recherche. Veuillez patienter.",
    ],
    es: [
        "Te haré esperar un poco. Gracias por tu comprensión.",
        "Comprobando... Esto puede tardar unos segundos.",
        "Espera un minuto, vuelvo enseguida.",
        "Necesito hacer una pequeña investigación. Por favor, espera.",
    ],
    it: [
        "Ti farò aspettare un po'. Grazie per la tua comprensione.",
        "Controllo... Questo potrebbe richiedere alcuni secondi.",
        "Aspetta un minuto, torno subito.",
        "Devo fare una piccola ricerca. Per favore, aspetta.",
    ],
    pt: [
        "Vou fazer você esperar um pouco. Obrigado pela sua compreensão.",
        "Verificando... Isso pode levar alguns segundos.",
        "Espere um minuto, volto já.",
        "Preciso fazer uma pequena pesquisa. Por favor, espere.",
    ],
    ar: [
        "سأجعلك تنتظر قليلاً. شكراً لتفهمك.",
        "فحص... قد يستغرق ذلك بضع ثوانٍ.",
        "انتظر دقيقة، سأعود على الفور.",
        "أحتاج إلى القيام ببحث صغير. يرجى الانتظار.",
    ],
    ru: [
        "Я заставлю вас подождать немного. Спасибо за понимание.",
        "Проверка... Это может занять несколько секунд.",
        "Подождите минуту, я вернусь сразу.",
        "Мне нужно провести небольшое исследование. Пожалуйста, подождите.",
    ],
    zh: [
        "我会让你等一会儿。谢谢你的理解。",
        "检查... 这可能需要几秒钟。",
        "等一下，我马上回来。",
        "我需要做一些小研究。请稍等。",
    ],
};
exports.helloMessages = {
    tr: ["Merhaba, ben dijital asistanınım. Sana nasıl yardımcı olabilirim?"],
    en: ["Hello, I'm a digital assistant. How can I help you?"],
    de: ["Hallo, ich bin ein digitaler Assistent. Wie kann ich Ihnen helfen?"],
    fr: ["Bonjour, je suis un assistant numérique. Comment puis-je vous aider?"],
    es: ["Hola, soy un asistente digital. ¿Cómo puedo ayudarte?"],
    it: ["Ciao, sono un assistente digitale. Come posso aiutarti?"],
    pt: ["Olá, sou um assistente digital. Como posso ajudar?"],
    ar: ["مرحبًا، أنا مساعد رقمي. كيف يمكنني مساعدتك؟"],
    ru: ["Привет, я цифровой ассистент. Как я могу вам помочь?"],
    zh: ["你好，我是一个数字助手。我能帮你什么？"],
};
const schema = zod_1.z.object({
    messages: zod_1.z.array(zod_1.z.object({
        text: zod_1.z.string().describe("Text to be spoken by the AI"),
        facialExpression: zod_1.z
            .string()
            .describe("Facial expression to be used by the AI. Select from: smile, and default"),
        animation: zod_1.z
            .string()
            .describe(`Animation to be used by the AI. Select from: Idle, TalkingOne, TalkingTwo, DismissingGesture, and ThoughtfulHeadshake.`),
        redirectToHuman: zod_1.z.boolean().optional(),
    })),
    // flight: z
    //   .object({
    //     type: z.string().optional(),
    //     title: z.string().optional(),
    //     flight_number: z.string().optional(),
    //     destination: z.string().optional(),
    //     flight_status: z.string().optional(),
    //     latest_update: z.string().optional(),
    //     percentage_of_flight_progress: z.string().optional(),
    //   })
    //   .optional()
    //   .describe(
    //     "Flight details comes from get_flight_details function. Pass null if not available."
    //   ),
    // openMap: z
    //   .boolean()
    //   .optional()
    //   .describe(
    //     "Set true if the messages include words like 'turn', 'go' or 'Dönün', 'Arkanızda', 'Geri dönün' etc."
    //   ),
    // link: z
    //   .string()
    //   .optional()
    //   .describe("Link to be opened in the browser. Pass null if not available."),
});
const tools = [
    {
        type: "function",
        function: {
            name: "get_flight_details",
            description: "Get flight details for a given flight number",
            parameters: {
                type: "object",
                properties: {
                    flight_number: {
                        type: "string",
                        description: "The flight number to get details for",
                    },
                },
                required: ["flight_number"],
                additionalProperties: false,
            },
            strict: true,
        },
    },
    {
        type: "function",
        function: {
            name: "get_faq",
            description: "Get the answer to a frequently asked question",
            parameters: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description: "The question to get the answer for",
                    },
                },
                required: ["question"],
                additionalProperties: false,
            },
            strict: true,
        },
    },
];
const languageMap = {
    tr: "Turkish",
    en: "English",
    de: "German",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ar: "Arabic",
    ru: "Russian",
    zh: "Chinese",
};
function sendMessage(messageParams_1, language_1, onPreMessage_1) {
    return __awaiter(this, arguments, void 0, function* (messageParams, language, onPreMessage, retryCount = 0) {
        console.log("sendMessage - messageParams:", messageParams);
        try {
            const messages = messageParams.length > 1
                ? messageParams
                : [
                    {
                        role: "system",
                        content: template +
                            "\n\n " +
                            "Current time is in Istanbul: " +
                            new Date().toLocaleTimeString("tr-TR") +
                            "\n\n" +
                            "Always answer in " +
                            (languageMap[language] || "English") +
                            ".",
                    },
                    ...messageParams,
                ];
            const completion = yield openai.beta.chat.completions.parse({
                model: "gpt-4o-mini",
                messages: messages,
                tools,
                store: true,
                response_format: (0, zod_2.zodResponseFormat)(schema, "messages"),
            });
            let completionMessage = completion.choices[0].message;
            if (completionMessage.tool_calls &&
                completionMessage.tool_calls.length > 0) {
                for (const toolCall of completionMessage.tool_calls) {
                    if (toolCall.function.name === "get_flight_details") {
                        if (retryCount === 0) {
                            onPreMessage({
                                messages: [
                                    {
                                        text: exports.possibleWaitMessages[language][Math.floor(Math.random() * exports.possibleWaitMessages[language].length)],
                                        facialExpression: "default",
                                        animation: "DismissingGesture",
                                    },
                                ],
                            });
                        }
                        const flightNumber = JSON.parse(toolCall.function.arguments).flight_number;
                        const searchResults = yield (0, searchFlight_1.default)(flightNumber);
                        if (searchResults.answer_box) {
                            const answer_box = searchResults.answer_box;
                            messages.push(completion.choices[0].message); // append model's function call message
                            messages.push({
                                // append result message
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: `
              # Flight Details
              type: ${answer_box.type}\n
              title: ${answer_box.title}\n
              flight number: ${answer_box.flight_number}\n
              destination: ${answer_box.destination}\n
              flight_status: ${answer_box.flight_status}\n
              latest_update: ${answer_box.latest_update}\n
              percentage_of_flight_progress: ${answer_box.percentage_of_flight_progress}\n
            `,
                            });
                        }
                        //console.log(searchResults);
                    }
                    else if (toolCall.function.name === "get_faq") {
                        if (retryCount === 0) {
                            onPreMessage({
                                messages: [
                                    {
                                        text: exports.possibleWaitMessages[language][Math.floor(Math.random() * exports.possibleWaitMessages[language].length)],
                                        facialExpression: "default",
                                        animation: "DismissingGesture",
                                    },
                                ],
                            });
                        }
                        const question = JSON.parse(toolCall.function.arguments).question;
                        const faqResult = yield (0, cereInsight_1.default)(question);
                        // console.log(
                        //   "FAQ result:",
                        //   faqResult.data.text.choices[0].message.content
                        // );
                        const content = faqResult.data.text.choices[0].message.content;
                        messages.push(completion.choices[0].message); // append model's function call message
                        messages.push({
                            // append result message
                            role: "tool",
                            tool_call_id: toolCall.id,
                            content: content,
                        });
                    }
                }
                const completion2 = yield openai.beta.chat.completions.parse({
                    model: "gpt-4o",
                    messages,
                    tools,
                    store: true,
                    response_format: (0, zod_2.zodResponseFormat)(schema, "messages"),
                });
                completionMessage = completion2.choices[0].message;
                messages.push({
                    role: "assistant",
                    content: completionMessage.content,
                });
                //console.log(completionMessage);
            }
            else {
                messages.push({
                    role: "assistant",
                    content: completionMessage.content,
                });
            }
            return { completionMessage, messages };
        }
        catch (error) {
            if (retryCount < 3) {
                console.error("Error while sending message to OpenAI:", error);
                console.log("Retrying...");
                return yield sendMessage(messageParams, language, onPreMessage, retryCount + 1);
            }
        }
    });
}
