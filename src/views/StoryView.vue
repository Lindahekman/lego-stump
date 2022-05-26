<template>
    <v-container class="h-100">
        <v-row class="h-100">
            <v-col class="h-100" cols="12">
                <story-carousel></story-carousel>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import StoryCarousel from '@/components/StoryCarousel.vue';
import { defineComponent } from 'vue';

// Components

export default defineComponent({
  name: 'StoryView',

  components: {StoryCarousel},
});
</script>
