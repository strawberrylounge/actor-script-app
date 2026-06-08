<script setup lang="ts">
  import { sessionHistory, removeSession } from "../composables/useSessionHistory";
  import type { Session } from "../types/session";

  const props = defineProps<{
    currentSessionId: string | null;
    canStartNew: boolean;
  }>();

  const emit = defineEmits<{
    select: [session: Session];
    new: [];
  }>();

  function formatDate(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  }
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">연습 기록</span>
      <button class="new-btn" :disabled="!props.canStartNew" @click="emit('new')">+ 새 연습</button>
    </div>
    <div class="session-list">
      <div
        v-for="session in sessionHistory"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === props.currentSessionId }"
        @click="emit('select', session)"
      >
        <div class="session-info">
          <span class="session-scene">{{ session.sceneTitle }}</span>
          <span class="session-meta">{{ session.character }} · {{ formatDate(session.updatedAt) }}</span>
        </div>
        <button class="session-delete" @click.stop="removeSession(session.id)">×</button>
      </div>
      <p v-if="!sessionHistory.length" class="empty-history">아직 연습 기록이 없어요.</p>
    </div>
  </aside>
</template>

<style scoped lang="scss">
  .sidebar {
    width: 240px;
    min-width: 240px;
    border-right: 1px solid #222;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #222;
    flex-shrink: 0;
  }

  .sidebar-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .new-btn {
    background: transparent;
    border: 1px solid #333;
    border-radius: 6px;
    color: #aaa;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    &:hover:not(:disabled) {
      border-color: #7c6aff;
      color: #7c6aff;
    }
    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .session-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
  }

  .session-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1rem;
    cursor: pointer;
    border-radius: 6px;
    margin: 0 0.5rem;
    &:hover {
      background: #1a1a1a;
      .session-delete { opacity: 1; }
    }
    &.active {
      background: #1e1a2e;
      .session-scene { color: #c4bbff; }
    }
  }

  .session-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .session-scene {
    font-size: 0.85rem;
    color: #e8e8e8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .session-meta {
    font-size: 0.75rem;
    color: #666;
  }

  .session-delete {
    background: transparent;
    border: none;
    color: #555;
    font-size: 1rem;
    cursor: pointer;
    opacity: 0;
    flex-shrink: 0;
    padding: 0 0.2rem;
    &:hover { color: #e05; }
  }

  .empty-history {
    font-size: 0.8rem;
    color: #555;
    text-align: center;
    padding: 2rem 1rem;
  }
</style>
