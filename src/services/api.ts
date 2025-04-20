import axios from 'axios'
import { Message, MessageType } from '../types/message'

// Request interfaces
export interface StartRequest {
  goal: string
  modelSettings: ModelSettings,
  visionModelSettings: ModelSettings,
  image_url: string,
}

export interface AnalyzeRequest {
  goal: string
  task: string
  model_settings: ModelSettings
  run_id: string
}

export interface ExecuteRequest {
  goal: string
  task: string
  analysis: Analysis
  run_id: string
}

export interface ModelSettings {
  // model: string
  // custom_api_key: string
  // temperature: number
  // max_tokens: number
  // language: string
  customModelName: string
}

export interface Analysis {
  reasoning: string
  arg: string
  action: string
}

// Response interfaces
export interface StartResponse {
  run_id: string,
  newTasks: string[],
}

export interface ChatResponse {
  message: string
  timestamp: string
  reasoning: string
  arg: string
  action: string
}

export interface AnalyzeResponse {
  reasoning: string
  arg: string
  action: string
}

export interface ExecuteResponse {
  reasoning: string
  arg: string
  action: string
}

export interface UploadImageResponse {
  url: string
}

export interface CreateTaskRequest {
  goal: string;
  model_settings: ModelSettings,
  vision_model_settings: ModelSettings,
  image_url: string;
  run_id: string;
  tasks: string[];
  last_task: string;
  result: string;
  completed_tasks: string[];
}

export interface CreateTaskResponse {
  run_id: string;
  newTasks: string[];
}

export interface SummarizeRequest {
  goal: string;
  model_settings: ModelSettings,
  vision_model_settings: ModelSettings,
  image_url: string;
  run_id: string;
  results: string[];
}

export interface ChatRequest extends SummarizeRequest {
  message: string
}


export interface ApiClient {
  startTask: (params: StartRequest) => Promise<StartResponse>
  createTask: (params: CreateTaskRequest) => Promise<CreateTaskResponse>
  chat: (params: ChatRequest, onChunk: (chunk: string) => void) => void
  analyze: (params: AnalyzeRequest) => Promise<AnalyzeResponse>
  execute: (params: ExecuteRequest, onChunk: (chunk: string) => void) => void
  summarize: (params: SummarizeRequest, onChunk: (chunk: string) => void) => void 
  uploadImage: (file: File) => Promise<UploadImageResponse>
}

/**
 * Creates an API client with the specified base URL
 * @param baseURL - The base URL for API requests (default: 'http://127.0.0.1:8888/')
 * @returns An object containing all API methods
 * 
 * @example
 * const api = createApi('https://api.example.com')
 * 
 * // Start a task
 * const result = await api.startTask({
 *   goal: 'Create a business plan',
 *   model_settings: { ... },
 *   run_id: 'uuid',
 *   tasks: [],
 *   last_task: '',
 *   result: '',
 *   completed_tasks: []
 * })
 * 
 * // Send a chat message
 * const chatResult = await api.chat({
 *   goal: 'Create a business plan',
 *   model_settings: { ... },
 *   run_id: 'uuid',
 *   message: 'Hello',
 *   results: []
 * })
 */
export const createApi = (baseURL: string = 'http://127.0.0.1:8888/'): ApiClient => {
  const api = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // 请求拦截器
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token') || 'test-token-abc123'
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  // 响应拦截器
  api.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // 处理未授权错误
            break
          case 403:
            // 处理禁止访问错误
            break
          case 404:
            // 处理未找到错误
            break
          default:
            // 处理其他错误
            break
        }
      }
      return Promise.reject(error)
    }
  )

  return {
    // Start a new task
    startTask: async (params: StartRequest): Promise<StartResponse> => {
      const response = await api.post<StartResponse>('/api/agent/start', params)
      return response.data
    },

    // Analyze a task
    analyze: async (params: AnalyzeRequest): Promise<AnalyzeResponse> => {
      const response = await api.post<AnalyzeResponse>('/api/agent/analyze', params)
      return response.data
    },

    execute: async (
      params: ExecuteRequest,
      onChunk: (chunk: string) => void
    ): Promise<void> => {
      const token = localStorage.getItem('token') || 'test-token-abc123'
      
      const response = await fetch(baseURL + '/api/agent/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });
    
      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      const flushThreshold = 50

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        if (buffer.length >= flushThreshold) {
          onChunk(buffer);
          buffer = '';
        }
      }

      if (buffer.length > 0) {
        onChunk(buffer); // flush 剩余内容
      }
    
    },

    createTask: async (params: CreateTaskRequest): Promise<CreateTaskResponse> => {
      const response = await api.post<CreateTaskResponse>('/api/agent/create', params)
      return response.data
    },

    // Upload an image
    uploadImage: async (file: File): Promise<UploadImageResponse> => {
      const formData = new FormData()
      formData.append('image', file)

      const response = await api.post<UploadImageResponse>(
        '/api/upload/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data
    },

    summarize: async (
      params: SummarizeRequest,
      onChunk: (chunk: string) => void
    ): Promise<void> => {
      const token = localStorage.getItem('token') || 'test-token-abc123'
      
      const response = await fetch(baseURL + '/api/agent/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });
    
      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      const flushThreshold = 50

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        if (buffer.length >= flushThreshold) {
          onChunk(buffer);
          buffer = '';
        }
      }

      if (buffer.length > 0) {
        onChunk(buffer); // flush 剩余内容
      }
    },

    chat: async (
      params: ChatRequest,
      onChunk: (chunk: string) => void
    ): Promise<void> => {
      const token = localStorage.getItem('token') || 'test-token-abc123'
      
      const response = await fetch(baseURL + '/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });
    
      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      const flushThreshold = 50

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        if (buffer.length >= flushThreshold) {
          onChunk(buffer);
          buffer = '';
        }
      }

      if (buffer.length > 0) {
        onChunk(buffer); // flush 剩余内容
      }
    },

  }
}
