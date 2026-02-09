
export interface Scene {
  id: string;
  sceneNumber: number;
  description: string;
  visualPrompt: string;
  setting: string;
  dialogue?: string;
  imageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export type ImageSize = '1K' | '2K' | '4K';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StoryboardState {
  title: string;
  scenes: Scene[];
  isParsing: boolean;
  imageSize: ImageSize;
}

// Fix aistudio declaration to match the existing global interface and modifiers
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Removed readonly modifier to match the platform's global Window definition and fix "identical modifiers" error
    aistudio: AIStudio;
  }
}
