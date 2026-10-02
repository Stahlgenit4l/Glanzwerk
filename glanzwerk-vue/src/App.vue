<script setup>
import { Sparkles, Check } from "lucide-vue-next";
import SiteHeader from "./components/SiteHeader.vue";
import ServicePackages from "./components/ServicePackages.vue";
import BeforeAfterSlider from "./components/BeforeAfterSlider.vue";
import BookingSection from "./components/BookingSection.vue";

const steps = [
  {
    title: "1. Termin auswählen",
    text: "Paket und freien Tag online auswählen.",
  },
  {
    title: "2. Gemeinsam abstimmen",
    text: "Bei der Übergabe besprechen wir Zustand, Aufwand und Preis.",
  },
  {
    title: "3. Neu verliebt abholen",
    text: "Wir stimmen die Abholzeit mit dir ab. Du freust dich auf dein Auto.",
  },
];
</script>

<template>
  <SiteHeader />
  <main>
    <section class="hero">
      <div class="hero-image" />
      <div class="hero-shade" />
      <div class="hero-content">
        <h1>Mehr als sauber.<br /><em>Wie neu verliebt.</em></h1>
        <p class="lead">
          Feine Politur und Innenraumaufbereitung in Wien. Für den
          Moment, in dem du dich wieder nach deinem Auto umdrehst.
        </p>
        <div class="hero-actions">
          <a class="button" href="#termin">Deinen Termin finden</a>
          <a class="text-link" href="#ergebnisse">Den Unterschied sehen</a>
        </div>
        <div class="hero-trust">
        </div>
      </div>
      <div class="hero-caption">
        <span>DETAILING MIT ANSPRUCH</span><b>Außen Glanz. Innen Wohlgefühl.</b>
      </div>
    </section>
    <div class="ribbon">
      <span>LACKPOLITUR</span><Sparkles :size="19" /><span>INNENRAUMPFLEGE</span
      ><Sparkles :size="19" /> <span>VERSIEGELUNG</span
      ><Sparkles :size="19" /><span>LIEBE ZUM DETAIL</span>
    </div>
    <ServicePackages />
    <section id="ergebnisse" class="section results">
      <div class="section-top">
        <div>
          <p class="eyebrow">DER UNTERSCHIED LIEGT IM DETAIL</p>
          <h2>Weniger Worte.<br /><em>Mehr Vorher & Nachher.</em></h2>
        </div>
        <p>
          Zieh den Regler und entdecke,<br />was sorgfältige Aufbereitung
          verändern kann.
        </p>
      </div>
      <div class="comparisons">
        <article>
          <BeforeAfterSlider kind="paint" label="Konsole und Teppich" />
          <div class="result-label">
            <h3>Sauber bis ins Detail</h3>
            <span>Konsole & Teppich</span>
          </div>
        </article>
        <article>
          <BeforeAfterSlider kind="interior" label="Innenraum" />
          <div class="result-label">
            <h3>Frische, die man sieht</h3>
            <span>Innenraumaufbereitung</span>
          </div>
        </article>
      </div>
      <p class="note">
        Beispielbilder zur Veranschaulichung – keine eigenen Kundenarbeiten.
        Bildquellen: Impera Detailing und Reflection Detailing.
      </p>
    </section>
    <section id="ablauf" class="section process">
      <div>
        <p class="eyebrow">UNKOMPLIZIERT ZUM GLANZ</p>
        <h2>Du bringst dein Auto.<br />Wir die Liebe zum Detail.</h2>
      </div>
      <div class="steps">
        <div v-for="step in steps" :key="step.number">
          <b>{{ step.number }}</b>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </div>
      </div>
    </section>
    <BookingSection />
  </main>
  <footer>
    <a class="logo" href="#"
      ><Sparkles /><span
        >GLANZWERK<span class="logo-small">AUTOAUFBEREITUNG · WIEN</span></span
      ></a
    >
    <p>Ein gutes Gefühl. Bei jeder Fahrt.</p>
    <span>© {{ new Date().getFullYear() }} Glanzwerk</span>
  </footer>
</template>
