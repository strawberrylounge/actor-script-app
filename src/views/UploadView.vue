<script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";

  import * as pdfjsLib from "pdfjs-dist";

  import { scenes } from "../composables/useScriptStore";

  import IconUpload from "../assets/svg/icon-upload.svg";

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const router = useRouter();
  const isDragging = ref(false);
  const isLoading = ref(false);
  const error = ref("");

  async function extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n");
  }

  async function processFile(file: File) {
    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      error.value = "PDF 파일만 업로드 가능해요.";
      return;
    }

    error.value = "";
    isLoading.value = true;

    try {
      const scriptText = await extractTextFromPdf(file);

      const res = await fetch("/api/parse-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptText })
      });

      if (!res.ok) throw new Error("대본 파싱 실패");

      const data = await res.json();
      scenes.value = data.scenes;
      router.push("/scene");
    } catch (e: any) {
      error.value = e.message ?? "알 수 없는 오류가 발생했어요.";
    } finally {
      isLoading.value = false;
    }
  }

  function onFileInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) processFile(file);
  }

  function onDrop(e: DragEvent) {
    isDragging.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }
</script>

<template>
  <div class="page-upload">
    <div class="upload-container">
      <h1>파일 업로드</h1>
      <!-- <p class="subtitle">PDF 대본을 업로드하면 AI 상대 배우와 연습할 수 있어요</p> -->

      <div class="drop-zone" :class="{ dragging: isDragging, loading: isLoading }">
        <label
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="onDrop"
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            @change="onFileInput"
            :disabled="isLoading"
            hidden
          />
        </label>

        <div class="drop-content">
          <div v-if="isLoading">
            <div class="spinner"></div>
            <p>대본을 분석하는 중...</p>
          </div>
          <div v-else>
            <IconUpload class="icon-upload" aria-hidden="true" />
            <p class="drop-label">파일을 여기에 드래그하거나 클릭해서 선택</p>
          </div>
        </div>
      </div>

      <div class="hints">
        <p v-if="error" class="error text-center">{{ error }}</p>
        <div v-else class="upload-guide">
          <p>pdf 파일만 업로드 가능해요.</p>
          <p>최대 0MB</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use "../assets/scss/pages/upload.scss";
</style>
