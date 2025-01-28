"use client";
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    electron: {
      pressKey(key: string): unknown;
      onPressKey(arg0: (key: any) => void): unknown;
      openKeyboard(): void;
      closeKeyboard(): void;
      sendRecordings(buffer: ArrayBuffer): unknown;
      pauseRecording(): void;
      onText(arg0: (data: { text: string; isFinal: boolean }) => void): void;
      startRecording: (language: string) => Promise<string>;
    };
  }
}

const Voice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const isAudioLoadingRef = useRef<boolean>(true);
  const messages = useRef<{ role: string; content: string }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isSpeakingRef = useRef<boolean>(false);

  useEffect(() => {
    console.log("useEffect - component mounted");

    requestMicrophoneAccess();
    fetchInitialQuestion();

    return () => {
      console.log("useEffect - component unmounted");
      stopSpeaking();
    };
  }, []);

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("requestMicrophoneAccess - error:", err);
      alert(
        "Microphone access denied. Please allow microphone access to use this feature."
      );
    }
  };

  const fetchInitialQuestion = async () => {
    messages.current = [{ role: "user", content: "Hadi başlayalım" }];

    try {
      const initialResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.current }),
      });

      const data = await initialResponse.json();
      const message =
        /*currentLang*/ "tr" == "tr" ? data.message : data.messageEn;

      messages.current.push({ role: "assistant", content: message });

      speakText(message, () => {
        startListening();
      });
    } catch (error) {
      console.error(
        "fetchInitialQuestion - error fetching initial question:",
        error
      );
    }
  };

  const askAgain = () => {
    speakText("Seni dinliyorum", () => {
      setIsListening(true);
      setIsAudioLoading(false);
      isAudioLoadingRef.current = false;
      startListening();
    });
  };

  const transcriptRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    console.log("useEffect - init speech recognition");
    window.electron.onText((data: { text: string; isFinal: boolean }) => {
      if (isSpeakingRef.current) return;
      console.log("onText - text:", data.text, data.isFinal);
      transcriptRef.current = data.text;
      if (data.isFinal && !isAudioLoadingRef.current) {
        stopListening();
        setIsAudioLoading(true);
        isAudioLoadingRef.current = true;
      }
    });
  }, []);

  const startListening = () => {
    //SpeechRecognition.startListening({ language: "tr", continuous: true });
    console.log("startListening - starting recording");
    window.electron.startRecording("tr");
    setIsListening(true);
  };

  const stopListening = async () => {
    //SpeechRecognition.stopListening();
    console.log("stopListening - stopping recording");
    window.electron.pauseRecording();
    setIsListening(false);

    if (transcriptRef.current && transcriptRef.current?.trim() !== "") {
      const currentTranscript = transcriptRef.current.trim();
      await handleApiRequest(currentTranscript);
    } else {
      console.log("stopListening - empty transcript, restarting listening");
      askAgain();
    }
  };

  const handleApiRequest = async (userTranscript: string) => {
    messages.current.push({ role: "user", content: userTranscript });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.current }),
      });

      const data = await response.json();

      const message = "tr" == "tr" ? data.message : data.messageEn;

      messages.current.push({ role: "assistant", content: data.message });

      if (data.isSessionEnd) {
        speakText(message, () => {
          // is end
        });
      } else {
        speakText(message, startListening);
      }
    } catch (error) {
      console.error(
        "handleApiRequest - error fetching chat API response:",
        error
      );
    }
  };

  const speakText = async (text: string, callback: () => void) => {
    setIsListening(false);

    try {
      isSpeakingRef.current = true;
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "tr" }),
      });

      const data = await response.json();
      if (data.buffer) {
        const audioUrl = "data:audio/wav;base64," + data.buffer;

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onended = () => {
            isSpeakingRef.current = false;
            URL.revokeObjectURL(audioUrl); // Clean up the object URL
            callback();
          };
          audioRef.current.onerror = (err) => {
            console.error("speakText - audio playback error", err);
            isSpeakingRef.current = false;
            callback();
          };

          audioRef.current.play();
          setIsAudioLoading(false);
          isAudioLoadingRef.current = false;
        }
      } else {
        console.error("speakText - No audio data received");
        setIsAudioLoading(false);
        isAudioLoadingRef.current = false;
        callback();
      }
    } catch (error) {
      console.error("speakText - error in TTS API request:", error);
      setIsAudioLoading(false);
      isAudioLoadingRef.current = false;
      callback();
    }
  };

  return (
    <div>
      <div className="pt-[12.5em] flex flex-col h-[1730px] gap-20 relative">
        <audio ref={audioRef} controls style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default Voice;
