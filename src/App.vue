<template>
  <div id="app" class="bg-grey-lighter">
    <SiteHeader/>
    <router-view/>
  </div>
</template>

<script>
import './styles/app.scss'
import SiteHeader from '@/components/SiteHeader.vue'

export default {
  name: 'App',
  components: {SiteHeader},
  computed: {
    isAdmin() {
      return this.$store.getters.isAdmin
    },
  },
  created() {
    this.$store.dispatch('initializeAppData')
  },
}
</script>
