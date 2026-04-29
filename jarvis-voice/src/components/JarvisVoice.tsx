"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { AppConfig, Language, DubbingStep, DubbingResult } from "@/lib/types";
import { AudioRecorder } from "@/lib/audio-recorder";
import { loadSTT, transcribe, isSTTLoaded } from "@/lib/stt-engine";
import { translate } from "@/lib/translator";
import { speak, stopSpeaking } from "@/lib/tts-engine";

export default function JarvisVoice() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [step, setStep] = useState<DubbingStep>("idle");
  const [sttReady, setSttReady] = useState(false);
  const [sttProgress, setSttProgress] = useState(0);
  const [sttStatus, setSttStatus] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [detectedLang, setDetectedLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [history, setHistory] = useState<DubbingResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [translateProgress, setTranslateProgress] = useState("");

  const recorderRef = useRef<AudioRecorder | null>(null);
  const cancelledRef = useRef(false);

  // Load config
  useEffect(() => {
    fetch("/config.json")
      .then((r) => r.json())
      .then((c: AppConfig) => setConfig(c))
      .catch(() => setError("Falha ao carregar config.json"));
  }, []);

  // Load STT model once config is available
  useEffect(() => {
    if (!config || sttReady || isSTTLoaded()) return;

    loadSTT(config.whisper.model, (p) => {
      setSttStatus(p.status);
      if (p.progress !== undefined) {
        setSttProgress(Math.round(p.progress));
      }
    }).then(() => {
      setSttReady(true);
      setSttProgress(100);
      setSttStatus("ready");
    }).catch((err) => {
      setError(`Erro ao carregar modelo Whisper: ${err.message}`);
    });
  }, [config, sttReady]);

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null);
    setOriginalText("");
    setDetectedLang("en");
    setTranslatedText("");
    setSelectedLang(null);
    cancelledRef.current = false;

    // Clean up any previous recorder to prevent mic leaks
    if (recorderRef.current) {
      try { await recorderRef.current.stop(); } catch { /* ignore */ }
      recorderRef.current = null;
    }

    try {
      const recorder = new AudioRecorder();
      await recorder.start();
      if (cancelledRef.current) {
        try { await recorder.stop(); } catch { /* ignore */ }
        return;
      }
      recorderRef.current = recorder;
      setStep("recording");
    } catch (err) {
      setError(`Microfone: ${(err as Error).message}`);
    }
  }, []);

  // Stop recording and transcribe
  const stopRecording = useCallback(async () => {
    cancelledRef.current = true;
    if (!recorderRef.current) return;

    try {
      setStep("transcribing");
      const blob = await recorderRef.current.stop();
      recorderRef.current = null;

      const { text, detectedLanguage } = await transcribe(blob);
      if (!text) {
        setError("Nenhuma fala detectada. Tente novamente.");
        setStep("idle");
        return;
      }

      setOriginalText(text);
      setDetectedLang(detectedLanguage);
      setStep("selecting_language");
    } catch (err) {
      setError(`Transcrição: ${(err as Error).message}`);
      setStep("idle");
    }
  }, []);

  // Global mouseup/touchend to stop recording even if cursor leaves button
  useEffect(() => {
    if (step !== "recording") return;
    const handleGlobalUp = () => {
      stopRecording();
    };
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchend", handleGlobalUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, [step, stopRecording]);

  // Select language and translate
  const selectLanguage = useCallback(
    async (lang: Language) => {
      if (!originalText) return;
      setSelectedLang(lang);
      setStep("translating");
      setTranslateProgress("Carregando modelo de tradução...");

      try {
        const translated = await translate(originalText, detectedLang, lang.code, (p) => {
          setTranslateProgress(p.status === "progress" ? `Baixando: ${Math.round(p.progress || 0)}%` : p.status);
        });
        setTranslatedText(translated);
        setTranslateProgress("");

        // Speak the translated text
        setStep("speaking");
        if (config) {
          await speak(translated, {
            lang: lang.code,
            rate: config.voice.rate,
            pitch: config.voice.pitch,
            volume: config.voice.volume,
            preferredVoice: config.voice.preferredVoice,
          });
        }

        // Save to history
        const result: DubbingResult = {
          originalText,
          translatedText: translated,
          sourceLanguage: detectedLang,
          targetLanguage: lang,
          timestamp: Date.now(),
        };
        setHistory((prev) => [result, ...prev].slice(0, 50));
        setStep("done");
      } catch (err) {
        setError(`Tradução: ${(err as Error).message}`);
        setStep("selecting_language");
      }
    },
    [originalText, detectedLang, config]
  );

  const reset = useCallback(() => {
    stopSpeaking();
    setStep("idle");
    setOriginalText("");
    setDetectedLang("en");
    setTranslatedText("");
    setSelectedLang(null);
    setError(null);
    setTranslateProgress("");
  }, []);

  if (!config) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-foreground/60">Carregando configuração...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 max-w-lg mx-auto w-full">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">
              {config.brand.name}
            </h1>
            <p className="text-xs text-foreground/50 font-mono">
              {config.brand.tagline} · v{config.brand.version}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                sttReady ? "bg-accent" : "bg-warning animate-pulse"
              }`}
            />
            <span className="text-xs text-foreground/50 font-mono">
              {sttReady ? "ONLINE" : "LOADING"}
            </span>
          </div>
        </div>

        {/* STT Loading Progress */}
        {!sttReady && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-foreground/40 mb-1 font-mono">
              <span>Whisper Engine</span>
              <span>{sttProgress}%</span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${sttProgress}%` }}
              />
            </div>
            <p className="text-xs text-foreground/30 mt-1 font-mono">{sttStatus}</p>
          </div>
        )}
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Welcome / Idle State */}
        {step === "idle" && history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center text-3xl">
              🎙️
            </div>
            <div>
              <p className="text-sm text-foreground/70">
                Segure o botão e fale.
              </p>
              <p className="text-xs text-foreground/40 mt-1">
                A IA transcreve, traduz e dubla — tudo offline.
              </p>
            </div>
          </div>
        )}

        {/* History */}
        {history.map((item, i) => (
          <div key={item.timestamp} className={`animate-fade-in-up ${i > 0 ? "opacity-60" : ""}`}>
            {/* Original */}
            <div className="flex justify-end mb-2">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{item.originalText}</p>
                <p className="text-xs text-foreground/30 mt-1 font-mono">
                  Detectado · {new Date(item.timestamp).toLocaleTimeString("pt-BR")}
                </p>
              </div>
            </div>
            {/* Translated */}
            <div className="flex justify-start">
              <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{item.translatedText}</p>
                <p className="text-xs text-foreground/30 mt-1 font-mono">
                  {item.targetLanguage.flag} {item.targetLanguage.name}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Active states */}
        {step === "recording" && (
          <div className="flex justify-center py-8 animate-fade-in-up">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-danger/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-danger animate-pulse" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-danger/40 animate-pulse-ring" />
              </div>
              <p className="text-sm text-danger font-medium">Ouvindo...</p>
              <p className="text-xs text-foreground/40">Solte o botão para parar</p>
            </div>
          </div>
        )}

        {step === "transcribing" && (
          <div className="flex justify-center py-8 animate-fade-in-up">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                <div className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="typing-dot w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
              <p className="text-sm text-foreground/60">Transcrevendo com Whisper...</p>
            </div>
          </div>
        )}

        {step === "selecting_language" && (
          <div className="animate-fade-in-up space-y-4">
            {/* Show original text */}
            <div className="flex justify-end">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{originalText}</p>
                <p className="text-xs text-foreground/30 mt-1 font-mono">Transcrito</p>
              </div>
            </div>

            {/* Language selector */}
            <div className="bg-surface border border-border rounded-2xl p-4">
              <p className="text-sm font-medium text-foreground mb-3">
                Qual idioma para a dublagem?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {config.languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-2 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "translating" && (
          <div className="animate-fade-in-up space-y-4">
            <div className="flex justify-end">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{originalText}</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5 mb-2">
                  <div className="typing-dot w-2 h-2 rounded-full bg-secondary" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-secondary" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-secondary" />
                </div>
                <p className="text-xs text-foreground/40 font-mono">
                  {translateProgress || `Traduzindo para ${selectedLang?.name}...`}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "speaking" && (
          <div className="animate-fade-in-up space-y-4">
            <div className="flex justify-end">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{originalText}</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-accent/10 border border-accent/30 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{translatedText}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[12, 18, 10, 16, 14].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-accent rounded-full animate-pulse"
                        style={{
                          height: `${h}px`,
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-accent font-mono">
                    {selectedLang?.flag} Reproduzindo...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="animate-fade-in-up space-y-4">
            <div className="flex justify-end">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{originalText}</p>
                <p className="text-xs text-foreground/30 mt-1 font-mono">Original</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{translatedText}</p>
                <p className="text-xs text-foreground/30 mt-1 font-mono">
                  {selectedLang?.flag} {selectedLang?.name} · Dublado
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="animate-fade-in-up bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
            <p className="text-sm text-danger">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-danger/60 hover:text-danger mt-1 underline"
            >
              Fechar
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <footer className="px-6 py-4 border-t border-border">
        <div className="flex items-center justify-center gap-4">
          {step === "done" && (
            <button
              onClick={reset}
              className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground border border-border rounded-xl hover:border-primary/30 transition-all"
            >
              Nova Gravação
            </button>
          )}

          {/* Main Record Button */}
          <button
            onMouseDown={startRecording}
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            disabled={
              !sttReady ||
              step === "transcribing" ||
              step === "translating" ||
              step === "speaking"
            }
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              step === "recording"
                ? "bg-danger scale-110 shadow-lg shadow-danger/30"
                : sttReady
                ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-105"
                : "bg-foreground/20 cursor-not-allowed"
            }`}
          >
            {step === "recording" ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-background" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
            {step === "recording" && (
              <div className="absolute inset-0 rounded-full border-2 border-danger/40 animate-pulse-ring" />
            )}
          </button>

          {step === "selecting_language" && (
            <button
              onClick={reset}
              className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground border border-border rounded-xl hover:border-danger/30 transition-all"
            >
              Cancelar
            </button>
          )}
        </div>

        <p className="text-center text-xs text-foreground/30 mt-3 font-mono">
          {step === "idle" && (sttReady ? "Segure para falar" : "Carregando Whisper...")}
          {step === "recording" && "Ouvindo... solte para processar"}
          {step === "transcribing" && "Processando áudio com Whisper..."}
          {step === "selecting_language" && "Escolha o idioma de destino"}
          {step === "translating" && `Traduzindo para ${selectedLang?.name}...`}
          {step === "speaking" && "Reproduzindo dublagem..."}
          {step === "done" && "Dublagem concluída"}
        </p>

        <div className="flex justify-center gap-4 mt-2 text-xs text-foreground/20 font-mono">
          <span>EDGE AI</span>
          <span>·</span>
          <span>ZERO CLOUD</span>
          <span>·</span>
          <span>100% LOCAL</span>
        </div>
      </footer>
    </div>
  );
}
