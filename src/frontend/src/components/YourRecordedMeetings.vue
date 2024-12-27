<template>
    <div class="mt-10">
        <h2>Your Recorded Meetings</h2>
        <table class="meetings-table">
            <tr v-for="meeting in myMeetings" :key="meeting.id">
                <td>
                    <div class="meeting-title">
                        Recorded Meeting at
                        {{
                            new Date(
                                Date.parse(meeting.timeStamp)
                            ).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })
                        }}
                    </div>
                </td>
                <td>
                    <div>
                        <v-btn
                            color="blue"
                            prepend-icon="mdi-chat-outline"
                            variant="elevated"
                            >Chat</v-btn
                        >
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { Options, Vue } from 'vue-class-component';
import henryApi from '@/services/henryService';

@Options({
    props: {
        msg: String
    }
})
export default class YourRecordedMeetings extends Vue {
    msg!: string;
    myMeetings = ref<any>([]);

    async mounted() {
        this.myMeetings = await henryApi.getMyMeetings();
    }
}
</script>
