<template>
    <v-container class="h-100">
        <v-row class="h-100">
            <v-col class="h-100 d-flex justify-center align-center" cols="12">
                <sequential-remote-control></sequential-remote-control>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SequentialRemoteControl from '../components/SequentialRemoteControl.vue';

// Components

export default defineComponent({
  name: 'RemoteView',

  components: { SequentialRemoteControl },
});
</script>
