<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { scenes, selectedScene, userCharacter } from '../composables/useScriptStore'

const router = useRouter()

onMounted(() => {
  if (!scenes.value.length) router.replace('/')
})

function selectScene(sceneId: number) {
  selectedScene.value = scenes.value.find(s => s.id === sceneId) ?? null
  userCharacter.value = ''
}

function selectCharacter(char: string) {
  userCharacter.value = char
}

function startPractice() {
  if (!selectedScene.value || !userCharacter.value) return
  router.push('/practice')
}
</script>

<template>
  <div class="scene-select">
    <div class="top-bar">
      <button class="back-btn" @click="router.push('/')">← 다시 업로드</button>
      <h1>씬 선택</h1>
    </div>

    <div class="scenes-list">
      <button
        v-for="scene in scenes"
        :key="scene.id"
        class="scene-card"
        :class="{ selected: selectedScene?.id === scene.id }"
        @click="selectScene(scene.id)"
      >
        <span class="scene-title">{{ scene.title }}</span>
        <span class="scene-chars">{{ scene.characters.join(', ') }}</span>
      </button>
    </div>

    <div v-if="selectedScene" class="character-section">
      <h2>내가 연기할 캐릭터</h2>
      <div class="char-list">
        <button
          v-for="char in selectedScene.characters"
          :key="char"
          class="char-btn"
          :class="{ selected: userCharacter === char }"
          @click="selectCharacter(char)"
        >
          {{ char }}
        </button>
      </div>
    </div>

    <button
      class="start-btn"
      :disabled="!selectedScene || !userCharacter"
      @click="startPractice"
    >
      연습 시작
    </button>
  </div>
</template>

<style scoped>
.scene-select {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: transparent;
  color: #999;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid #333;
  border-radius: 6px;
}
.back-btn:hover { color: #e8e8e8; border-color: #555; }

.scenes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 340px;
  overflow-y: auto;
}

.scene-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e8e8e8;
}
.scene-card:hover { border-color: #7c6aff; }
.scene-card.selected { border-color: #7c6aff; background: rgba(124, 106, 255, 0.1); }

.scene-title { font-weight: 600; font-size: 0.95rem; }
.scene-chars { font-size: 0.8rem; color: #777; }

.character-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.char-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.char-btn {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  color: #e8e8e8;
  font-size: 0.9rem;
}
.char-btn:hover { border-color: #7c6aff; }
.char-btn.selected { border-color: #7c6aff; background: #7c6aff; color: #fff; }

.start-btn {
  background: #7c6aff;
  color: #fff;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  margin-top: 0.5rem;
}
.start-btn:not(:disabled):hover { opacity: 0.85; }
</style>
