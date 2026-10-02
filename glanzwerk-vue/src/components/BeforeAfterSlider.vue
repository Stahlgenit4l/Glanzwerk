<script setup>
import { ref } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

defineProps({
  kind: { type: String, required: true },
  label: { type: String, required: true },
});
const position = ref(50);
</script>

<template>
  <div class="compare">
    <div :class="['compare-image', kind, 'after']" />
    <div
      :class="['compare-image', kind, 'before']"
      :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }"
    />
    <span class="tag before-tag">VORHER</span>
    <span class="tag after-tag">NACHHER</span>
    <div class="divider" :style="{ left: `${position}%` }" aria-hidden="true">
      <span><ChevronLeft :size="16" /><ChevronRight :size="16" /></span>
    </div>
    <input
      v-model.number="position"
      :aria-label="`${label}: Vorher und Nachher vergleichen`"
      type="range"
      min="0"
      max="100"
    />
  </div>
</template>
