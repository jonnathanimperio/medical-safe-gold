type Pipeline = {
  (audio: Float32Array, options?: Record<string, unknown>): Promise<{ text: string } | Array<{ text: string }>>;
};

let sttPipeline: Pipeline | null = null;
let loading = false;

type ProgressCallback = (progress: { status: string; progress?: number; file?: string }) => void;

export async function loadSTT(
  modelName: string,
  onProgress?: ProgressCallback
): Promise<void> {
  if (sttPipeline || loading) return;
  loading = true;

  try {
    const { pipeline } = await import("@huggingface/transformers");
    sttPipeline = (await pipeline("automatic-speech-recognition", modelName, {
      progress_callback: onProgress as Parameters<typeof pipeline>[2] extends { progress_callback?: infer P } ? P : never,
      dtype: "fp32",
      device: "wasm",
    })) as unknown as Pipeline;
  } finally {
    loading = false;
  }
}

export function isSTTLoaded(): boolean {
  return sttPipeline !== null;
}

export async function transcribe(audioBlob: Blob): Promise<string> {
  if (!sttPipeline) {
    throw new Error("STT model not loaded");
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const float32Data = audioBuffer.getChannelData(0);
  await audioContext.close();

  const result = await sttPipeline(float32Data, {
    language: "auto",
    task: "transcribe",
    chunk_length_s: 30,
  });

  const text = Array.isArray(result) ? result[0]?.text : result.text;
  return (text || "").trim();
}
