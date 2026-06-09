<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
  import { useRouter } from "vue-router";

  import { selectedScene, userCharacter } from "../composables/useScriptStore";
  import { createSession, updateSession } from "../composables/useSessionHistory";

  import PracticeSidebar from "../components/PracticeSidebar.vue";

  import type { ChatMessage, ScriptLine } from "../types/script";
  import type { Session } from "../types/session";

  import IconMic from "../assets/svg/icon-mic.svg";
  import IconPause from "../assets/svg/icon-pause.svg";
  import IconSound from "../assets/svg/icon-sound.svg";
  import IconSoundOff from "../assets/svg/icon-sound-off.svg";

  const router = useRouter();

  onMounted(() => {
    // if (!selectedScene.value || !userCharacter.value) {
    //   router.replace('/')
    //   return
    // }
    startNewSession();
  });

  const chatEl = ref<HTMLElement | null>(null);
  const userInput = ref("");
  const isLoading = ref(false);
  const messages = ref<ChatMessage[]>([]);
  const currentSessionId = ref<string | null>(null);

  const canStartNew = computed(() => !!selectedScene.value && !!userCharacter.value);

  const aiCharacters = computed(
    () => selectedScene.value?.characters.filter((c) => c !== userCharacter.value) ?? []
  );

  function buildSystemPrompt(): string {
    const scene = selectedScene.value!;
    const aiChars = aiCharacters.value;
    const scriptContext = scene.lines
      .map((l: ScriptLine) => `${l.character}: ${l.text}`)
      .join("\n");

    return `당신은 연극/드라마 대본 연습 파트너입니다.
현재 씬: ${scene.title}
AI가 연기할 캐릭터: ${aiChars.join(", ")}
사용자가 연기할 캐릭터: ${userCharacter.value}

대본:
${scriptContext}

규칙:
- 대본의 흐름을 따라가되, 사용자 대사에 자연스럽게 반응하세요.
- 여러 AI 캐릭터가 있다면 각 캐릭터 이름을 앞에 붙여 구분하세요. 예: "민준: 안녕하세요"
- 사용자가 틀리거나 대본과 달라도 자연스럽게 연기를 이어가세요.
- 대사만 출력하고 지문이나 설명은 최소화하세요.`;
  }

  function startNewSession() {
    if (!selectedScene.value || !userCharacter.value) return;
    const session = createSession(selectedScene.value.title, userCharacter.value);
    currentSessionId.value = session.id;
    messages.value = [];
    initConversation();
  }

  function loadSession(session: Session) {
    currentSessionId.value = session.id;
    messages.value = [...session.messages];
    nextTick(scrollToBottom);
  }

  function initConversation() {
    const scene = selectedScene.value!;
    const firstAiLine = scene.lines.find((l: ScriptLine) => l.character !== userCharacter.value);
    if (firstAiLine) {
      const content = `${firstAiLine.character}: ${firstAiLine.text}`;
      messages.value = [{ role: "assistant", content }];
      speak(content);
      if (currentSessionId.value) updateSession(currentSessionId.value, messages.value);
    }
  }

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isLoading.value) return;

    messages.value.push({ role: "user", content: text });
    userInput.value = "";
    isLoading.value = true;

    await nextTick();
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: buildSystemPrompt(),
          messages: messages.value.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error("응답 실패");

      const data = await res.json();
      messages.value.push({ role: "assistant", content: data.reply });
      speak(data.reply);
    } catch {
      messages.value.push({
        role: "assistant",
        content: "(응답을 받지 못했어요. 다시 시도해주세요.)"
      });
    } finally {
      if (currentSessionId.value) updateSession(currentSessionId.value, messages.value);
      isLoading.value = false;
      await nextTick();
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    chatEl.value?.scrollTo({ top: chatEl.value.scrollHeight, behavior: "smooth" });
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // TTS
  const isTtsEnabled = ref(true);

  function speak(text: string) {
    if (!isTtsEnabled.value) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // Voice recognition
  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
  const isRecording = ref(false);
  let recognition: InstanceType<typeof SpeechRecognitionAPI> | null = null;

  function toggleRecording() {
    if (!SpeechRecognitionAPI) {
      alert("이 브라우저는 음성 인식을 지원하지 않아요. Chrome을 사용해주세요.");
      return;
    }
    if (isRecording.value) {
      recognition?.stop();
      return;
    }
    recognition = new SpeechRecognitionAPI();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          userInput.value += e.results[i][0].transcript;
        }
      }
    };
    recognition.onstart = () => {
      isRecording.value = true;
    };
    recognition.onend = () => {
      isRecording.value = false;
    };
    recognition.onerror = () => {
      isRecording.value = false;
    };

    recognition.start();
  }

  onUnmounted(() => {
    recognition?.stop();
    window.speechSynthesis.cancel();
  });
</script>

<template>
  <div class="page-practice">
    <PracticeSidebar
      :current-session-id="currentSessionId"
      :can-start-new="canStartNew"
      @select="loadSession"
      @new="startNewSession"
    />

    <div class="practice-content">
      <div class="practice-content__top">
        <div class="scene-info">
          <span class="scene-title">테스트</span>
          <!-- <span class="scene-name">{{ selectedScene?.title }}</span> -->
          <!-- <span class="my-char">나: {{ userCharacter }}</span> -->
        </div>
        <button
          type="button"
          class="btn-icon btn-tts"
          :class="{ off: !isTtsEnabled }"
          @click="isTtsEnabled = !isTtsEnabled"
        >
          <IconSound v-if="isTtsEnabled" />
          <IconSoundOff v-else />
        </button>
      </div>

      <div class="practice-content__bottom">
        <div class="chat-area" ref="chatEl">
          <!-- <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
            <div class="bubble">{{ msg.content }}</div>
          </div> -->

          <div class="message">
            <div class="bubble">테스트 테스트 테스트</div>
          </div>
          <div class="message user">
            <div class="bubble">test test test</div>
          </div>

          <div class="message assistant" v-if="isLoading">
            <div class="bubble typing">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <div class="input-area">
          <textarea
            v-model="userInput"
            class="input"
            :placeholder="`${userCharacter} 대사를 입력하세요...`"
            rows="2"
            @keydown="onKeydown"
            :disabled="isLoading"
          ></textarea>
          <div class="btns">
            <button
              type="button"
              class="btn-record"
              :class="{ recording: isRecording }"
              @click="toggleRecording"
              :disabled="isLoading"
            >
              <IconPause v-if="isRecording" />
              <IconMic v-else />
            </button>
            <button
              type="button"
              class="btn-send"
              @click="sendMessage"
              :disabled="!userInput.trim() || isLoading"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use "../assets/scss/pages/practice";
</style>
