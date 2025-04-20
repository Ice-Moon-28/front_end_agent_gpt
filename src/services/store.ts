import { proxy } from 'valtio'
import { TaskState, TaskActions } from '../types/task'

const initialState: TaskState = {
  run_id: '',
  model_settings: {
    model: 'gpt-3.5-turbo',
    custom_api_key: '',
    temperature: 0.8,
    max_tokens: 1250,
    language: 'English'
  },
  vision_model_settings: {
    model: 'gpt-4o-mini',
    custom_api_key: '',
    temperature: 0.8,
    max_tokens: 1250,
    language: 'English'
  },
  goal: '',
  tasks: [],
  uncompleted_tasks: [],
  completed_tasks: [],
  image_url: '',
  message: [],
  last_result: '',
  last_task: '',
  results: [],
  enableSummarize: false,
}

export const state = proxy<TaskState>(initialState)

// Actions
export const actions: TaskActions = {
  setRunId: (run_id: string) => {
    state.run_id = run_id
  },

  setModelSettings: (settings: TaskState['model_settings']) => {
    state.model_settings = settings
  },

  setGoal: (goal: string) => {
    state.goal = goal
  },

  addTasks: (tasks: string[]) => {
    state.tasks.push(...tasks)
    state.uncompleted_tasks.push(...tasks)
  },

  completeFirstTask: () => {
    const completed_task = state.uncompleted_tasks.shift()

    if (completed_task) {
      state.completed_tasks.push(completed_task)
    }
  },

  updateLastResult: (result: string) => {
    state.last_result = result
  },

  updateLastTask: (task: string) => {
    state.last_task = task
  },

  addResults: (result: string) => {
    state.results.push(result)
  },

  addMessage: (newMessage) => {
    state.message.push(newMessage)
  },

  setMessage: (newMessages) => {
    state.message = newMessages
  },

  setImageUrl: (newImage) => {
    state.image_url = newImage
  },

  setEnableSummariz: (summarize: boolean) => {
    state.enableSummarize = summarize
  },
  reset: function (): void {
    throw new Error('Function not implemented.')
  }
} 