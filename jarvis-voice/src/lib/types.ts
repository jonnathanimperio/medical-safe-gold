export interface AppConfig {
  brand: {
    name: string;
    tagline: string;
    version: string;
    logo: string | null;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    fontFamily: string;
  };
  languages: Language[];
  voice: {
    rate: number;
    pitch: number;
    volume: number;
    preferredVoice: string | null;
  };
  whisper: {
    model: string;
    language: string;
  };
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export type DubbingStep =
  | "idle"
  | "recording"
  | "transcribing"
  | "selecting_language"
  | "translating"
  | "speaking"
  | "done";

export interface DubbingResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: Language;
  timestamp: number;
}
