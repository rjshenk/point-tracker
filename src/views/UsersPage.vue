<template>
  <div class="container mx-auto px-4 -mt-32">
    <div class="bg-white rounded-lg shadow max-w-md px-4 py-2">
      <div
        v-for="{id, team, role} in sortedUsers"
        :key="`user-${id}`"
        class="flex justify-between py-4 border-b relative"
      >
        <div>
          {{ id }}
        </div>
        <select
          :value="team || role"
          :class="`bg-${team}-lighter`"
          class="font-thin mr-4 border rounded-lg bg-white"
          @change="teamChange(id, $event.target.value)"
        >
          <option v-for="team in teamNames" :key="`role-${team}`">
            {{ team }}
          </option>
        </select>
        <button
          class="btn-close text-grey text-base"
          @click="remove(id)"
        >x</button>
      </div>
      <AddNewUser/>
    </div>
  </div>
</template>

<script>

import AddNewUser from '@/components/AddNewUser.vue'
import {TEAM_NAMES} from '@/store.js'
export default {
  name: 'UsersPage',
  components: {AddNewUser},
  data() {
    return {
      teamNames: ['admin', ...TEAM_NAMES],
    }
  },
  computed: {
    users() {
      return this.$store.state.users
    },
    sortedUsers() {
      const teamLeaders = []
      const admin = []
      const roleNotSet = []

      this.users.forEach((user) => {
        if (user.role == 'admin') {
          admin.push(user)
        } else if (user.role == 'leader') {
          teamLeaders.push(user)
        } else {
          roleNotSet.push(user)
        }
      })
      teamLeaders.sort((user1, user2) => user1.team.localeCompare(user2.team))
      return [...admin, ...teamLeaders, ...roleNotSet]
    },
  },
  methods: {
    remove(id) {
      this.$store.dispatch('removeUser', id)
    },
    teamChange(userId, teamName) {
      let role = 'leader'
      if (teamName == 'admin') {
        role = 'admin'
        teamName = null
      }
      this.$store.dispatch('setUserResponsibility', {userId, role, teamName})
    },
  },
}
</script>

// <style scoped lang="scss">
.btn-close {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
