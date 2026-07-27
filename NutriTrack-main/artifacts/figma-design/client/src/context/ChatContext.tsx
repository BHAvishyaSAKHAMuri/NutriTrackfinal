import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (question: string) => Promise<void>;
  clearChat: () => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Call React Query hook unconditionally at the top level
  const queryClient = useQueryClient();

  // Lazy initialize state from LocalStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem("nutritrack_chat_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync history to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("nutritrack_chat_history", JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I received your message.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically refetch dashboard feeds if database was modified
      if (data.dataUpdated && queryClient) {
        queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profile/today"] });
        queryClient.invalidateQueries({ queryKey: ["/api/meal-plan"] });
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err.message || "Failed to reach AI agent."}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("nutritrack_chat_history");
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, clearChat, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}