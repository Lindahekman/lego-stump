<template>
    <v-container class="h-100">
        <v-row class="h-100">
            <v-col class="h-100 d-flex justify-center align-center" cols="12">
                <direct-grid></direct-grid>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DirectGrid from '../components/DirectGrid.vue';

// Components

export default defineComponent({
  name: 'DirectGridView',

  components: { DirectGrid },
});
</script>
