export interface ScriptLine {
  character: string
  text: string
}

export interface Scene {
  id: number
  title: string
  characters: string[]
  lines: ScriptLine[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
