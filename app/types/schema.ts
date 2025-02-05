export interface Data {
    stats: {
      totalCost: number;
      totalTokens: number;
    };
    workers: WorkerInstance[];
  }
  
  export interface LlamaModel {
    id: string;
    name: string;
    size: number;
    metadata: {
      contextSize: number;
      quantization: string;
      parameters: number;
      license?: string;
    };
    status: 'uploading' | 'ready' | 'error';
    created: string;
  }
  
  export interface WorkerInstance {
    id: string;
    load: number;
    status: 'active' | 'inactive';
    lastHeartbeat: number;
    memory: {
      used: number;
      total: number;
    };
  }
  
  export interface InferenceRequest {
    modelId: string;
    prompt: string;
    parameters: {
      maxTokens: number;
      temperature: number;
      topP: number;
      stop?: string[];
    };
  }
  
  export interface InferenceResponse {
    text: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    metadata: {
      duration: number;
      modelId: string;
      workerId: string;
    };
  }

  export interface CloudflareEnv {}