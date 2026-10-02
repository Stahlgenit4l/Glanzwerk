<script setup>
import { onMounted } from "vue";
import { Check, Clock, ShieldCheck } from "lucide-vue-next";
import { useBookingStore } from "../stores/booking.js";
import { useServicesStore } from "../stores/services.js";
import { formatDate } from "../../shared/calendar.js";
const booking = useBookingStore();
const services = useServicesStore();
onMounted(() => booking.loadAvailability());
</script>

<template>
  <section id="termin" class="section booking">
    <div class="booking-info">
      <p class="eyebrow">ZEIT FÜR EIN FRISCHES GEFÜHL</p>
      <h2>Dein nächster<br /><em>Glanzmoment.</em></h2>
      <p>
        Wähle dein Paket und buche deinen Termin direkt hier. Wir nehmen uns
        einen Tag Zeit für dein Fahrzeug.
      </p>
      <div class="booking-fact">
        <Clock /><span
          >Fahrzeugübergabe um 09:00 Uhr<br /><small
            >Montag bis Samstag · Wien</small
          ></span
        >
      </div>
      <div class="booking-fact">
        <ShieldCheck /><span
          >Keine Online-Zahlung<br /><small
            >Preisabstimmung vor Beginn der Arbeit</small
          ></span
        >
      </div>
    </div>
    <div class="booking-box">
      <div v-if="booking.confirmation" class="success" role="status">
        <Check :size="42" />
        <h3>Dein Termin ist gebucht!</h3>
        <p>{{ formatDate(booking.confirmation.date) }} um 09:00 Uhr</p>
        <p>{{ services.byId(booking.confirmation.service)?.name }}</p>
        <p>
          Buchungsnummer: <b>{{ booking.confirmation.reference }}</b>
        </p>
        <p class="muted">
          Bitte speichere diese Bestätigung. Es wird keine automatische E-Mail
          versendet.
        </p>
        <button class="button outline" @click="booking.startNewBooking()">
          Weitere Buchung
        </button>
      </div>
      <form
        v-else
        :aria-busy="booking.saving"
        @submit.prevent="booking.submitBooking()"
      >
        <h3>Termin buchen</h3>
        <p class="muted">In wenigen Schritten zu deinem Wunschtermin.</p>
        <fieldset :disabled="booking.saving">
          <label
            >Dein Pflegepaket
            <select v-model="booking.selectedService" name="service">
              <option
                v-for="pack in services.packages"
                :key="pack.id"
                :value="pack.id"
              >
                {{ pack.name }} – ab € {{ pack.price }}
              </option>
            </select>
          </label>
          <div class="form-row">
            <label
              >Wunschtermin<input
                v-model="booking.date"
                type="date"
                name="date"
                required
                :min="booking.window.minDate"
                :max="booking.window.maxDate"
            /></label>
            <label>Übergabe<input value="09:00 Uhr" readonly /></label>
          </div>
          <p v-if="booking.loading" class="muted" role="status">
            Freie Termine werden geladen …
          </p>
          <p v-if="booking.dateError" class="error" role="alert">
            {{ booking.dateError }}
          </p>
          <div v-if="booking.availabilityError" class="error" role="alert">
            <p>{{ booking.availabilityError }}</p>
            <button
              type="button"
              class="button outline"
              @click="booking.loadAvailability()"
            >
              Erneut laden
            </button>
          </div>
          <div class="form-row">
            <label
              >Dein Name<input
                v-model="booking.form.name"
                name="name"
                autocomplete="name"
                placeholder="Vor- und Nachname"
                maxlength="100"
                required
            /></label>
            <label
              >Telefon<input
                v-model="booking.form.phone"
                name="phone"
                type="tel"
                autocomplete="tel"
                placeholder="+43 …"
                minlength="6"
                maxlength="30"
                required
            /></label>
          </div>
          <label
            >E-Mail<input
              v-model="booking.form.email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="du@beispiel.at"
              maxlength="150"
              required
          /></label>
          <label
            >Dein Fahrzeug<input
              v-model="booking.form.vehicle"
              name="vehicle"
              placeholder="z. B. Opel Vectra · Limousine"
              maxlength="150"
              required
          /></label>
          <label
            >Anmerkungen <span class="muted">(optional)</span
            ><textarea
              v-model="booking.form.notes"
              name="notes"
              placeholder="Was dürfen wir über dein Auto wissen?"
              maxlength="1000"
            />
          </label>
          <label class="consent"
            ><input
              v-model="booking.form.consent"
              name="consent"
              type="checkbox"
              required
            />Meine Angaben dürfen zur Abwicklung des Termins gespeichert und
            zur Kontaktaufnahme verwendet werden.</label
          >
        </fieldset>
        <p v-if="booking.submitError" class="error" role="alert">
          {{ booking.submitError }}
        </p>
        <button
          class="button submit"
          type="submit"
          :disabled="!booking.canSubmit"
        >
          {{
            booking.saving
              ? "Termin wird gespeichert …"
              : "Termin verbindlich reservieren"
          }}
        </button>
        <p class="form-note">
          Deine Reservierung wird direkt gespeichert. Keine Vorauszahlung.
        </p>
      </form>
    </div>
  </section>
</template>
