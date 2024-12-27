<template>
    <div>
        <MyCalendarItems />
        <YourRecordedMeetings />
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import henryApi from '@/services/henryService';
import MyCalendarItems from '@/components/MyCalendarItems.vue';
import YourRecordedMeetings from '@/components/YourRecordedMeetings.vue';
import { ref } from 'vue';

@Options({
    components: {
        MyCalendarItems,
        YourRecordedMeetings
    }
})
export default class HomeView extends Vue {
    public file = ref<File | null>();

    async mounted() {
        /*
    const { data } = useQuery({
      queryFn: henryApi.getGoogleCalendarEvents,
      queryKey: ["googleCalendarEvents"],
    });
    console.log(data);

    await henryApi.ping();
    */
    }

    public async onFileChanged($event: Event) {
        const target = $event.target as HTMLInputElement;
        if (target && target.files) {
            await henryApi.createMeeting(target.files[0]);
        }
    }
}
</script>
