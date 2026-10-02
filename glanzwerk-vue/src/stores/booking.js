import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { bookingWindow, isValidDate, isSunday } from "../../shared/calendar.js";

const emptyForm = () => ({
  name: "",
  phone: "",
  email: "",
  vehicle: "",
  notes: "",
  consent: false,
});

export const useBookingStore = defineStore("booking", () => {
  const selectedService = ref("komplett");
  const date = ref("");
  const form = ref(emptyForm());
  const bookedDates = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const availabilityReady = ref(false);
  const availabilityError = ref("");
  const submitError = ref("");
  const confirmation = ref(null);
  const window = ref(bookingWindow());

  const dateError = computed(() => {
    if (!date.value) return "";
    if (
      !isValidDate(date.value) ||
      date.value < window.value.minDate ||
      date.value > window.value.maxDate
    ) {
      return "Bitte wähle einen Tag innerhalb des Buchungszeitraums.";
    }
    if (isSunday(date.value))
      return "Sonntags sind wir geschlossen. Bitte wähle einen anderen Tag.";
    if (bookedDates.value.includes(date.value))
      return "Dieser Tag ist bereits vergeben. Bitte wähle einen anderen.";
    return "";
  });

  const canSubmit = computed(
    () =>
      availabilityReady.value &&
      !loading.value &&
      !saving.value &&
      !!date.value &&
      !dateError.value,
  );

  async function loadAvailability() {
    loading.value = true;
    availabilityError.value = "";
    availabilityReady.value = false;
    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      if (!response.ok)
        throw new Error(
          "Verfügbarkeit konnte nicht geladen werden. Bitte versuche es erneut.",
        );
      const data = await response.json();
      bookedDates.value = data.dates;
      window.value = { minDate: data.minDate, maxDate: data.maxDate };
      availabilityReady.value = true;
    } catch (error) {
      availabilityError.value =
        error.message || "Der Server ist derzeit nicht erreichbar.";
    } finally {
      loading.value = false;
    }
  }

  async function submitBooking() {
    if (!canSubmit.value) return false;
    saving.value = true;
    submitError.value = "";
    // Snapshot: Die Bestätigung darf nicht von späteren Formulareingaben abhängen.
    const payload = {
      ...form.value,
      service: selectedService.value,
      date: date.value,
    };
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        if (
          response.status === 409 &&
          !bookedDates.value.includes(payload.date)
        )
          bookedDates.value.push(payload.date);
        throw new Error(
          result.error || "Die Buchung konnte nicht gespeichert werden.",
        );
      }
      confirmation.value = {
        reference: result.reference,
        date: payload.date,
        service: payload.service,
      };
      bookedDates.value.push(payload.date);
      return true;
    } catch (error) {
      submitError.value = error.message || "Bitte versuche es erneut.";
      return false;
    } finally {
      saving.value = false;
    }
  }

  function startNewBooking() {
    confirmation.value = null;
    date.value = "";
    form.value = emptyForm();
    submitError.value = "";
    return loadAvailability();
  }

  return {
    selectedService,
    date,
    form,
    bookedDates,
    loading,
    saving,
    availabilityReady,
    availabilityError,
    submitError,
    confirmation,
    window,
    dateError,
    canSubmit,
    loadAvailability,
    submitBooking,
    startNewBooking,
  };
});
