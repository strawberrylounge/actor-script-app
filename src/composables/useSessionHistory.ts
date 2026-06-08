import { ref } from 'vue'
import type { Session } from '../types/session'
import type { ChatMessage } from '../types/script'

const STORAGE_KEY = 'practice-sessions'

function load(): Session[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persist(list: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export const sessionHistory = ref<Session[]>(load())

export function createSession(sceneTitle: string, character: string): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    sceneTitle,
    character,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  sessionHistory.value.unshift(session)
  persist(sessionHistory.value)
  return session
}

export function updateSession(id: string, messages: ChatMessage[]) {
  const session = sessionHistory.value.find(s => s.id === id)
  if (!session) return
  session.messages = [...messages]
  session.updatedAt = Date.now()
  persist(sessionHistory.value)
}

export function removeSession(id: string) {
  sessionHistory.value = sessionHistory.value.filter(s => s.id !== id)
  persist(sessionHistory.value)
}
