<template>
  <v-layout class="rounded rounded-md">
    <v-navigation-drawer class="bg-indigo" theme="dark" permanent>
      <div class="d-flex justify-center mt-2 mb-2">
        <img alt="Vue logo" src="../assets/logo.png" width="120" />
      </div>
      <v-divider></v-divider>
      <v-list color="transparent">
        <v-list-item
          link
          title="My Meetings"
          prepend-icon="mdi-calendar-week-outline"
        ></v-list-item>
        <v-list-item
          link
          prepend-icon="mdi-information-outline"
          title="About"
        ></v-list-item>
      </v-list>
      <template v-slot:append>
        <div class="pa-2 mb-3">
          <v-btn block @click="logout">Logout</v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-main class="mt-5 ml-10 mr-10 mb-5">
      <router-view />
    </v-main>
  </v-layout>
</template>

<script lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";
import { Options, Vue } from "vue-class-component";
import henryApi from "@/services/henryService";

@Options({
  components: {},
})
export default class MainView extends Vue {
  private logout!: () => void;

  async mounted() {
    const { getAccessTokenSilently, isAuthenticated, logout } = useAuth0();

    this.logout = logout;

    if (isAuthenticated) {
      const token = await getAccessTokenSilently();
      console.log("setting token", token);
      henryApi.setAuthToken(token);
    }
  }
}
</script>
