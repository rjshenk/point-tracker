import Vue from 'vue'
import Login from '@/views/Login.vue'
import PointsPage from '@/views/PointsPage.vue'
import Router from 'vue-router'
import UsersPage from '@/views/UsersPage.vue'
import Weights from '@/views/WeightsPage.vue'
import store from '@/store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      name: 'points',
      component: PointsPage,
    },
    {
      path: '/points',
      redirect: '/',
    },
    {
      path: '/users',
      name: 'users',
      component: UsersPage,
      meta: {requiresAdmin: true},
    },
    {
      path: '/weights',
      name: 'weights',
      component: Weights,
      meta: {requiresAdmin: true},
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (onPointsPage(to)) {
    next()
    return
  }

  store.dispatch('fetchCurrentUser').then((currentUser) => {
    if (adminOnAdminPage(currentUser, to)) {
      next()
    } else if (guestOnAdminPage(currentUser, to)) {
      next({
        path: '/login',
        query: {redirect: to.fullPath},
      })
    } else if (leaderOnAdminPage(currentUser, to)) {
      next('points')
    } else {
      next()
    }
  })
})

function guestOnAdminPage({role}, to) {
  return role == 'guest' && onAdminPage(to)
}

function adminOnAdminPage({role}, to) {
  return role == 'admin' && onAdminPage(to)
}

function leaderOnAdminPage({role}, to) {
  return role == 'leader' && onAdminPage(to)
}

function onAdminPage(to) {
  return to.matched.some(record => record.meta.requiresAdmin)
}

function onPointsPage({name}) {
  return name == 'points'
}

export default router
