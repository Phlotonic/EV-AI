
import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ChatPanel } from './components/ChatPanel';
import { PlanDisplay } from './components/PlanDisplay';
import { ConversionPlan, ChatMessage } from './types';
import * as geminiService from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [plan, setPlan] = useState<ConversionPlan | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const handlePlanGeneration = useCallback(async (file: File, prompt: string) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing vehicle and generating conversion plan... This may take a moment.');
    setError(null);
    setPlan(null);

    try {
      const result = await geminiService.generateConversionPlan(file, prompt, isThinkingMode);
      setPlan(result);
    } catch (e) {
      console.error(e);
      setError('Failed to generate conversion plan. Please check the console for details.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [isThinkingMode]);

  const handleChatMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setLoadingMessage('EV.AI is thinking...');

    try {
      const response = await geminiService.getChatResponse(chatMessages, message);
      const modelMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: response.text }],
        citations: response.citations,
      };
      setChatMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      console.error(e);
      setError('Failed to get chat response.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [chatMessages]);

  const handleTextToSpeech = useCallback(async (text: string) => {
    setIsLoading(true);
    setLoadingMessage('Generating audio...');
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioContext = audioContextRef.current;
        const audioBuffer = await geminiService.generateSpeech(text, audioContext);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();

    } catch (e) {
        console.error("TTS Error:", e);
        setError("Failed to generate speech.");
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
}, []);


  return (
    <div className="min-h-screen bg-brand-background text-gray-200 font-sans">
      <Header />
      <main className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        <aside className="w-full lg:w-1/3 xl:w-1/4 p-4 border-r border-gray-700 overflow-y-auto flex flex-col gap-6 bg-brand-surface lg:bg-transparent">
          <FileUpload
            onGenerate={handlePlanGeneration}
            isThinkingMode={isThinkingMode}
            onThinkingModeChange={setIsThinkingMode}
            isLoading={isLoading}
          />
          <ChatPanel messages={chatMessages} onSendMessage={handleChatMessage} isLoading={isLoading} />
        </aside>
        <section className="flex-1 p-6 overflow-y-auto">
          {isLoading && !plan && <LoadingSpinner message={loadingMessage} />}
          {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
          
          <PlanDisplay plan={plan} onTextToSpeech={handleTextToSpeech} />

          {!isLoading && !plan && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center text-brand-muted animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h2 className="text-2xl font-bold text-gray-300">Welcome to EV.AI</h2>
                <p className="mt-2 max-w-md">Upload a vehicle photo and a prompt to generate a detailed EV conversion plan. Use the chat for quick questions.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
