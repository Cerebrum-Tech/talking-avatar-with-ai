import { createContext, useContext, useEffect, useRef, useState } from "react";
import { socket } from "../socket";

const backendUrl = "http://localhost:3000";

const SpeechContext = createContext();

export const SpeechProvider = ({ children }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [flight, setFlight] = useState(null);
  const [link,setLink] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [allMessagesPlayed, setAllMessagesPlayed] = useState(false);
  const [language, setLanguage] = useState(
    location.href.includes("en") ? "en" : "tr"
  );
  const historyRef = useRef(history);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    // clear older event listeners
    socket.off("connect");
    socket.off("disconnect");
    socket.off("tts");
    socket.off("pre-message");

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onTts(response) {
      console.log("tts", response);
      setHistory(response.history);
      setMessages((messages) => [...response.messages]);
      setLoading(false);
      setFlight(response.flight);
      setLink(response.link);
      if (response.openMap) {
        window.electron.openMap(language)
      }
    }

    function onPreMessage(response) {
      setMessages((messages) => [...messages, ...response.messages]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("tts", onTts);
    socket.on("pre-message", onPreMessage);

    return () => {
      socket.off("tts", onTts);
      socket.off("pre-message", onPreMessage);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  let chunks = [];

  const initiateRecording = () => {
    chunks = [];
  };

  const onDataAvailable = (e) => {
    chunks.push(e.data);
  };

  const sendAudioData = async (audioBlob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async function () {
      const base64Audio = reader.result.split(",")[1];
      setLoading(true);
      try {
        const data = await fetch(`${backendUrl}/sts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio: base64Audio }),
        });
        const response = (await data.json()).messages;
        setMessages((messages) => [...messages, ...response]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const newMediaRecorder = new MediaRecorder(stream);
          newMediaRecorder.onstart = initiateRecording;
          newMediaRecorder.ondataavailable = onDataAvailable;
          newMediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });
            try {
              await sendAudioData(audioBlob);
            } catch (error) {
              console.error(error);
              alert(error.message);
            }
          };
          setMediaRecorder(newMediaRecorder);
        })
        .catch((err) => console.error("Error accessing microphone:", err));
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const tts2 = async (message) => {
    setLoading(true);
    try {
      const data = await fetch(`${backendUrl}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, history }),
      });
      const response = await data.json();
      setHistory(response.history);
      setMessages((messages) => [...messages, ...response.messages]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tts = async (message) => {
    setLoading(true);

    socket.emit("tts", { message, history: historyRef.current, language });

    setHistory((history) => {
      return [
        ...history,
        {
          role: "user",
          content: message,
        },
      ];
    });
  };

  const onMessagePlayed = () => {
    setIsSpeaking(false);
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setAllMessagesPlayed(false);
      console.log("message", messages);
      setMessage(messages[0]);
    } else {
      console.log("no messages");
      setAllMessagesPlayed(true);
      setMessage(null);
    }
  }, [messages]);

  return (
    <SpeechContext.Provider
      value={{
        startRecording,
        stopRecording,
        recording,
        tts,
        message,
        onMessagePlayed,
        loading,
        isSpeaking,
        setIsSpeaking,
        allMessagesPlayed,
        history,
        setLanguage,
        setHistory,
        flight
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
};
