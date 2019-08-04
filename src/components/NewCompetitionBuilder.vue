<template>
  <HideAndShowContainer :initialShow="true">
    <template slot="title">
      <div v-if="isAdmin" class="inline">Add Competition</div>
      <div v-else-if="isLeader" class="inline font-semibold">
        Add points for <span :class="`text-${leaderTeamName} capitalize`">{{ leaderTeamName }}</span> leaderTeamName
      </div>
    </template>
    <div>
      <span class="flex">
        <multiselect
          v-model="newCompetition.name"
          :options="competitionNames"
          :showLabels="false"
          placeholder="Competition"
          class="py-1 px-1"
          @input="initializePoints"
        />
        <input
          v-model.number="newCompetition.points"
          placeholder="Points"
          class="rounded border h-10 w-14 px-1 my-1 text-sm text-grey-darker"
        >
      </span>
      <span class="flex">
        <multiselect
          v-if="isAdmin"
          v-model="newCompetition.winner"
          :placeholder="firstTeamPlaceholder"
          :options="teamNames"
          :showLabels="false"
          class="py-1 px-1"
        />
        <div class="flex items-center">
          <input id="checkbox" v-model="newCompetition.tied" class="inline-block" type="checkbox">
          <label class="px-1 inline-block text-xs text-grey-dark uppercase" for="checkbox">tied</label>
        </div>
        <multiselect
          v-model="newCompetition.loser"
          :placeholder="secondTeamPlaceholder"
          :options="teamNames"
          :showLabels="false"
          class="py-1 px-1"
        />
      </span>
      <span class="flex justify-between items-center">
        <textarea
          v-model="newCompetition.notes"
          type="text"
          class="w-full py-2 px-3 mx-1 my-1 border rounded text-sm text-grey-darker"
          placeholder="Notes">
        </textarea>
      </span>
      <div class="h-8">
        <button
          class="float-right text-xs font-semibold rounded-full px-4 py-1 leading-normal bg-white border border-green text-green hover:bg-green hover:text-white"
          @click="addCompetition"
        >{{ saving ? 'Saving' : 'Submit' }}</button>
      </div>
    </div>
  </HideAndShowContainer>
</template>

<script>
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import HideAndShowContainer from '@/components/HideAndShowContainer.vue'
import {TEAM_NAMES} from '@/store.js'

export default {
  name: 'NewCompetitionBuilder',
  components: {
    HideAndShowContainer,
    Multiselect,
  },
  data() {
    return {
      newCompetition: {},
      saving: false,
      show: true,
      teamNames: TEAM_NAMES,
    }
  },
  computed: {
    leaderTeamName() {
      return this.$store.getters.currentUserTeam
    },
    competitionNames() {
      return this.weights.map(weight => weight.name)
    },
    firstTeamPlaceholder() {
      return this.newCompetition.tied ? 'Team 1' : 'Winner'
    },
    secondTeamPlaceholder() {
      return this.newCompetition.tied ? 'Team 2' : 'Loser'
    },
    weights() {
      return this.$store.state.weights
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    isLeader() {
      return this.$store.getters.isLeader
    },
  },
  created() {
    this.newCompetition = this.buildNewCompetition()
  },
  methods: {
    buildNewCompetition() {
      return {
        approvalState: 'submitted',
        defaultPoints: 0,
        loser: '',
        name: '',
        notes: '',
        points: null,
        submittedBy: {
          displayName: this.$store.getters.currentUserDislpayName,
          email: this.$store.getters.currentUserEmail,
        },
        tied: false,
        winner: this.leaderTeamName || null,
      }
    },
    adminHasNotSelectedWinner() {
      return this.isAdmin && !this.newCompetition.winner
    },
    addCompetition() {
      if (!this.newCompetition.name) return
      if (typeof this.newCompetition.points != 'number') return
      if (this.adminHasNotSelectedWinner()) return

      this.saving = true

      if (this.isLeader) {
        this.newCompetition.winner = this.leaderTeamName
      }

      this.$store.dispatch('addCompetition', this.newCompetition).then(() => {
        this.saving = false
        this.newCompetition = this.buildNewCompetition()
      }).catch((error) => {
        this.saving = false
      })
    },
    initializePoints() {
      const pointValue = this.weights.find(weight => weight.name == this.newCompetition.name).value
      this.newCompetition.defaultPoints = pointValue // i think this could be one step
      this.newCompetition.points = pointValue
    },
  },
}
</script>
