import { useEffect, useState } from "react";
import Keyboard from "./Keyboard";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  MdExitToApp,
  MdMap,
  MdRefresh,
  MdSend,
  MdSupportAgent,
} from "react-icons/md";
import { QRCodeSVG } from "qrcode.react";
import FlightDetails from "./FlightDetails";
import { tr } from "../constants/languages";

export default function SecondScreen({
  language = "tr",
}: {
  language: string;
}) {
  const [micMode, setMicMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [link, setLink] = useState("");
  const [flight, setFlight] = useState(null);

  const translated = tr;

  useEffect(() => {
    window.electron.changePage(language);
  }, []);

  useEffect(() => {
    window.electron.onLoading((loading) => {
      console.log("loading", loading);
      setLoading(loading);
    });

    window.electron.onHistoryChange((history) => {
      setHistory(history);
    });

    window.electron.onChangeLink((link) => {
      setLink(link);
    });

    window.electron.onChangeFlight((flight) => {
      console.log("Flight", flight);
      setFlight(flight);
    });
  }, []);

  useEffect(() => {
    window.electron.changeMicMode(micMode);
  }, [micMode]);

  useEffect(() => {
    const chat = document.querySelector(".sc");
    if (chat) {
      chat.scrollTop = chat.scrollHeight;
    }
  }, [history, loading]);

  useEffect(() => {
    for (const item of history) {
      const itemHasMarkdownLinks =
        item.content?.includes("[") && item.content?.includes("]");
      if (itemHasMarkdownLinks) {
        const links = item.content.match(/\[(.*?)\]/g);
        for (const link of links) {
          const url = link.replace("[", "").replace("]", "");
          if (url.includes("http")) {
            setLink(url);
          }
        }
      }
    }
  }, [history]);

  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center bg-gradient-to-br from-[#24205F] to-[#243F7A] gap-4">
      <input
        type="checkbox"
        id="my_modal_7"
        className="modal-toggle"
        checked={
          !!link ||
          (!!flight &&
            !!flight.flight_number &&
            flight.flight_number !== "null" &&
            flight.flight_number !== "")
        }
      />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            {flight
              ? translated[language]["Uçuş Bilgileri"]
              : translated[language]["QR Kod"]}
          </h3>
          {flight && <FlightDetails flight={flight} language={language} />}
          {link && <QRCodeSVG value={link} />}
          <div className="modal-action">
            <label
              htmlFor="my_modal_6"
              className="btn"
              onClick={() => {
                setLink("");
                setFlight(null);
              }}
            >
              {translated[language]["Kapat"]}
            </label>
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="my_modal_7"
          onClick={() => {
            setLink("");
            setFlight(null);
          }}
        >
          Close
        </label>
      </div>
      <div className="px-4 w-1/6 h-full flex flex-col justify-end py-4 gap-4">
        <button
          onClick={() => {
            location.href = "/map/" + language;
          }}
          className="bg-white text-[#27445D] rounded-full p-4 px-4 font-semibold uppercase flex items-center gap-2 justify-around"
        >
          <MdMap size={30} />
          {translated[language]["Harita"]}
        </button>
        <button
          onClick={() => {
            window.electron.changePage(language);
            location.reload();
          }}
          className="bg-white text-[#27445D] rounded-full p-4 px-4 font-semibold uppercase flex items-center gap-2 justify-around"
        >
          <MdRefresh size={30} />
          {translated[language]["Yenile"]}
        </button>
        <button
          onClick={() => {
            window.electron.changePage("");
            location.href = "/second-video";
          }}
          className="bg-white text-[#ff5656] rounded-full p-4 px-4 font-semibold uppercase flex items-center gap-2 justify-around"
        >
          <MdExitToApp size={30} className="text-[#ff5656]" />
          {translated[language]["Çıkış"]}
        </button>
      </div>
      <div className="flex flex-col gap-4 w-4/6 items-center h-full">
        <div className="flex-1"></div>
        <div className="w-full flex flex-col gap-4 items-center bg-black pb-4 rounded-lg bg-opacity-20">
          {/* Chat box */}
          <div className="flex flex-col gap-4 w-full max-w-screen-sm mx-auto">
            <div className="flex flex-col gap-2 rounded-md bg-opacity-50 p-4 max-h-[30vh] overflow-y-auto sc">
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
                      <div
                        className={
                          item.role == "user"
                            ? "chat-bubble bg-black text-white bg-opacity-60"
                            : "chat-bubble bg-opacity-40 bg-black text-white"
                        }
                      >
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
              {loading && (
                <div className="chat chat-start">
                  <div className="chat-bubble bg-black text-white bg-opacity-60">
                    <span className="loading loading-dots loading-md"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-screen-md">
            <div className="w-full flex gap-4 items-center">
              <button
                onClick={() => {
                  setMicMode(!micMode);
                }}
                className={`  rounded-full p-4 px-4 font-semibold uppercase ${
                  micMode
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white text-[#27445D]"
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
              <label className="input input-bordered w-full rounded-[3em] placeholder:text-[#27445D] flex gap-2 justify-between items-center">
                <input
                  type="text"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      window.electron.sendMessage(message);
                      setMessage("");
                    }
                  }}
                  value={message}
                  placeholder={translated[language]["Bir şeyler yazın..."]}
                  className="w-full"
                />
                <MdSend
                  size={30}
                  onClick={() => {
                    window.electron.sendMessage(message);
                    setMessage("");
                  }}
                />
              </label>
            </div>
          </div>
        </div>
        <Keyboard
          sizeMultiplier={1.2}
          onKeyPress={(key) => {
            const shouldWriteTheKey =
              key !== "Enter" &&
              key !== "Backspace" &&
              key !== "Shift" &&
              key != "Space" &&
              key !== "CapsLock";
            if (shouldWriteTheKey) {
              setMessage((prev) => prev + key);
            } else if (key === "Backspace") {
              setMessage((prev) => prev.slice(0, prev.length - 1));
            } else if (key === "Enter") {
              window.electron.sendMessage(message);
              setMessage("");
            } else if (key === "Space") {
              setMessage((prev) => prev + " ");
            }
          }}
        />
      </div>
      <div className="px-4 w-1/6 flex flex-col justify-end py-4 h-full">
        <button
          onClick={() => {}}
          className="bg-white text-[#27445D] rounded-full p-4 px-4 font-semibold uppercase flex items-center gap-2 justify-around"
        >
          <MdSupportAgent size={30} />
          <span>{translated[language]["Canlı Destek"]}</span>
        </button>
      </div>
    </div>
  );
}
