import Vue from 'vue';
import App from './App.vue';
import Vuex from './vuex.js'
Vue.use(Vuex)

Vue.config.productionTip = false;

const store = new Vuex.Store({
  modules: {
    moduleA: {
      state: {
        x: 11
      },
      modulesC: {
        z: 66
      }
    },
    moduleB: {
      state: {
        y: 22
      }
    }
  },
  state: { // 统一的状态管理（直白点：变量管理）
    a: 1,
    b: 2
  },
  getters: {
    getA(state) {
      return state.a
    }
  },
  mutations: {
    ADDA(state, val=1) {
      state.a += val
    },
    MINUSA(state, val=1) {
      state.a -= val
    }
  },
  actions: {
    asyncAddA({commit}, value) {
      console.log('this', this)
      setTimeout(() => {
        commit('ADDA', value)
      }, 2000)
    }
  }
})

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
