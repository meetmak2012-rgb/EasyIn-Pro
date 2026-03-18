
import React, { useState, useEffect } from 'react';
import { Play, Loader2, AlertCircle, ExternalLink, Key } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const VideoTutorial: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    }
  };

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success as per instructions
    }
  };

  const generateTutorialVideo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Create a fresh instance to ensure up-to-date key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A high-quality 3D animation of business documents flying into a glowing digital cloud with a Google Drive logo, symbolizing secure cloud backup. Cinematic lighting, professional aesthetic.',
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await (ai as any).operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.API_KEY || '',
          },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      } else {
        throw new Error("No video URI returned");
      }
    } catch (err: any) {
      console.error("Video generation error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("API Key session expired or invalid. Please re-select your key.");
      } else {
        setError("Failed to generate video. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">App Video Tutorial</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Learn how to master EasyIn Pro with our AI-generated visual guides. 
          This feature uses Google Veo to create a custom tutorial experience.
        </p>
      </div>

      {!hasKey ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Key size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">API Key Required</h3>
            <p className="text-slate-500 max-w-md">
              To generate high-quality videos using Veo, you need to select a paid Google Cloud API key.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={handleOpenKeyDialog}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1"
            >
              Learn about billing <ExternalLink size={12} />
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {videoUrl ? (
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative group">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setVideoUrl(null)}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Generate New
              </button>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center">
                <Play size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Ready to Generate</h3>
                <p className="text-slate-500">
                  Click below to create a cinematic visual guide for the new Cloud Sync feature.
                </p>
              </div>
              <button 
                disabled={isLoading}
                onClick={generateTutorialVideo}
                className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black shadow-2xl hover:bg-black transition-all disabled:opacity-50 flex items-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" />
                    Start Generation
                  </>
                )}
              </button>
              {isLoading && (
                <div className="w-full max-w-sm space-y-3">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 animate-pulse w-2/3 rounded-full" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Veo is crafting your video. This usually takes 1-2 minutes.
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
