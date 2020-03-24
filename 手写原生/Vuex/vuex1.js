// Vuex 第一版：基础功能

let _Vue
const install = function(Vue, opts) {
  _Vue = Vue
  _Vue.mixin({ // 因为我们每个组件都有 this.$store这个东西，所以我们使用混入模式
    beforeCreate () { // 从根组件向子组件遍历赋值，这边的 this 就是每个 Vue 实例
      if (this.$options && this.$options.store) { // 这是根节点
        this.$store = this.$options.store
      } else {
        this.$store = this.$parent && this.$parent.$store
      }
    }
  })
}

class Store {
  constructor(opts) {
    // this.initState(opts.state)
    // this.initGetters(opts.getters)
    // this.initMutations(opts.mutations)
    // this.initActions(opts.actions)
    this.vm = new _Vue({
      data () {
        return {
          state: opts.state // 把对象变成响应式的，这样才能更新视图
        }
      }
    })

    this.getters = {}
    this.mutations = {}
    this.actions = {}

    let getters = opts.getters || {}
    Object.keys(getters).forEach(getterName => {
      Object.defineProperty(this.getters, getterName, {
        get: () => {
          return getters[getterName](this.state)
        }
      })
    })

    let mutations = opts.mutations || {}
    Object.keys(mutations).forEach(mutationName => {
      this.mutations[mutationName] = value => {
        // mutations[mutationName](this.state, value)
        mutations[mutationName].call(this, this.state, value) // 方便开发在内部调用自身
      }
    })

    let actions = opts.actions || {}
    Object.keys(actions).forEach(actionName => {
      this.actions[actionName] = value => {
        // actions[actionName](this, value)
        let res = actions[actionName].call(this, this, value)
        return Promise.resolve(res)
      }
    })

  }

  commit = (mutationName, value) => { // 这个地方 this 指向会有问题，这其实是挂载在实例上
    this.mutations[mutationName](value)
  }

  dispatch(actionName, value) {
    this.actions[actionName](value)
  }

  get state() {
    return this.vm.state
  }
}

const Vuex = {
  install,
  Store
}

export default Vuex
