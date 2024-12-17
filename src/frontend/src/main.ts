import { createApp } from "vue";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { VueQueryPlugin } from "@tanstack/vue-query";

import App from "./App.vue";
import { createRouter } from "./router";
import { createAuth0 } from "@auth0/auth0-vue";

import "./styles/main.scss";
import "@mdi/font/css/materialdesignicons.css";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});

const auth0 = createAuth0({
  domain: "henryai.ca.auth0.com",
  clientId: "qX2Q5D546dYAbzzauiiPgtu0yHGgA4sU",
  authorizationParams: {
    redirect_uri: window.location.origin,
    connection: "google-oauth2",
    scope:
      "openid profile email https://www.googleapis.com/auth/calendar.readonly",
  },
});

const router = createRouter(App as any);

createApp(App)
  .use(auth0)
  .use(vuetify)
  .use(router)
  .use(VueQueryPlugin)
  .mount("#app");
