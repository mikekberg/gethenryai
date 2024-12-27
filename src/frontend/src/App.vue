<template>
    <router-view />
</template>

<script lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { Vue } from 'vue-class-component';
import henryApi from '@/services/henryService';
import { useRouter } from 'vue-router';

export default class App extends Vue {}
</script>
<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    color: #2c3e50;
}
</style>
