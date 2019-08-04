<template>
  <div class="font-sans text-grey-darkest leading tight">
    <div class="container mx-auto max-w-md px-4 -mt-32 py-1">
      <div class="bg-white rounded-lg shadow p-2">
        <div v-if="isAdmin" class="container mx-auto">
          <div class="flex justify-between items-center">
            <div class="flex items-center pb-1">
              <div v-for="state in pointStates" :key="state">
                <div :class="graphStateStyling(state)" @click="setGraphApprovalState(state)">
                  {{ state }}
                </div>
              </div>
            </div>
            <svg
              class="text-grey-dark h-4 w-4 hover:text-grey-darkest"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              @click="sortGraphByPoints = !sortGraphByPoints"
            >
              <path d="M17 16v4h-2v-4h-2v-3h6v3h-2zM1 9h6v3H1V9zm6-4h6v3H7V5zM3 0h2v8H3V0zm12 0h2v12h-2V0zM9 0h2v4H9V0zM3 12h2v8H3v-8zm6-4h2v12H9V8z" />
            </svg>
          </div>
        </div>
        <GraphWrapper :sortByPoints="sortGraphByPoints" :teamScores="teamScores"></GraphWrapper>
      </div>
    </div>

    <NewCompetitionBuilder v-if="canAddPoints"></NewCompetitionBuilder>

    <PointsContainer
      v-for="state in pointStates"
      :key="state + 'container'"
      :state="state"
      :competitionsByApprovalState="competitions.filter(comp => comp.approvalState == state)"
    />
  </div>
</template>

<script>
import GraphWrapper from '@/components/GraphWrapper.vue'
import PointsContainer from '@/components/PointsContainer.vue'
import NewCompetitionBuilder from '@/components/NewCompetitionBuilder.vue'
import Vue from 'vue'

export default {
  name: 'PointsPage',
  components: {
    GraphWrapper,
    NewCompetitionBuilder,
    PointsContainer,
  },
  data() {
    return {
      pointStates: ['submitted', 'approved', 'published'],
      selectedGraphState: ['published'],
      sortGraphByPoints: false,
    }
  },
  computed: {
    competitions() {
      return this.$store.state.competitions
    },
    canAddPoints() {
      return this.isAdmin || this.isLeader
    },
    teamScores() {
      return this.competitions.reduce((acc, {winner, points, approvalState, tied}) => {
        if (this.selectedGraphState.includes(approvalState)) {
          const divisor = tied ? 2 : 1
          acc[winner] = (acc[winner] || 0) + ((points || 0) / divisor)
        }
        return acc
      }, {})
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    isLeader() {
      return this.$store.getters.isLeader
    },
  },
  methods: {
    setGraphApprovalState(state) {
      const index = this.selectedGraphState.indexOf(state)
      if (index === -1) {
        this.selectedGraphState.push(state)
      } else {
        Vue.delete(this.selectedGraphState, index)
      }
    },
    graphStateStyling(state) {
      return `px-2 text-sm ${this.selectedGraphState.includes(state) ? 'text-grey-dark border border-grey-dark rounded-full' : 'text-grey-light'}`
    },
  },
}
</script>
