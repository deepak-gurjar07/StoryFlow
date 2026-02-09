
import React, { useState, useEffect, useRef } from 'react';
import { Scene, ImageSize, StoryboardState } from './types';
import { parseScriptToScenes, generateStoryboardImage } from './services/geminiService';
import ApiKeyWall from './components/ApiKeyWall';
import ChatBot from './components/ChatBot';
import SceneCard from './components/SceneCard';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [script, setScript] = useState('');
  const [state, setState] = useState<StoryboardState>({
    title: 'Untitled Project',
    scenes: [],
    isParsing: false,
    imageSize: '1K'
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Fallback for environments where window.aistudio doesn't exist
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setScript(text);
    };
    reader.readAsText(file);
  };

  const processScript = async () => {
    if (!script.trim()) return;
    setError(null);
    setState(prev => ({ ...prev, isParsing: true }));
    
    try {
      const parsedScenes = await parseScriptToScenes(script);
      setState(prev => ({ ...prev, scenes: parsedScenes, isParsing: false }));
    } catch (err) {
      // Reset key selection if entity not found error occurs
      if (err instanceof Error && err.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
      }
      setError(err instanceof Error ? err.message : 'Failed to parse script.');
      setState(prev => ({ ...prev, isParsing: false }));
    }
  };

  const handleGenerateImage = async (id: string) => {
    const sceneToGen = state.scenes.find(s => s.id === id);
    if (!sceneToGen) return;

    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === id ? { ...s, status: 'generating' } : s)
    }));

    try {
      const url = await generateStoryboardImage(sceneToGen.visualPrompt, state.imageSize);
      setState(prev => ({
        ...prev,
        scenes: prev.scenes.map(s => s.id === id ? { ...s, imageUrl: url, status: 'completed' } : s)
      }));
    } catch (err) {
      console.error(err);
      // Reset key selection if entity not found error occurs
      if (err instanceof Error && err.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
      }
      setState(prev => ({
        ...prev,
        scenes: prev.scenes.map(s => s.id === id ? { ...s, status: 'error' } : s)
      }));
    }
  };

  const generateAllPending = async () => {
    const pending = state.scenes.filter(s => s.status === 'pending' || s.status === 'error');
    for (const scene of pending) {
      await handleGenerateImage(scene.id);
    }
  };

  if (hasApiKey === false) {
    return <ApiKeyWall onContinue={() => setHasApiKey(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <h1 className="font-serif text-xl font-bold text-white tracking-tight">StoryFlow Pro</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase px-1">Quality</span>
            {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setState(prev => ({ ...prev, imageSize: size }))}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  state.imageSize === size 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          
          <button 
            className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
            onClick={async () => {
              await window.aistudio.openSelectKey();
            }}
          >
            Change Key
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar - Script Input */}
        <aside className="w-full md:w-96 border-r border-zinc-800 flex flex-col bg-zinc-950">
          <div className="p-6 border-b border-zinc-800 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Script Editor</h2>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload File
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".txt,.md,.doc,.docx"
              />
            </div>
            
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Paste your script here... (e.g. INT. COFFEE SHOP - DAY...)"
              className="w-full h-80 md:h-[calc(100vh-400px)] bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 text-sm font-mono leading-relaxed text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
            
            <button
              onClick={processScript}
              disabled={state.isParsing || !script.trim()}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                state.isParsing 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {state.isParsing ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></div>
                  Analyzing Script...
                </>
              ) : (
                <>
                  Analyze Script
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Tips</h3>
            <ul className="text-xs text-zinc-400 space-y-3">
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Use standard screenplay format for best results.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Gemini Pro Image creates cinematic, high-fidelity storyboard panels.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Ask the Director's Assistant for framing or lighting ideas.
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content Area - Storyboard View */}
        <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
          {state.scenes.length > 0 ? (
            <>
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md z-10 sticky top-0">
                <h2 className="text-lg font-semibold text-white">Visual Sequence</h2>
                <button
                  onClick={generateAllPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                  Generate All Frames
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {state.scenes.map((scene) => (
                    <SceneCard 
                      key={scene.id} 
                      scene={scene} 
                      onGenerate={handleGenerateImage} 
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
              <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </div>
              <h3 className="text-xl font-serif text-white mb-2">No script analyzed yet</h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Paste a scene description or upload a script in the editor to start generating your cinematic storyboard.
              </p>
            </div>
          )}
        </div>
      </main>

      <ChatBot />
    </div>
  );
};

export default App;
