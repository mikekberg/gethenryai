<template>
  <div>
    <h2>Your Upcoming Meetings</h2>
    <table class="meetings-table">
      <tr v-for="meeting in meetingItems" :key="meeting.id">
        <td>
          <div class="meeting-title">{{ meeting.summary }}</div>
          <div class="meeting-time">
            {{
              new Date(Date.parse(meeting.start.dateTime)).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )
            }}
          </div>
        </td>
        <td>
          <v-btn color="blue" prepend-icon="mdi-ear-hearing" variant="elevated"
            >Start Meeting</v-btn
          >
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import henryApi from "@/services/henryService";
import { ref } from "vue";

@Options({
  props: {
    msg: String,
  },
})
export default class MyCalendarItems extends Vue {
  msg!: string;
  meetingItems = ref<any>([]);

  async mounted() {
    try {
      /*const { data } = useQuery({
        queryFn: henryApi.getGoogleCalendarEvents,
        queryKey: ["googleCalendarEvents"],
      });*/
      this.meetingItems = await henryApi.getGoogleCalendarEvents();
    } catch (error) {
      console.error(error);
    }
  }
}
</script>
