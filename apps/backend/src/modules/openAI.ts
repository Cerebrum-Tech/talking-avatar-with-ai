import { z } from "zod";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/index.mjs";
import searchFlight from "./searchFlight";
import sendToCereInsight from "./cereInsight";

const openai = new OpenAI();

dotenv.config();

const template = `
You are Cere, a worker at IGA airport. You are chatting with a close friend. You are not a language model and you are not related to openai. You are not a language model.

- If user asks about a flight by providing a flight number, use the get_flight_details tool to get the flight details. While summerizing flight details mention the departure and arrival hours. 
- If user asks a frequently asked question, use the get_faq tool to get the answer. If the faq result is not found, redirect user to a human.
- If it is none of the above, consider it as faq and call the get_faq tool to get the answer.
- Write all numers in words.
- Do not ask any question unless you need to clarify something.
- Answer in user's language.
- If the question is not about airport, flights, transportation related, do not answer it.

# Important

Always try to use tools before answering the question except if the question is just salutation or greeting or gratitude.
`;

const possibleWaitMessages = [
  "Biraz bekleteceğim. Anlayışınız için teşekkür ederim.",
  "Kontrol sağlıyorum... Bu, bir kaç saniye sürebilir.",
  "Biraz bekleyin, hemen döneceğim.",
  "Ufak bir araştırma yapmam gerekiyor. Biraz bekleyin lütfen.",
];

const schema = z.object({
  messages: z.array(
    z.object({
      text: z.string().describe("Text to be spoken by the AI"),
      facialExpression: z
        .string()
        .describe(
          "Facial expression to be used by the AI. Select from: smile, and default"
        ),
      animation: z
        .string()
        .describe(
          `Animation to be used by the AI. Select from: Idle, TalkingOne, TalkingTwo, DismissingGesture, and ThoughtfulHeadshake.`
        ),
      redirectToHuman: z.boolean().optional(),
    })
  ),
});

const tools: ChatCompletionTool[] = [
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

export async function sendMessage(
  messageParams: ChatCompletionMessageParam[],
  onPreMessage?: (message: {
    messages?: {
      text?: string;
      facialExpression?: string;
      animation?: string;
    }[];
  }) => void,
  retryCount = 0
) {
  console.log("sendMessage - messageParams:", messageParams);
  try {
    const messages: ChatCompletionMessageParam[] =
      messageParams.length > 1
        ? messageParams
        : [
            {
              role: "system",
              content:
                template +
                "\n\n " +
                "Current time is: " +
                new Date().toLocaleTimeString("tr-TR"),
            },
            ...messageParams,
          ];
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: messages,
      tools,
      store: true,
      response_format: zodResponseFormat(schema, "messages"),
    });

    let completionMessage = completion.choices[0].message;

    if (
      completionMessage.tool_calls &&
      completionMessage.tool_calls.length > 0
    ) {
      for (const toolCall of completionMessage.tool_calls) {
        if (toolCall.function.name === "get_flight_details") {
          if (retryCount === 0) {
            onPreMessage({
              messages: [
                {
                  text: possibleWaitMessages[
                    Math.floor(Math.random() * possibleWaitMessages.length)
                  ],
                  facialExpression: "default",
                  animation: "DismissingGesture",
                },
              ],
            });
          }

          const flightNumber = JSON.parse(
            toolCall.function.arguments
          ).flight_number;
          const searchResults = await searchFlight(flightNumber);
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
        } else if (toolCall.function.name === "get_faq") {
          if (retryCount === 0) {
            onPreMessage({
              messages: [
                {
                  text: possibleWaitMessages[
                    Math.floor(Math.random() * possibleWaitMessages.length)
                  ],
                  facialExpression: "default",
                  animation: "DismissingGesture",
                },
              ],
            });
          }
          const question = JSON.parse(toolCall.function.arguments).question;
          const faqResult = await sendToCereInsight(question);
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

      const completion2 = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages,
        tools,
        store: true,
        response_format: zodResponseFormat(schema, "messages"),
      });

      completionMessage = completion2.choices[0].message;
      messages.push({
        role: "assistant",
        content: completionMessage.content,
      });
      //console.log(completionMessage);
    } else {
      messages.push({
        role: "assistant",
        content: completionMessage.content,
      });
    }

    return { completionMessage, messages };
  } catch (error) {
    if (retryCount < 3) {
      console.error("Error while sending message to OpenAI:", error);
      console.log("Retrying...");
      return await sendMessage(messageParams, onPreMessage, retryCount + 1);
    }
  }
}
