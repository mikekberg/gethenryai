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
                    title="Listen Now"
                    prepend-icon="mdi-ear-hearing"
                    base-color="green"
                    variant="elevated"
                    v-if="!isListening"
                    @click="onStartListening()"
                />
                <v-list-item
                    link
                    title="Listening..."
                    prepend-icon="mdi-ear-hearing"
                    base-color="orange"
                    variant="elevated"
                    v-if="isListening"
                />
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
import { Options, Vue } from 'vue-class-component';
import { useAuth0 } from '@auth0/auth0-vue';
import meetingRecorder from '@/services/meetingRecorder';
import henryApi from '@/services/henryService';
import { Ref, ref } from 'vue';

@Options({
    components: {}
})
export default class MainView extends Vue {
    private logout!: () => void;
    public isListening = false;

    async created() {
        const { logout } = useAuth0();
        this.logout = logout;
    }

    async recordingDataReady(recordedAudio: File) {
        this.isListening = false;
        const uploadLocation = await henryApi.generateUploadUrl();
        await henryApi.uploadAudioFile(uploadLocation.uploadUrl, recordedAudio);
    }

    onStartListening() {
        this.isListening = true;
        meetingRecorder.registerOnRecordingReady(
            this.recordingDataReady.bind(this)
        );
        meetingRecorder.startRecording();
    }

    onStopListening() {
        meetingRecorder.stopRecording();
    }
}
</script>
