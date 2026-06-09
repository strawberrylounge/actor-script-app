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
      <button type="button">열기</button>
      <!-- <button class="new-btn" :disabled="!props.canStartNew" @click="emit('new')">+ 새 연습</button> -->
    </div>

    <ul class="session-list">
      <li
        v-for="session in sessionHistory"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === props.currentSessionId }"
        @click="emit('select', session)"
      >
        <div class="session-info">
          <span class="session-scene">{{ session.sceneTitle }}</span>
          <span class="session-meta"
            >{{ session.character }} · {{ formatDate(session.updatedAt) }}</span
          >
        </div>
        <button class="session-delete" @click.stop="removeSession(session.id)">×</button>
      </li>
      <li v-if="!sessionHistory.length" class="empty-history">아직 연습 기록이 없어요.</li>
    </ul>
  </aside>
</template>

<style scoped lang="scss">
  @use "../assets/scss/pages/practice.scss";
</style>
