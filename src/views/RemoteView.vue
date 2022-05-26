<template>
    <v-container class="h-100">
        <v-row class="h-100">
            <v-col class="h-100 d-flex justify-center align-center" cols="12">
                <remote-control></remote-control>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RemoteControl from '../components/RemoteControl.vue';

// Components

export default defineComponent({
  name: 'RemoteView',

  components: { RemoteControl },
});
</script>
