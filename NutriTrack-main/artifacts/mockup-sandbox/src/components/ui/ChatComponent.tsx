import { useState } from "react";
import { useChat } from "../../context/ChatContext"; // Updated relative import

export function ChatComponent() {
  const { messages, sendMessage, clearChat, isLoading } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-2 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI or type 'reset workout'..."
          className="flex-1 p-2 border rounded-md"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}