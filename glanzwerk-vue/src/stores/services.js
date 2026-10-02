import { defineStore } from "pinia";
import { servicePackages } from "../../shared/services.js";

export const useServicesStore = defineStore("services", {
  state: () => ({
    packages: servicePackages.map((item) => ({
      ...item,
      items: [...item.items],
    })),
  }),
  getters: {
    byId: (state) => (id) => state.packages.find((item) => item.id === id),
  },
});
