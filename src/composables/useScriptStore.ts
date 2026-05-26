import { ref } from 'vue'
import type { Scene } from '../types/script'

// Simple module-level state shared across views (no Pinia needed)
export const scenes = ref<Scene[]>([])
export const selectedScene = ref<Scene | null>(null)
export const userCharacter = ref<string>('')
