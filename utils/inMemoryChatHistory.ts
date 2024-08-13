// utils/inMemoryChatHistory.ts

interface ChatHistory {
    [chatThreadId: string]: [string, string][];
  }
  
  const chatHistory: ChatHistory = {};
  
  // Add chat to history
  export function addMessageToHistory(chatThreadId: string, userMessage: string, botResponse: string) {
    if (!chatHistory[chatThreadId]) {
      chatHistory[chatThreadId] = [];
    }
    chatHistory[chatThreadId].push([userMessage, botResponse]);
  }
  
  // Retrieve chat history
  export function getChatHistory(chatThreadId: string): [string, string][] {
    return chatHistory[chatThreadId] || [];
  }
  