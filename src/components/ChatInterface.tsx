import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Droplet, Send, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateChatResponse, testGeminiAPI } from "@/services/geminiService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "model",
    content:
      "Hello! I'm your Clean Connect water quality assistant. You can ask me about water quality, testing methods, common contaminants, and more. How can I help you today?",
    timestamp: new Date(),
  },
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Test Gemini API on component mount
  useEffect(() => {
    testGeminiAPI().then((isWorking) => {
      console.log("Gemini API working:", isWorking);
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const currentMessages = [...messages, userMessage];
      const apiMessages = currentMessages.map((msg) => ({
        role: msg.role,
        parts: msg.content,
      }));

      console.log("Sending to API:", JSON.stringify(apiMessages, null, 2));

      const response = await generateChatResponse(apiMessages);
      console.log("API Response:", response);

      if (response.error) {
        console.error("Error from API:", response.error);
        throw new Error(response.error);
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content:
          response.text ||
          "I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Full error details:", error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content:
          "I'm sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    toast.success("Chat history cleared");
    setShowDeleteDialog(false);
  };

  const handleResetChat = () => {
    setShowDeleteDialog(true);
  };

  return (
    <div className="flex flex-col h-full max-w-[550px] mx-auto">
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleResetChat}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.role === "model" && (
                <div className="flex items-center mb-1 text-xs text-muted-foreground">
                  <Droplet className="h-3 w-3 mr-1" />
                  <span>Clean Connect Assistant</span>
                </div>
              )}
              <div
                className="text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: message.content }}
              ></div>
              <div className="text-xs mt-1 opacity-70">
                {message.role === "user"
                  ? new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex items-center mb-1 text-xs text-muted-foreground">
                <Droplet className="h-3 w-3 mr-1" />
                <span>Clean Connect Assistant</span>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <Card className="rounded-none border-t border-x-0 border-b-0 mt-auto">
        <CardContent className="p-3">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask about water quality..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button disabled={isLoading || !inputValue.trim()} type="submit">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the current chat session. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatInterface;
