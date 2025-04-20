export enum MessageType {
  // 用户信息
  USER_INPUT = 'user_input',
  // 新增任务
  TASK_ADDED = 'task_added',
  // 开始任务
  STARTING_TASK = 'starting_task',
  // 分析任务
  ANALYZING_TASK = 'analyzing_task',
  // 执行任务 
  EXECUTING_TASK = 'executing_task',
  // 生成总结报告
  GENERATED_REPORT = 'generated_response',
}

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: number
  text: string
  type: MessageType
  role: MessageRole
  timestamp: Date
  imageUrl?: string
  detail?: string
  detailItemId?: string
} 