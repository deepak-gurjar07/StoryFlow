
import React from 'react';
import { Scene } from '../types';

interface SceneCardProps {
  scene: Scene;
  onGenerate: (id: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, onGenerate }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full group">
      <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden">
        {scene.imageUrl ? (
          <img 
            src={scene.imageUrl} 
            alt={`Scene ${scene.sceneNumber}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-center p-6 flex flex-col items-center">
            {scene.status === 'generating' ? (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs text-zinc-500 animate-pulse">Painting with AI...</p>
              </div>
            ) : (
              <button
                onClick={() => onGenerate(scene.id)}
                className="p-4 rounded-full bg-zinc-800 text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all group-hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
            )}
          </div>
        )}
        
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
          Scene {scene.sceneNumber}
        </div>
        
        {scene.status === 'error' && (
          <div className="absolute inset-0 bg-red-950/20 flex items-center justify-center">
            <p className="text-red-400 text-xs font-medium">Generation Failed</p>
          </div>
        )}
      </div>
      
      <div className="p-5 space-y-3 flex-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-semibold text-zinc-200 line-clamp-1">{scene.setting}</h3>
          {scene.imageUrl && (
            <button 
              onClick={() => onGenerate(scene.id)}
              className="text-zinc-500 hover:text-indigo-400 p-1"
              title="Regenerate Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
          {scene.description}
        </p>
        {scene.dialogue && (
          <div className="pt-2 border-t border-zinc-800">
            <p className="text-[11px] font-mono text-indigo-400 uppercase tracking-tight mb-1">Dialogue</p>
            <p className="text-[11px] text-zinc-300 italic">"{scene.dialogue}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneCard;
