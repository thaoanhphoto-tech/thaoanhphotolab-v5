
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, Modality, Blob as GenAiBlob, LiveServerMessage } from "@google/genai";
import { AiAssistantIcon } from './icons/AiAssistantIcon';
import { XIcon } from './icons/XIcon';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { useToast } from './Toast';
import { User } from '../userStore';

interface AiChatbotProps {
  onClose: () => void;
  isInitialLogin: boolean;
  currentUser: User | null;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Audio helper functions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): GenAiBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1.5 p-2">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-blink"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-blink" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-blink" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

export const AiChatbot: React.FC<AiChatbotProps> = ({ onClose, isInitialLogin, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const { showToast } = useToast();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Voice chat state and refs
  const [isListening, setIsListening] = useState(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const inputTranscriptionRef = useRef('');
  const outputTranscriptionRef = useRef('');
  const aiRef = useRef<GoogleGenAI | null>(null);

  const stopListening = useCallback(() => {
    micStreamRef.current?.getTracks().forEach(track => track.stop());
    scriptProcessorRef.current?.disconnect();
    mediaStreamSourceRef.current?.disconnect();
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();

    sessionPromiseRef.current?.then(session => session.close());

    setIsListening(false);

    // Reset refs
    micStreamRef.current = null;
    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current = null;
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    sessionPromiseRef.current = null;
  }, []);

  useEffect(() => {
    let initialMessageText = "👋 Xin chào! Tôi là trợ lý AI của Thảo Anh Photo Lab. Tôi có thể giúp gì cho bạn?";
    if (isInitialLogin && currentUser) {
      initialMessageText = `👋 Chào mừng ${currentUser.username} đã quay trở lại! Tôi có thể giúp gì cho bạn hôm nay?`;
    }
    setMessages([{ role: 'model', text: initialMessageText }]);
  }, [isInitialLogin, currentUser]);


  useEffect(() => {
    try {
        // FIX: Use process.env.API_KEY as per the guidelines
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY is not defined in the environment.");
            showToast("Trợ lý AI chưa sẵn sàng.", 'error');
            return;
        }
        aiRef.current = new GoogleGenAI({ apiKey });
        const newChat = aiRef.current.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are a helpful and friendly assistant for Thảo Anh Photo Lab, a professional photo printing and editing service. Answer questions about photo services, pricing, and give photography tips. Keep your answers concise and helpful. Respond in Vietnamese.',
            },
        });
        setChat(newChat);
    } catch (e) {
        console.error("Failed to initialize Gemini AI:", e);
        showToast("Không thể khởi tạo trợ lý AI. Vui lòng kiểm tra API key.", 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (messagesContainerRef.current) {
        const element = messagesContainerRef.current;
        element.scrollTop = element.scrollHeight;
    }
  }, [messages, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const startListening = useCallback(async () => {
    if (!aiRef.current) {
        showToast('Trợ lý AI chưa sẵn sàng.', 'error');
        return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setIsListening(true);
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;
      outputSourcesRef.current.clear();
      inputTranscriptionRef.current = '';
      outputTranscriptionRef.current = '';


      sessionPromiseRef.current = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle transcriptions
            if (message.serverContent?.inputTranscription) {
                inputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
                outputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
                if (inputTranscriptionRef.current.trim()) {
                    setMessages(prev => [...prev, { role: 'user', text: inputTranscriptionRef.current.trim() }]);
                }
                if (outputTranscriptionRef.current.trim()) {
                     setMessages(prev => [...prev, { role: 'model', text: outputTranscriptionRef.current.trim() }]);
                }
                inputTranscriptionRef.current = '';
                outputTranscriptionRef.current = '';
            }
            
            // Handle audio playback
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current;
              if (ctx) {
                const nextStartTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const sourceNode = ctx.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(ctx.destination);
                sourceNode.addEventListener('ended', () => outputSourcesRef.current.delete(sourceNode));
                sourceNode.start(nextStartTime);
                nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
                outputSourcesRef.current.add(sourceNode);
              }
            }

            if(message.serverContent?.interrupted) {
                for (const source of outputSourcesRef.current.values()) {
                    source.stop();
                }
                outputSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            showToast('Lỗi kết nối giọng nói. Vui lòng thử lại.', 'error');
            stopListening();
          },
          onclose: (e: CloseEvent) => {
            console.log('Live session closed');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Zephyr'}},
          },
        },
      });

    } catch (err) {
      console.error('Failed to get microphone access:', err);
      showToast('Không thể truy cập micro. Vui lòng cấp quyền.', 'error');
      setIsListening(false);
    }
  }, [showToast, stopListening]);
  
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  const sendMessage = async (messageText: string) => {
    const trimmedInput = messageText.trim();
    if (!trimmedInput || isLoading || !chat) return;

    const newUserMessage: Message = { role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: trimmedInput });
      const newModelMessage: Message = { role: 'model', text: response.text };
      setMessages(prev => [...prev, newModelMessage]);
    } catch (error) {
      console.error("Gemini API error:", error);
      showToast('Xin lỗi, tôi gặp sự cố khi trả lời. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(userInput);
  };
  
  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  }

  const initialPrompts = [
    "Ảnh thẻ cần những tiêu chuẩn gì?",
    "Phục hồi ảnh cũ giá bao nhiêu?",
    "In ảnh ép gỗ có bền không?"
  ];

  return (
    <div className="fixed bottom-20 right-4 w-full max-w-sm h-[60vh] max-h-[500px] z-[99] flex flex-col bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-slate-200 dark:border-zinc-700">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
            <AiAssistantIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-zinc-100">Trợ lý Thảo Anh photo lab AI</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700" aria-label="Đóng">
          <XIcon className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
        </button>
      </header>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : ''}`}>
            <div className={`${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200'} rounded-lg p-3 max-w-[85%]`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && !isListening && (
            <div className="flex">
                 <div className="bg-slate-100 dark:bg-zinc-700 rounded-lg p-3">
                    <TypingIndicator />
                </div>
            </div>
        )}
        {messages.length <= 1 && !isLoading && (
             <div className="space-y-2">
                {initialPrompts.map(prompt => (
                    <button key={prompt} onClick={() => handleSuggestedPrompt(prompt)} className="block w-full text-left text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50">
                        {prompt}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-zinc-700 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isListening ? "Đang nghe..." : "Hãy hỏi tôi bất cứ điều gì..."}
            className="flex-1 w-full p-2.5 bg-slate-100 dark:bg-zinc-700 border border-transparent rounded-lg text-sm text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isListening}
          />
          <button 
            type="button" 
            onClick={handleMicClick} 
            className={`p-2.5 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-zinc-600 text-slate-600 dark:text-zinc-200 hover:bg-slate-300'}`}
            aria-label={isListening ? 'Dừng nói' : 'Bắt đầu nói'}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          <button type="submit" disabled={isLoading || !userInput.trim() || isListening} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800/50 disabled:cursor-not-allowed">
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
