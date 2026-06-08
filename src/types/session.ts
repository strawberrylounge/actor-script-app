import type { ChatMessage } from './script'

export interface Session {
  id: string
  sceneTitle: string
  character: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}
