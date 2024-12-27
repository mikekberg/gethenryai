import { createApp } from 'vue';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { VueQueryPlugin } from '@tanstack/vue-query';

import App from './App.vue';
import { createRouter } from './router';
import { createAuth0 } from '@auth0/auth0-vue';
import henryApi from '@/services/henryService';

import './styles/main.scss';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    }
});

const auth0 = createAuth0({
    domain: process.env.VUE_APP_AUTH0_DOMAIN,
    clientId: process.env.VUE_APP_AUTH0_CLIENTID,
    authorizationParams: {
        redirect_uri: window.location.origin,
        audience: process.env.VUE_APP_AUTH0_AUDIENCE
    }
});

const router = createRouter(App as any);
const app = createApp(App)
    .use(auth0)
    .use(vuetify)
    .use(router)
    .use(VueQueryPlugin);

app.mount('#app');
/*if (false && auth0.isAuthenticated) {
    auth0.getAccessTokenSilently().then((token) => {
        henryApi.setAuthToken(token);
        app.mount('#app');
    });
} else {
    app.mount('#app');
}*/
