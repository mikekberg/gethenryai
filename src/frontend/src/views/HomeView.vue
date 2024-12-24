<template>
  <div>
    <CalendarItems />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { useQueryClient, useQuery, useMutation } from "@tanstack/vue-query";
import henryApi from "@/services/henryService";
import CalendarItems from "@/components/CalendarItems.vue";

@Options({
  components: {
    CalendarItems,
  },
})
export default class HomeView extends Vue {
  async mounted() {
    const { data } = useQuery({
      queryFn: henryApi.getGoogleCalendarEvents,
      queryKey: ["googleCalendarEvents"],
    });
    console.log(data);

    await henryApi.ping();
  }
}
</script>
