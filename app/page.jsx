"use client";
import React, { useState, useEffect } from "react";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BeatLoader from "react-spinners/BeatLoader";
import { VscSend } from "react-icons/vsc";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = process.env.GEMINI_API_KEY;
  const MODEL_NAME = "gemini-pro";
  const genAI = new GoogleGenerativeAI(API_KEY);
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        const newChat = await genAI
          .getGenerativeModel({ model: MODEL_NAME })
          .startChat({
            generationConfig,
            safetySettings,
            history: messages.map((msg) => ({
              text: msg.text,
              role: msg.role,
            })),
          });
        setChat(newChat);
      } catch (error) {
        setError("Não foi possível iniciar o chat, Tente outra vez!");
        toast.error("Não foi possível iniciar o chat, Tente outra vez!");
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, []);

  const handleSendMessage = async () => {
    setLoading(true);
    try {
      const userMessage = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      if (chat) {
        const result = await chat.sendMessage(userInput);
        const botMessage = {
          text: result.response.text(),
          role: "Codex",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      setError("Não foi possível enviar a mensagem, Tente outra vez!");
      toast.error("Não foi possível enviar a mensagem, Tente outra vez!");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (e) => {
    const isChecked = e.target.checked;
    setTheme(isChecked ? "dark" : "light");
  };

  const getThemeColors = () => {
    switch (theme) {
      case "light":
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
        };
      case "dark":
        return {
          primary: "bg-gray-900",
          secondary: "bg-gray-800",
          accent: "bg-cyan-500",
          text: "text-gray-100",
        };
      default:
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-cyan-500",
          text: "text-gray-800",
        };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const { primary, secondary, accent, text } = getThemeColors();

  return (
    <div className={`flex flex-col h-screen p-4 ${primary}`}>
      <div className="flex items-center justify-between mb-4">
        <h1 className={`text-2xl font-bold ${text}`}>Codex Chatbot</h1>
        <div className="flex space-x-2">
          <label
            htmlFor="theme"
            className={`text-sm relative inline-flex items-center cursor-pointer ${text}`}
          >
            <input
              class="sr-only peer"
              type="checkbox"
              id="theme"
              checked={theme === "dark"}
              onChange={handleThemeChange}
            />
            <div class="w-20 h-10 rounded-full ring-0 peer duration-500 outline-none bg-gray-200 overflow-hidden before:flex before:items-center before:justify-center after:flex after:items-center after:justify-center before:content-['☀️'] before:absolute before:h-10 before:w-10 before:top-1/2 before:bg-white before:rounded-full before:left-1 before:-translate-y-1/2 before:transition-all before:duration-700 peer-checked:before:opacity-0 peer-checked:before:rotate-90 peer-checked:before:-translate-y-full shadow-lg shadow-gray-400 peer-checked:shadow-lg peer-checked:shadow-gray-700 peer-checked:bg-[#383838] after:content-['🌑'] after:absolute after:bg-[#1d1d1d] after:rounded-full after:top-[4px] after:right-1 after:translate-y-full after:w-10 after:h-10 after:opacity-0 after:transition-all after:duration-700 peer-checked:after:opacity-100 peer-checked:after:rotate-180 peer-checked:after:translate-y-0"></div>
          </label>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto ${secondary} rounded-md p-2`}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`p-2 rounded-lg ${
                msg.role === "user"
                  ? `${accent} text-white`
                  : `${primary} ${text}`
              }`}
            >
              {msg.text}
            </span>
            <p className={`text-xs ${text} my-2`}>
              {msg.role === "bot" ? "Codex" : "You"} -{""}
              {msg.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 ">
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`flex-1 ${primary} px-4 py-3 outline-none w-[280px] ${text} rounded-lg border-2 transition-colors duration-100 border-solid focus:outline-none border-${accent}`}
          name="text"
          placeholder="Ask anything for Codex..."
          type="text"
        />
        <button
          className={`${primary} border-2 border-${text} rounded-lg ${text} px-4 py-3 text-sm md:text-xl hover:scale-105 cursor-pointer transition`}
          disabled={loading}
          onClick={handleSendMessage}
        >
          {loading ? (
            <BeatLoader size={8} color={`${text}`} />
          ) : (
            <VscSend size={28} color={`${text}`} />
          )}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}
