export interface TTSOptions {
  lang: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  preferredVoice?: string | null;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices();
}

export function speak(text: string, options: TTSOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!text.trim()) {
      resolve();
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = mapLangToSpeechCode(options.lang);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    const voices = getAvailableVoices();
    if (options.preferredVoice) {
      const match = voices.find((v) => v.name === options.preferredVoice);
      if (match) utterance.voice = match;
    } else {
      const langMatch = voices.find((v) =>
        v.lang.startsWith(utterance.lang.split("-")[0])
      );
      if (langMatch) utterance.voice = langMatch;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === "canceled") {
        resolve();
      } else {
        reject(new Error(`TTS error: ${e.error}`));
      }
    };

    speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  speechSynthesis.cancel();
}

function mapLangToSpeechCode(code: string): string {
  const map: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-BR",
    ja: "ja-JP",
    zh: "zh-CN",
    ru: "ru-RU",
    ar: "ar-SA",
  };
  return map[code] || code;
}
