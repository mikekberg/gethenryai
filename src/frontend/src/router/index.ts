import { createRouter as createVueRouter, createWebHistory } from "vue-router";
import MainView from "../views/MainView.vue";
import LoginView from "@/views/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import { createAuthGuard } from "@auth0/auth0-vue";
import type { App } from "vue";

export function createRouter(app: App) {
  return createVueRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/",
        name: "home",
        component: MainView,
        beforeEnter: createAuthGuard(app),
        children: [{ path: "", component: HomeView }],
      },
      {
        path: "/login",
        name: "login",
        component: LoginView,
      },
    ],
  });
}
