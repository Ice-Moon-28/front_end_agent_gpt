import { Message } from "./message"

export interface ModelSettings {
  model: string
  custom_api_key: string
  temperature: number
  max_tokens: number
  language: string
}

export interface TaskState {
  run_id: string
  model_settings: ModelSettings,
  vision_model_settings: ModelSettings,
  goal: string
  // 当前所有需要完成的任务
  tasks: string[],
  // 当前未完成的任务
  uncompleted_tasks: string[],
  // 当前已经完成的任务
  completed_tasks: string[],
  image_url: string
  message: Message[]
  // 最近被处理的一个任务
  last_task: string
  // 最近被处理的任务的结果
  last_result: string
  results: string[]
  enableSummarize: boolean
}

export interface TaskActions {
  setRunId: (run_id: string) => void
  setModelSettings: (settings: ModelSettings) => void
  setGoal: (goal: string) => void
  // setTasks: (task: string[]) => void
  addTasks: (task: string[]) => void
  completeFirstTask: () => void
  updateLastResult: (result: string) => void
  updateLastTask: (task: string) => void
  reset: () => void,
  addResults: (result: string) => void
  addMessage: (message: Message) => void,
  setMessage: (messages: Message[]) => void,
  setImageUrl: (imageUrl: string) => void,
  setEnableSummariz: (summarize: boolean) => void,
} 