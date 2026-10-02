<script setup>
import { Car, Armchair, Layers, Check } from "lucide-vue-next";
import { useServicesStore } from "../stores/services.js";
import { useBookingStore } from "../stores/booking.js";
const services = useServicesStore();
const booking = useBookingStore();
const icons = { Car, Armchair, Layers };
</script>

<template>
  <section id="leistungen" class="section">
    <div class="section-top">
      <div>
        <p class="eyebrow">UNSERE LEISTUNGEN</p>
        <h2>Gute Pflege. Gutes Gefühl.</h2>
      </div>
      <p>
        Vom frischen Innenraum bis zum tiefen Glanz.<br />Wähle die passende
        Pflege für dein Auto.
      </p>
    </div>
    <div class="packages">
      <article
        v-for="pack in services.packages"
        :key="pack.id"
        class="package"
        :class="{ featured: pack.id === 'komplett' }"
      >
        <div class="package-top">
          <component :is="icons[pack.icon]" :size="28" />
          <span>{{
            pack.id === "komplett" ? "DAS VOLLE PROGRAMM" : "DETAILING"
          }}</span>
        </div>
        <h3>{{ pack.name }}</h3>
        <p class="package-title">{{ pack.title }}</p>
        <p class="muted">{{ pack.desc }}</p>
        <ul>
          <li v-for="item in pack.items" :key="item">
            <Check :size="17" />{{ item }}
          </li>
        </ul>
        <div class="price">ab € {{ pack.price }}<small> / Fahrzeug</small></div>
        <a
          class="button"
          :class="{ outline: pack.id !== 'komplett' }"
          href="#termin"
          @click="booking.selectedService = pack.id"
          >Paket auswählen</a
        >
      </article>
    </div>
    <p class="note">
      Orientierungspreise. Der endgültige Preis richtet sich nach Fahrzeuggröße
      und Zustand und wird vor der Arbeit vereinbart.
    </p>
  </section>
</template>
