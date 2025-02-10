import { useEffect, useRef, useState } from "react";
import { useSpeech } from "../hooks/useSpeech";
import { GroupProps } from "@react-three/fiber";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { MdSupportAgent } from "react-icons/md";
import { tr } from "../constants/languages";

export const ChatInterface = ({
  hidden,
  language,
  ...props
}: {
  hidden?: boolean;
  language: string;
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const isAudioLoadingRef = useRef<boolean>(false);
  const messages = useRef<{ role: string; content: string }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [micMode, setMicMode] = useState(false);

  const isSpeakingRef = useRef<boolean>(false);

  const input = useRef<HTMLInputElement>(null);
  const {
    tts,
    loading,
    message,
    recording,
    isSpeaking,
    allMessagesPlayed,
    history,
    setLanguage,
    setHistory,
    flight,
    link,
    sendHello,
  } = useSpeech();

  const translated = tr;

  useEffect(() => {
    const timeout = setTimeout(() => {
      sendHello(language);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    window.electron.changeFlight(flight);
  }, [flight]);

  useEffect(() => {
    window.electron.changeLink(link);
  }, [link]);

  useEffect(() => {
    console.log("useEffect - setLanguage");
    setLanguage(language);
  }, [language]);

  useEffect(() => {
    console.log("useEffect -all messages played");
    if (allMessagesPlayed) {
      startListening();
    }
  }, [allMessagesPlayed]);

  useEffect(() => {
    isAudioLoadingRef.current = loading;
    setIsAudioLoading(loading);
  }, [loading]);

  useEffect(() => {
    console.log("useEffect - isSpeaking");
    if (isSpeaking) {
      setIsListening(false);
      window.electron.pauseRecording();
    }
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const sendMessage = () => {
    const text = input.current?.value || "";
    if (!loading && !message && input.current) {
      tts(text);
      input.current.value = "";
    }
  };
  if (hidden) {
    return null;
  }

  useEffect(() => {
    window.electron.onSendMessage((text) => {
      if (!loading && !message && input.current) {
        tts(text);
        input.current.value = "";
      }
    });

    window.electron.onChangeMicMode((mode) => {
      setMicMode(mode);
    });
  }, []);

  useEffect(() => {
    window.electron.historyChange(history);
  }, [history]);

  useEffect(() => {
    console.log("useEffect - init speech recognition");
    window.electron.onText((data: { text: string; isFinal: boolean }) => {
      if (isSpeakingRef.current) return;
      console.log("onText - text:", data.text, data.isFinal);
      transcriptRef.current = data.text;
      console.log(
        "onText - transcriptRef.current:",
        data.isFinal,
        !isAudioLoadingRef.current
      );
      if (data.isFinal && !isAudioLoadingRef.current) {
        console.log("history is 1", history);
        stopListening();
        setIsAudioLoading(true);
        isAudioLoadingRef.current = true;
      }
    });

    window.electron.onPressKey((key) => {
      console.log("onPressKey - key:", key);

      const shouldWriteTheKey =
        key !== "Enter" &&
        key !== "Backspace" &&
        key !== "Shift" &&
        key != "Space" &&
        key !== "CapsLock";

      if (shouldWriteTheKey) {
        input.current?.focus();
        input.current?.setSelectionRange(
          input.current?.value.length,
          input.current?.value.length
        );
        input.current?.setRangeText(key);
      } else if (key === "Enter") {
        sendMessage();
      } else if (key === "Backspace") {
        input.current?.focus();
        if (input.current) {
          input.current.value = input.current?.value.slice(
            0,
            input.current?.value.length - 1
          );
        }
      } else if (key === "Space") {
        input.current?.focus();
        input.current?.setSelectionRange(
          input.current?.value.length,
          input.current?.value.length
        );
        input.current?.setRangeText(" ");
      }
    });
  }, []);

  const stopListening = async () => {
    //SpeechRecognition.stopListening();
    console.log("stopListening - stopping recording");
    window.electron.pauseRecording();
    setIsListening(false);
    setIsAudioLoading(true);
    isAudioLoadingRef.current = true;

    if (transcriptRef.current && transcriptRef.current?.trim() !== "") {
      const currentTranscript = transcriptRef.current.trim();
      console.log("Current transcript", currentTranscript);
      console.log("history is", history);
      tts(currentTranscript);
    } else {
      console.log("stopListening - empty transcript, restarting listening");
      askAgain();
    }
  };

  const askAgain = () => {
    console.log("askAgain - asking again");
    setIsListening(true);
    setIsAudioLoading(false);
    isAudioLoadingRef.current = false;
    startListening();
  };

  const startListening = () => {
    if (!micMode) {
      return;
    }
    transcriptRef.current = null;
    //SpeechRecognition.startListening({ language: "tr", continuous: true });
    console.log("startListening - starting recording");
    window.electron.startRecording(language);
    setIsListening(true);
  };

  useEffect(() => {
    window.electron.changeLoading(isAudioLoading);
  }, [isAudioLoading]);

  // scroll down on new message
  useEffect(() => {
    const chat = document.querySelector(".sc");
    if (chat) {
      chat.scrollTop = chat.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (micMode) {
      startListening();
    } else {
      stopListening();
    }
  }, [micMode]);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 justify-between p-4 flex-col pointer-events-none hidden">
      {false && (
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl text-gray-700">Digital Human</h1>
          <p className="text-gray-600">
            {loading
              ? "Loading..."
              : "Type a message and press enter to chat with the AI."}
          </p>
        </div>
      )}
      <div className="w-full flex flex-col items-end justify-center gap-4"></div>

      <div className="w-full flex flex-col gap-4 pointer-events-auto">
        <div className="w-full inline-flex flex-row items-center justify-center gap-4 pointer-events-auto">
          <button
            onClick={() => {
              window.electron.pauseRecording();
              location.href = "/";
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white p-4 px-4 font-semibold uppercase rounded-md"
          >
            {translated[language]["Geri Dön"]}
          </button>
          <button
            onClick={() => {
              window.electron.changePage(language);
              window.electron.pauseRecording();
              location.reload();
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white p-4 px-4 font-semibold uppercase rounded-md"
          >
            {translated[language]["Yenile"]}
          </button>
          {keyboardOpen && (
            <button
              onClick={() => {
                setKeyboardOpen(false);
                window.electron.closeKeyboard();
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white p-4 px-4 font-semibold uppercase rounded-md"
            >
              {translated[language]["Klavyeyi Kapat"]}
            </button>
          )}
        </div>

        {/* Chat box */}
        <div className="flex flex-col gap-4 w-full max-w-screen-sm mx-auto">
          <div className="flex flex-col gap-2 rounded-md bg-opacity-50 bg-white backdrop-blur-md p-4 max-h-[30vh] overflow-y-auto sc">
            {history
              ?.filter((item) => {
                //console.log("item", item);
                return (
                  item.role === "user" ||
                  (item.role === "assistant" && item.content)
                );
              })
              .map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`chat ${
                      item.role === "user" ? "chat-end" : "chat-start"
                    }`}
                  >
                    <div className="chat-bubble">
                      <MarkdownPreview
                        style={{
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                        source={
                          item.content?.includes('"messages"')
                            ? JSON.parse(item.content)
                                .messages.map((m) => m.text)
                                .join("\n")
                            : item.content
                        }
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <button
            onClick={() => {
              setMicMode(!micMode);
            }}
            className={`bg-gray-500 hover:bg-gray-600 text-white p-4 px-4 font-semibold uppercase rounded-md ${
              micMode ? "bg-red-500 hover:bg-red-600" : ""
            } ${loading || message ? "cursor-not-allowed opacity-30" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
          </button>
          <div className="fixed right-0 bottom-0 mb-[10vh] mr-[5vw] z-10 bg-opacity-50 bg-white backdrop-blur-md rounded-lg flex items-center px-4">
            <MdSupportAgent size={100} />
            <span className="text-3xl">
              {translated[language]["Canlı Destek"]}
            </span>
          </div>
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder={translated[language]["Bir şeyler yazın..."]}
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            onFocus={() => {
              setKeyboardOpen(true);
              window.electron.openKeyboard();
            }}
          />
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`bg-gray-500 hover:bg-gray-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            {translated[language]["Gönder"]}
          </button>
        </div>
      </div>
    </div>
  );
};
