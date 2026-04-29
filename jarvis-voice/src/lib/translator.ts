type TranslatorFn = {
  (text: string): Promise<unknown>;
};

const translatorCache = new Map<string, TranslatorFn>();
const loadingSet = new Set<string>();

type ProgressCallback = (progress: { status: string; progress?: number; file?: string }) => void;

function getModelName(source: string, target: string): string {
  return `Xenova/opus-mt-${source}-${target}`;
}

export async function translate(
  text: string,
  sourceLang: string,
  targetLang: string,
  onProgress?: ProgressCallback
): Promise<string> {
  if (sourceLang === targetLang) return text;

  const normalizedSource = normalizeLanguageCode(sourceLang);
  const normalizedTarget = normalizeLanguageCode(targetLang);

  const modelKey = `${normalizedSource}-${normalizedTarget}`;
  const modelName = getModelName(normalizedSource, normalizedTarget);

  let translator = translatorCache.get(modelKey);

  if (!translator && !loadingSet.has(modelKey)) {
    loadingSet.add(modelKey);
    try {
      const { pipeline } = await import("@huggingface/transformers");
      const t = await pipeline("translation", modelName, {
        progress_callback: onProgress as Parameters<typeof pipeline>[2] extends { progress_callback?: infer P } ? P : never,
        device: "wasm",
      });
      translator = t as unknown as TranslatorFn;
      translatorCache.set(modelKey, translator);
    } catch {
      loadingSet.delete(modelKey);
      return fallbackTranslate(text, normalizedSource, normalizedTarget, onProgress);
    }
    loadingSet.delete(modelKey);
  }

  while (loadingSet.has(modelKey)) {
    await new Promise((r) => setTimeout(r, 100));
    translator = translatorCache.get(modelKey);
  }

  if (!translator) {
    return fallbackTranslate(text, normalizedSource, normalizedTarget, onProgress);
  }

  const result = await translator(text);

  let translated = "";
  if (Array.isArray(result) && result.length > 0) {
    const first = result[0] as Record<string, unknown>;
    if (typeof first.translation_text === "string") {
      translated = first.translation_text;
    }
  } else if (result && typeof result === "object" && "translation_text" in (result as Record<string, unknown>)) {
    translated = (result as Record<string, string>).translation_text;
  }

  return (translated || text).trim();
}

async function fallbackTranslate(
  text: string,
  source: string,
  target: string,
  onProgress?: ProgressCallback
): Promise<string> {
  if (source !== "en" && target !== "en") {
    try {
      const toEnglish = await translate(text, source, "en", onProgress);
      return translate(toEnglish, "en", target, onProgress);
    } catch {
      return `[${target}] ${text}`;
    }
  }
  return `[${target}] ${text}`;
}

function normalizeLanguageCode(code: string): string {
  const map: Record<string, string> = {
    pt: "pt",
    en: "en",
    es: "es",
    fr: "fr",
    de: "de",
    it: "it",
    ja: "jap",
    zh: "zh",
    ru: "ru",
    ar: "ar",
  };
  return map[code] || code;
}
