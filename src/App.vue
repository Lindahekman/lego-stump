<template>
  <v-app>
    <v-app-bar app color="white" v-if="connectionInfo || !legoHubStore.ready">
      <v-app-bar-title>LEGO Stump</v-app-bar-title>
      <v-btn to="/">
        <v-icon>mdi-book-open-variant</v-icon>
      </v-btn>
      <v-btn to="/remote">
        <v-icon>mdi-remote</v-icon>
      </v-btn>
      <v-btn to="/direct-grid">
        <v-icon>mdi-grid</v-icon>
      </v-btn>
      <v-btn to="/ghost-grid">
        <v-icon>mdi-ghost</v-icon>
      </v-btn>
      <v-btn to="/sequential-remote">
        <v-icon>mdi-test-tube</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-tune" @click="settingsDialog = true"></v-btn>
      <v-btn
        icon
        @click="legoHubStore.hasHub ? disconnect() : connect()">
          <v-icon v-if="legoHubStore.hasHub" color="green">
            mdi-bluetooth-connect
          </v-icon>
          <v-icon v-else color="red">
            mdi-bluetooth-off
          </v-icon>
      </v-btn>
    </v-app-bar>
    <v-main :class="legoHubStore.sequentialMode ? 'h-90' : 'h-100'" app>
      <router-view/>
    </v-main>
    <v-app-bar position="bottom" v-if="legoHubStore.sequentialMode" class="py-2">
      <v-icon icon="mdi-human-queue"></v-icon>:
        <v-avatar
            class="mx-1"
            v-for="(cmd, i) in legoHubStore.commands" 
            color="#58595b"
            size="x-large"
            :key="cmd.toString() + '-' + i">
          <v-icon size="x-large" color="white" :icon="cmd.cmd == HUB_COMMANDS.LEFT ? 'mdi-arrow-left-top' : cmd.cmd == HUB_COMMANDS.RIGHT ? 'mdi-arrow-right-top' : cmd.cmd == HUB_COMMANDS.FORWARD ? 'mdi-arrow-up' : cmd.cmd == HUB_COMMANDS.BACKWARD ? 'mdi-arrow-down' : cmd.cmd == HUB_COMMANDS.HORN ? 'mdi-bullhorn-outline' : 'mdi-lightbulb-on-outline'" :style="`transform: rotate(${cmd.rotationContext}deg)`"></v-icon>
        </v-avatar>
      <v-btn v-if="legoHubStore.commands.length > 0" variant="contained" color="error" class="ml-2 mr-2" size="large" @click="legoHubStore.popCommand">
        <v-icon icon="mdi-backspace" size="large"></v-icon>
      </v-btn>
      <v-btn v-if="legoHubStore.commands.length > 0" variant="contained" color="success" size="x-large" @click="legoHubStore.nextCommand">
        <v-icon icon="mdi-play" size="x-large"></v-icon>
      </v-btn>
    </v-app-bar>
    <v-dialog v-model="settingsDialog">
      <v-card min-width="400px">
        <v-card-title>Kalibrering</v-card-title>
        <v-card-text>
          <v-text-field color="primary" label="Drejegrader" v-model="legoHubStore.turnDegrees" hint="Standard: 180" persistent-hint></v-text-field>
          <v-text-field color="primary" label="Køregrader" v-model="legoHubStore.driveDegrees" hint="Standard: 360" persistent-hint></v-text-field>
          <v-text-field color="primary" label="Hastighed" v-model="legoHubStore.driveSpeed" hint="Standard: 20" persistent-hint></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="settingsDialog = false">Luk</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { HUB_COMMANDS, useLegoHubStore } from './stores/legohub'

export default defineComponent({
  name: 'App',

  setup() {
    const legoHubStore = useLegoHubStore()
    return {
      legoHubStore
    }
  },
  data () {
    return {
      HUB_COMMANDS: HUB_COMMANDS,
      connectionInfo: false,
      settingsDialog: false,
    }
  },
  created() {
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() == "c") this.connectionInfo = !this.connectionInfo
    })
    this.legoHubStore.existingHub().catch(error => console.error("existingHub error", error))
  },
  methods: {
    connect() {
      this.legoHubStore.newHub().catch(error => console.error("newHub error", error))
    },
    disconnect() {
      alert("disconnect not yet implemented")
    },
  }
})
</script>

<style scoped>
.h-90 {
  max-height: 90vh !important;
}
.h-100 {
  max-height: 100vh !important;
}

</style>