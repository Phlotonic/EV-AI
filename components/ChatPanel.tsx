
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon, UserIcon, BotIcon, MapPinIcon, LinkIcon } from './Icons';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="bg-brand-surface p-4 rounded-lg border border-gray-700 flex flex-col h-full shadow-md">
      <h2 className="text-lg font-semibold text-white mb-3">Ask an Expert</h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <BotIcon className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" />}
            <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-brand-blue text-white' : 'bg-gray-800'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 border-t border-gray-600 pt-2">
                  <h4 className="text-xs font-semibold text-brand-muted mb-1">Sources:</h4>
                  <ul className="space-y-1">
                    {msg.citations.map((citation: any, i) => (
                       <li key={i} className="text-xs">
                         <a href={citation.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-start gap-1">
                          {citation.placeAnswerSources ? <MapPinIcon className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <LinkIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                           <span className="truncate">{citation.title || "Untitled Source"}</span>
                         </a>
                       </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {msg.role === 'user' && <UserIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />}
          </div>
        ))}
         {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <div className="flex items-start gap-3">
                <BotIcon className="w-6 h-6 text-brand-blue flex-shrink-0" />
                <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center">
                    <div className="w-2 h-2 bg-brand-muted rounded-full animate-pulse-fast [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-brand-muted rounded-full animate-pulse-fast [animation-delay:-0.15s] mx-1"></div>
                    <div className="w-2 h-2 bg-brand-muted rounded-full animate-pulse-fast"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about torque specs..."
          className="flex-1 p-2 bg-gray-900 border border-gray-600 rounded-l-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-brand-blue text-white p-2 rounded-r-md hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
