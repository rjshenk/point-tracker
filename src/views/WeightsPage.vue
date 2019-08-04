<template>
  <div class="container mx-auto px-4 -mt-32">
    <ul class="bg-white rounded-lg shadow max-w-md px-4 py-2">
      <li
        v-for="{name, value, id} in weights"
        :key="id"
        class="flex justify-between py-2 border-b text-lg relative"
      >
        <div class="py-2">
          {{ name }}
        </div>
        <input
          :value="value"
          type="number"
          class="text-right bg-grey-lighter appearance-none rounded w-20 py-1 mx-3 text-grey-darker leading-tight"
          @change="weightChange(id, parseInt($event.target.value))"
        />
        <button
          class="btn-close text-grey-light text-base"
          @click="remove(id)"
        >x</button>
      </li>
      <AddNewWeight/>
    </ul>
  </div>
</template>

<script>

import AddNewWeight from '@/components/AddNewWeight.vue'

export default {
  name: 'Weights',
  components: {AddNewWeight},
  computed: {
    weights() {
      return this.$store.getters.weights
    },
  },
  methods: {
    remove(weightId) {
      this.$store.dispatch('removeWeight', weightId)
    },
    weightChange(weightId, updatedWeightValue) {
      this.$store.dispatch('changeWeight', {weightId, updatedWeightValue})
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
