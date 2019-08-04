import Vue from 'vue'
import Vuex from 'vuex'
import {auth, firestore} from '@/firebase'
import router from '@/router'

Vue.use(Vuex)

export const TEAM_NAMES = [
  'black', 'blue', 'brown',
  'green', 'grey', 'lime',
  'orange', 'pink', 'purple',
  'red', 'turquoise', 'yellow',
]

const DEFAULT_CUSTOMER = 'covfel'
function setCurrentCustomer() {
  const subdomain = window.location.host.split('.')[0]
  return subdomain === 'points' ? DEFAULT_CUSTOMER : subdomain
}

const store = new Vuex.Store({
  state: {
    competitions: [],
    currentCustomer: setCurrentCustomer(),
    errors: [],
    loading: false,
    user: {
      displayName: '',
      email: '',
      photoURL: '',
      role: 'guest',
      team: '',
    },
    userInitialized: false,
    users: [],
    weights: [],
  },
  mutations: {
    SET_USER_PROPERTIES(state, user) {
      state.user = {...state.user, ...user}
      state.userInitialized = true
    },
    SIGN_OUT(state) {
      state.user = {
        displayName: '',
        email: '',
        photoURL: '',
        role: 'guest',
        team: '',
      }
      state.userInitialized = true
    },
    ADD_USERS: (state, users) => {
      Vue.set(state, 'users', users)
    },
    ADD_USER: (state, user) => {
      state.users.push(user)
    },
    SET_USER_RESONSIBILITY: (state, {userId, role, teamName}) => {
      const index = state.users.findIndex(user => user.id === userId)
      Vue.set(state.users, index, {
        id: userId,
        team: teamName,
        role: role,
      })
    },
    REMOVE_USER: (state, id) => {
      Vue.delete(state.users, state.users.findIndex(user => user.id === id))
    },
    ADD_COMPETITIONS: (state, competitions) => {
      state.competitions.push(...competitions)
    },
    REMOVE_COMPETITION: (state, id) => {
      Vue.delete(state.competitions, state.competitions.findIndex(comp => comp.id === id))
    },
    ADD_COMPETITION: (state, newCompetition) => {
      state.competitions.unshift(newCompetition)
    },
    UPDATE_APPROVAL_STATE: (state, {id, newApprovalState}) => {
      const index = state.competitions.findIndex(comp => comp.id === id)
      Vue.set(state.competitions[index], 'approvalState', newApprovalState)
    },
    // set weights shouldn't be called multiple times
    SET_WEIGHTS: (state, weights) => {
      state.weights = weights
    },
    REMOVE_WEIGHT: (state, id) => {
      Vue.delete(state.weights, state.weights.findIndex(weight => weight.id === id))
    },
    ADD_WEIGHT: (state, newWeight) => {
      state.weights.push(newWeight)
      Vue.set(state.weights, newWeight.name, newWeight.value)
    },
    UPDATE_WEIGHT: (state, {weightId, updatedWeightValue}) => {
      Vue.set(
        state.weights.find(weight => weight.id === weightId),
        'value',
        updatedWeightValue
      )
    },
    SET_LOADING(state, payload) {
      state.loading = payload
    },
    SET_ERROR(state, error, actionDescription) {
      state.errors.push({
        error: error.toString(),
        actionDescription,
      })
    },
    PUBLISH_ALL(state, newlyPublishedIds) {
      state.competitions.forEach((competition) => {
        if (newlyPublishedIds.includes(competition.id)) {
          Vue.set(competition, 'approvalState', 'published')
        }
      })
    },
  },
  actions: {
    fetchCurrentUser({commit, dispatch}) {
      return new Promise((resolve, reject) => {
        if (store.state.userInitialized) {
          resolve(store.state.user)
        } else {
          const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            unsubscribe()
            if (firebaseUser) {
              dispatch('userSignIn', firebaseUser)
                .then(user => resolve(user))
                .catch(error => commit('SET_ERROR', error, 'firebase signed in user that is not in the user table'))
            } else {
              commit('SIGN_OUT')
              resolve(store.state.user)
            }
          }, (authStateChangeError) => {
            commit('SET_ERROR', authStateChangeError, 'firebase onAuthStateChange error?')
            reject('firebase onAuthStateChange error')
          })
        }
      })
    },
    userSignIn({commit}, {email, photoURL, displayName}) {
      return firestore.collection('users').doc(email).get()
        .then((user) => {
          if (user.exists) {
            const completedUser = {
              displayName,
              email,
              photoURL,
              role: user.data().role,
              team: user.data().team,
            }
            commit('SET_USER_PROPERTIES', completedUser)
            return completedUser
          } else {
            commit('SET_ERROR', `user with ${email} does not exist`, 'firebase saying user does not exist?')
          }
        })
        .catch(error => commit('SET_ERROR', error, 'Requesting additional user properties'))
    },
    getUsers({commit, state}) {
      return firestore.collection('users').where('customer', '==', state.currentCustomer).get()
        .then((querySnapshot) => {
          const users = []
          querySnapshot.forEach((doc) => {
            users.push({id: doc.id, ...doc.data()})
          })
          commit('ADD_USERS', users)
        })
        .catch(error => commit('SET_ERROR', error, 'Requesting all users'))
    },
    setUserResponsibility({commit}, {userId, role, teamName}) {
      return firestore.collection('users').doc(userId).update({
        'role': role,
        'team': teamName,
      })
      .then(commit('SET_USER_RESONSIBILITY', {userId, role, teamName}))
      .catch(error => commit('SET_ERROR', error, 'Setting user team and role'))
    },
    removeUser({commit}, userId) {
      return firestore.collection('users').doc(userId).delete()
        .then(commit('REMOVE_USER', userId))
        .catch(error => commit('SET_ERROR', error, 'Removing user'))
    },
    addUser({commit, state}, email) {
      const newUser = {
        id: email,
        customer: state.currentCustomer,
        role: 'none',
        team: null,
      }
      return firestore.collection('users').doc(email)
        .set(newUser)
        .then(commit('ADD_USER', newUser))
        .catch(error => commit('SET_ERROR', error, 'Adding new user'))
    },
    userSignOut({commit}) {
      auth.signOut()
      commit('SIGN_OUT')
      router.push('/')
    },
    getAllCompetitions({commit, state}) {
      return firestore.collection('competitions').where('customer', '==', state.currentCustomer).get()
        .then((querySnapshot) => {
          const competitions = []
          querySnapshot.forEach((doc) => {
            const competition = {id: doc.id, ...doc.data()}
            competitions.push(competition)
          })
          commit('ADD_COMPETITIONS', competitions)
        })
        .catch(error => commit('SET_ERROR', error, 'Requesting all competitions'))
    },
    addCompetition({commit, state}, newCompetition) {
      newCompetition['customer'] = state.currentCustomer
      if (newCompetition.tied) {
        const otherTeam = {...newCompetition, winner: newCompetition.loser, loser: newCompetition.winner}
        firestore.collection('competitions').add(otherTeam)
          .then(docRef => commit('ADD_COMPETITION', {...otherTeam, id: docRef.id}))
          .catch(error => commit('SET_ERROR', error, 'Submitting losers points after a tie'))
      }
      return firestore.collection('competitions').add(newCompetition)
        .then(docRef => commit('ADD_COMPETITION', {...newCompetition, id: docRef.id}))
        .catch(error => commit('SET_ERROR', error, 'Submitting new competition results'))
    },
    removeCompetition({commit}, id) {
      return firestore.collection('competitions').doc(id).delete()
        .then(commit('REMOVE_COMPETITION', id))
        .catch(error => commit('SET_ERROR', error, 'Removing competition'))
    },
    getWeights({commit, state}) {
      return firestore.collection('weights').where('customer', '==', state.currentCustomer).get()
        .then((querySnapshot) => {
          const weights = []
          querySnapshot.forEach((doc) => {
            const {name, value} = doc.data()
            weights.push({
              id: doc.id,
              name,
              value,
            })
          })
          commit('SET_WEIGHTS', weights)
          return weights
        })
    },
    addWeight({commit, state}, {name, value}) {
      const newWeight = {
        name,
        value,
        customer: state.currentCustomer,
      }
      return firestore.collection('weights').add(newWeight)
        .then(({id}) => commit('ADD_WEIGHT', {...newWeight, id}))
        .catch((error) => {
          commit('SET_ERROR', error, 'Adding weight')
        })
    },
    changeWeight({commit}, {weightId, updatedWeightValue}) {
      return firestore.collection('weights').doc(weightId).update({
        'value': updatedWeightValue,
      })
      .then(commit('UPDATE_WEIGHT', {weightId, updatedWeightValue}))
      .catch(error => commit('SET_ERROR', error, 'Trying to change weight'))
    },
    removeWeight({commit}, weightName) {
      return firestore.collection('weights').doc(weightName).delete()
        .then(commit('REMOVE_WEIGHT', weightName))
        .catch(error => commit('SET_ERROR', error, 'Removing weight'))
    },
    publishAll({commit, state}) {
      const db = firestore
      const batch = db.batch()
      const approvedCompetitions = state.competitions.filter(comp => comp.approvalState === 'approved')
      approvedCompetitions.forEach((competition) => {
        const compRef = db.collection('competitions').doc(competition.id)
        batch.update(compRef, {approvalState: 'published'})
      })
      batch.commit()
      .then(commit('PUBLISH_ALL', approvedCompetitions.map(comp => comp.id)))
      .catch(error => commit('SET_ERROR', error, 'Publishing all approved points'))
    },
    updateApprovalState({commit}, {id, newApprovalState}) {
      return firestore.collection('competitions').doc(id)
        .set({approvalState: newApprovalState}, {merge: true})
        .then(commit('UPDATE_APPROVAL_STATE', {id, newApprovalState}))
        .catch(error => commit('SET_ERROR', error, 'Trying to update approval state'))
    },
    initializeAppData({dispatch}) {
      dispatch('getAllCompetitions')

      dispatch('fetchCurrentUser').then((currentUser) => {
        if (currentUser.role == 'admin') {
          dispatch('getWeights')
          dispatch('getUsers')
        } else if (currentUser.role == 'leader') {
          dispatch('getWeights')
        }
      })
    },
  },
  getters: {
    authenticatedUser: state => state.user.email,
    competitionNames: state => Object.keys(state.weights),
    currentUserDislpayName: state => state.user.displayName,
    currentUserEmail: state => state.user.email,
    currentUserTeam: state => state.user.team,
    isAdmin: state => state.user.role === 'admin',
    isLeader: state => state.user.role === 'leader',
    weights: state => [...state.weights].sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1),
  },
  strict: process.env.NODE_ENV !== 'production',
})

export default store
