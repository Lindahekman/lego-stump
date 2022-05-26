<template>
  <v-window class="h-100" v-model="window" show-arrows touch continuous>
    <template v-slot:prev="{ props }">
        <v-btn
          :style="window == 0 ? 'opacity: 0; height: 0 !important;' : ''"
          color="primary"
          icon="mdi-chevron-left"
          size="x-large"
          key="prev-toggle"
          @click="props.onClick"
        ></v-btn>
    </template>
    <template v-slot:next="{ props }">
        <v-btn v-show="window < 2"
          color="primary"
          icon="mdi-chevron-right"
          size="x-large"
          key="next-toggle"
          @click="props.onClick"
        ></v-btn>
        <v-btn v-show="window == 2"
          color="primary"
          icon="mdi-chevron-right"
          size="x-large"
          key="progress-toggle"
          to="/remote"></v-btn>
    </template>
    <v-window-item class="h-100" v-for="n in [0,1,2]" :key="n" eager>
      <v-card class="h-100 d-flex flex-column justify-space-around align-center">
        <v-img class="carousel-image" :src="n < 1 ? part1Url : n < 2 ? part2Url : part3Url" eager></v-img>
        <v-card-title v-if="n < 1">Køre-Karl skal deltage i det store LEGO-løb!</v-card-title>
        <v-card-title v-else-if="n < 2">Hvis han passer på forhindringerne - </v-card-title>
        <v-card-title v-else> - så skal han nok nå i mål!</v-card-title>
      </v-card>
    </v-window-item>
  </v-window>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import part1Url from "@/assets/story/part1.png"
import part2Url from "@/assets/story/part2.png"
import part3Url from "@/assets/story/part3.png"
import { useLegoHubStore } from '@/stores/legohub'


export default defineComponent({
  name: 'StoryCarousel',
  setup () {
    const legoHubStore = useLegoHubStore()
    legoHubStore.sequentialMode = false
    return {
      part1Url,
      part2Url,
      part3Url,
    }
  },
  data () {
    return {
      window: 0,
    }
  },
})
</script>

<style scoped>
.carousel-image {
  width: 100%;
  max-height: 75vh;
}
</style>