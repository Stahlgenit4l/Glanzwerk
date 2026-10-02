<script setup>
import { ref } from "vue";
import { Sparkles, Menu, X } from "lucide-vue-next";
const menuOpen = ref(false);
</script>

<template>
  <header>
    <a class="logo" href="#"
      ><Sparkles /><span
        >GLANZWERK<span class="logo-small">AUTOAUFBEREITUNG · WIEN</span></span
      ></a
    >
    <nav id="main-nav" :class="{ open: menuOpen }" aria-label="Hauptnavigation">
      <a href="#leistungen" @click="menuOpen = false">Leistungen</a>
      <a href="#ergebnisse" @click="menuOpen = false">Vorher & Nachher</a>
      <a href="#ablauf" @click="menuOpen = false">So läuft’s</a>
    </nav>
    <a class="button small" href="#termin">Termin buchen</a>
    <button
      class="menu"
      :aria-label="menuOpen ? 'Menü schließen' : 'Menü öffnen'"
      :aria-expanded="menuOpen"
      aria-controls="main-nav"
      @click="menuOpen = !menuOpen"
    >
      <X v-if="menuOpen" /><Menu v-else />
    </button>
  </header>
</template>
