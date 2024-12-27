<template>
    <v-container class="d-flex justify-center align-center h-100">
        <v-container class="login-box">
            <v-row class="pa-5">
                <v-col cols="5">
                    <img
                        alt="GetHenry"
                        src="../assets/logo.png"
                        width="200"
                        class="d-block mr-auto ml-auto"
                    />
                </v-col>
                <v-col cols="7" class="d-flex align-center"
                    ><v-btn
                        rounded="sm"
                        size="x-large"
                        block
                        color="primary"
                        @click="login"
                        class="align-center"
                        >Get Started</v-btn
                    ></v-col
                >
            </v-row>
        </v-container>
    </v-container>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { useAuth0 } from '@auth0/auth0-vue';

@Options({
    components: {}
})
export default class LoginView extends Vue {
    public user: { email: string; password: string } = {
        email: '',
        password: ''
    };
    public errorLogin = false;

    private auth0 = useAuth0();

    login() {
        this.auth0.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin
            }
        });
    }
}
</script>

<style lang="scss" scoped>
.login-box {
    width: 900px;
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e0e0e0;
}
</style>
