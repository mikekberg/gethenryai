<template>
  <v-card class="my-8" elevation="16" max-width="344">
    <v-card-item>
      <v-card-title> Card title </v-card-title>

      <v-card-subtitle> Card subtitle secondary text </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua.
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    msg: String,
  },
})
export default class HelloWorld extends Vue {
  msg!: string;
}
</script>
