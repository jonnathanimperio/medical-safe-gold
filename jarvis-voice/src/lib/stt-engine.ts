type PipelineResult = {
  text: string;
  chunks?: Array<{ text: string; timestamp: number[]; language?: string }>;
};

type Pipeline = {
  (audio: Float32Array, options?: Record<string, unknown>): Promise<PipelineResult | PipelineResult[]>;
};

export interface TranscriptionResult {
  text: string;
  detectedLanguage: string;
}

let sttPipeline: Pipeline | null = null;
let loadingPromise: Promise<void> | null = null;

type ProgressCallback = (progress: { status: string; progress?: number; file?: string }) => void;

export async function loadSTT(
  modelName: string,
  onProgress?: ProgressCallback
): Promise<void> {
  if (sttPipeline) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const { pipeline } = await import("@huggingface/transformers");
      sttPipeline = (await pipeline("automatic-speech-recognition", modelName, {
        progress_callback: onProgress as Parameters<typeof pipeline>[2] extends { progress_callback?: infer P } ? P : never,
        dtype: "fp32",
        device: "wasm",
      })) as unknown as Pipeline;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

export function isSTTLoaded(): boolean {
  return sttPipeline !== null;
}

export async function transcribe(audioBlob: Blob): Promise<TranscriptionResult> {
  if (!sttPipeline) {
    throw new Error("STT model not loaded");
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });
  let float32Data: Float32Array;
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    float32Data = audioBuffer.getChannelData(0);
  } finally {
    await audioContext.close();
  }

  const result = await sttPipeline(float32Data, {
    language: "auto",
    task: "transcribe",
    chunk_length_s: 30,
    return_timestamps: true,
  });

  const output = Array.isArray(result) ? result[0] : result;
  const text = (output?.text || "").trim();

  let detectedLanguage = "en";
  if (output?.chunks && output.chunks.length > 0 && output.chunks[0].language) {
    detectedLanguage = output.chunks[0].language;
  }

  return { text, detectedLanguage };
}
