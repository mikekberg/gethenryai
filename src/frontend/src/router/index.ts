import { createRouter as createVueRouter, createWebHistory } from 'vue-router';
import MainView from '../views/MainView.vue';
import LoginView from '@/views/LoginView.vue';
import HomeView from '@/views/HomeView.vue';
import { createAuthGuard, useAuth0 } from '@auth0/auth0-vue';
import type { App } from 'vue';
import henryApi from '@/services/henryService';

export function createRouter(app: App) {
    const router = createVueRouter({
        history: createWebHistory(),
        routes: [
            {
                path: '/',
                name: 'home',
                component: MainView,
                beforeEnter: createAuthGuard(app),
                children: [{ path: '/', component: HomeView }]
            },
            {
                path: '/login',
                name: 'login',
                meta: { bypassAuth: true },
                component: LoginView
            }
        ]
    });

    router.beforeEach(async (to, from, next) => {
        if (to.meta.bypassAuth) {
            next();
            return;
        }

        const { getAccessTokenSilently } = useAuth0();
        const token = await getAccessTokenSilently();
        henryApi.setAuthToken(token);

        next();
    });

    return router;
}
