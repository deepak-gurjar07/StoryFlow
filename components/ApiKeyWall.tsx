
import React from 'react';

interface ApiKeyWallProps {
  onContinue: () => void;
}

const ApiKeyWall: React.FC<ApiKeyWallProps> = ({ onContinue }) => {
  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Proceed immediately as per instructions
      onContinue();
    } catch (error) {
      console.error("Error selecting key:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2">StoryFlow Pro</h1>
          <p className="text-zinc-400">Cinematic storyboarding powered by Gemini 3 Pro.</p>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl space-y-4">
          <p className="text-sm text-zinc-300">
            To use the High-Quality Image Generation (Gemini 3 Pro Image), you must select a valid API key from a paid GCP project.
          </p>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 underline block"
          >
            Learn about billing and API keys
          </a>
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            Select API Key to Begin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyWall;
