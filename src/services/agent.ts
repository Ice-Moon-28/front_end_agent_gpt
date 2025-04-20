import { Message, MessageType } from '../types/message'
import { actions, state } from './store'
import { AnalyzeResponse, ApiClient, createApi } from './api'
import { t } from 'i18next'

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export class Agent {
  private chatAPI: ApiClient

  constructor(baseURL: string = 'http://your-api-base-url') {
    this.chatAPI = createApi(baseURL)
  }

  async addMessagesWithDelay(messages: Message[], delayMs: number = 300) {
    for (const message of messages) {
      actions.addMessage(message)
      await delay(delayMs)
    }
  }

  async start_task(goal: string) {
    try {
      const newMessage: Message = {
        id: Date.now(),
        text: goal,
        type: MessageType.USER_INPUT,
        role: 'user',
        timestamp: new Date()
      }

      actions.addMessage(newMessage)

      actions.setGoal(goal)

      actions.addMessage({
        id: Date.now(),
        text: goal,
        type: MessageType.STARTING_TASK,
        role: 'assistant',
        timestamp: new Date()
      })

      const response = await this.chatAPI.startTask(
        {
          goal: state.goal,
          modelSettings: {
            customModelName: state.model_settings.model,
          },
          visionModelSettings:{
            customModelName: state.vision_model_settings.model,
          },
          image_url: state.image_url || '',
        }
      )

      actions.setRunId(response.run_id)

      actions.addTasks(response.newTasks)

      const new_messages: Message[] = response.newTasks.map((task, index) => ({
          id: Date.now() + index,
          text: task,
          type: MessageType.TASK_ADDED,
          role: 'assistant',
          timestamp: new Date()
      }))

      await this.addMessagesWithDelay(new_messages, 1000)


      while (state.uncompleted_tasks.length > 0) {
        const analyzing_task = state.uncompleted_tasks.shift()

        if (analyzing_task) {
          const analyzed_response = await this.analyze_task(analyzing_task)

          const result = await this.execute(analyzing_task, analyzed_response)
  
          actions.completeFirstTask()
  
          actions.updateLastResult(result)

          actions.updateLastTask(analyzing_task)
  
          actions.addResults(result)
  
          console.log(state.tasks, state.completed_tasks, state.uncompleted_tasks)
  
          await this.create()
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  async analyze_task(task: string) {
    try {
      const newMessage: Message = {
        id: Date.now(),
        text: task,
        type: MessageType.ANALYZING_TASK,
        role: 'assistant',
        timestamp: new Date()
      }

      actions.addMessage(newMessage)


      const response = await this.chatAPI.analyze(
        {
          goal: state.goal,
          task: task,
          model_settings: {
            customModelName: state.model_settings.model,
          },
          run_id: state.run_id,
        }
      )

      return response

    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  async execute(task: string, analyzed_task: AnalyzeResponse) {
    try {

      const message_Id = Date.now()

      const newMessage: Message = {
        id: message_Id,
        text: analyzed_task.action + ' ' + analyzed_task.arg,
        type: MessageType.EXECUTING_TASK,
        role: 'assistant',
        timestamp: new Date(),
        detail: '',
        detailItemId: message_Id + 'execute'
      }


      actions.addMessage(newMessage)

      let total_result = ''

      await this.chatAPI.execute(
        {
          goal: state.goal,
          task: task,
          analysis: analyzed_task,
          run_id: state.run_id,
        },
        (chunk) => {
          state.message[state.message.length - 1].detail += chunk

          total_result += chunk
        }
      )
      
      return total_result

    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  async create() {
    try {

      const response = await this.chatAPI.createTask(
        {
          goal: state.goal,
          model_settings: {
            customModelName: state.model_settings.model,
          },
          vision_model_settings:{
            customModelName: state.vision_model_settings.model,
          },
          image_url: state.image_url || '',
          run_id: state.run_id,
          tasks: state.tasks,
          last_task: state.last_task || '',
          result: state.last_result,
          completed_tasks: state.completed_tasks,
        }
      )

      let add_tasks = []

      for (const new_task of response.newTasks) {
        if (!state.tasks.includes(new_task)) {
          add_tasks.push(new_task)
        }
      }

      actions.addTasks(add_tasks)

      const new_messages: Message[] = add_tasks.map((task, index) => ({
          id: Date.now() + index,
          text: task,
          type: MessageType.TASK_ADDED,
          role: 'assistant',
          timestamp: new Date()
      }))

      await this.addMessagesWithDelay(new_messages, 1000)

    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  async summarize() {
    const message_Id = Date.now()

    const newMessage: Message = {
      id: message_Id,
      text: '',
      type: MessageType.GENERATED_REPORT,
      role: 'assistant',
      timestamp: new Date(),
      detail: '',
      detailItemId: message_Id + 'execute'
    }

    actions.addMessage(newMessage)
  
    await this.chatAPI.summarize(
      {
        goal: state.goal,
        model_settings: {
          customModelName: state.model_settings.model,
        },
        vision_model_settings:{
          customModelName: state.vision_model_settings.model,
        },
        image_url: state.image_url || '',
        run_id: state.run_id,
        results: state.results,
      },
      (chunk) => {
        state.message[state.message.length - 1].detail += chunk
      },
    )
  }
  

  async chat(message: string) {
    try {
      const message_Id = Date.now()

      const newMessage: Message = {
        id: message_Id,
        text: '',
        type: MessageType.GENERATED_REPORT,
        role: 'assistant',
        timestamp: new Date(),
        detail: '',
        detailItemId: message_Id + 'execute'
      }

      actions.addMessage(newMessage)
    
      await this.chatAPI.chat(
        {
          goal: state.goal,
          model_settings: {
            customModelName: state.model_settings.model,
          },
          vision_model_settings:{
            customModelName: state.vision_model_settings.model,
          },
          image_url: state.image_url || '',
          run_id: state.run_id,
          results: state.results,
          message: message,
        },
        (chunk) => {
          state.message[state.message.length - 1].detail += chunk
        },
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  async uploadImage(file: File) {

    try {
      const res = await this.chatAPI.uploadImage(file)

      const newMessage: Message = {
        id: Date.now(),
        text: t('message.uploadSuccess'),
        type: MessageType.USER_INPUT,
        role: 'user',
        timestamp: new Date(),
        imageUrl: res.url
      }

      actions.addMessage(newMessage)

      actions.setImageUrl(res.url)
      
    } catch (error) {
      console.error('Failed to upload image:', error)
      throw error
    }
  }
}

// Create a singleton instance
export const AgentInstance = new Agent('http://127.0.0.1:8888')

// Export default instance for convenience
export default AgentInstance