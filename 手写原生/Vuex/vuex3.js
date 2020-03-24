// Vuex 第三版：添加辅助方法

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

class ModuleCollection {
  constructor(opts) {
    this.root = this.register(opts)
  }

  register(module) {
    let newModule = {
      _raw: module,
      _state: module.state || {},
      _children: {}
    }
    Object.keys(module.modules || {}).forEach(moduleName => {
      newModule._children[moduleName] = this.register(module.modules[moduleName])
    })
    return newModule
  }
}

class Store {
  constructor(opts) {
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

    // 先格式化传进来的 modules 数据
    // 嵌套模块的 mutation 和 getters 都需要放到 this 中
    this.modules = new ModuleCollection(opts)
    console.log(this.modules)

    Store.installModules(this, [], this.modules.root)
  }

  commit = (mutationName, value) => { // 这个地方 this 指向会有问题，这其实是挂载在实例上
    this.mutations[mutationName].forEach(f => f(value))
  }

  dispatch(actionName, value) {
    this.actions[actionName].forEach(f => f(value))
  }

  get state() {
    return this.vm.state
  }
}
Store.installModules = function(store, path, curModule) {
  let getters = curModule._raw.getters || {}
  let mutations = curModule._raw.mutations || {}
  let actions = curModule._raw.actions || {}
  let state = curModule._state || {}

  // 把子模块的状态挂载到父模块上，其他直接挂载到根 store 上即可
  if (path.length) {
    let parent = path.slice(0, -1).reduce((pre, cur) => {
      return pre[cur]
    }, store.state)
    _Vue.set(parent, path[path.length - 1], state)
  }

  Object.keys(getters).forEach(getterName => {
    Object.defineProperty(store.getters, getterName, {
      get: () => {
        return getters[getterName](state)
      }
    })
  })

  Object.keys(mutations).forEach(mutationName => {
    if (!(store.mutations && store.mutations[mutationName])) store.mutations[mutationName] = []
    store.mutations[mutationName].push(value => {
      mutations[mutationName].call(store, state, value)
    })
  })

  Object.keys(actions).forEach(actionName => {
    if (!(store.actions && store.actions[actionName])) store.actions[actionName] = []
    store.actions[actionName].push(value => {
      actions[actionName].call(store, store, value)
    })
  })

  Object.keys(curModule._children || {}).forEach(module => {
    Store.installModules(store, path.concat(module), curModule._children[module])
  })


}

// computed: mapState(['name'])
// 相当于 name(){ return this.$store.state.name }
const mapState = list => { // 因为最后要在 computed 中调用
  let obj = {}
  list.forEach(stateName => {
    obj[stateName] = () => this.$store.state[stateName]
  })
  return obj
}

const mapGetters = list => { // 因为最后要在 computed 中调用
  let obj = {}
  list.forEach(getterName => {
    obj[getterName] = () => this.$store.getters[getterName]
  })
  return obj
}

const mapMutations = list => {
  let obj = {}
  list.forEach(mutationName => {
    obj[mutationName] = (value) => {
      this.$store.commit(mutationName, value)
    }
  })
  return obj
}

const mapActions = list => {
  let obj = {}
  list.forEach(actionName => {
    obj[actionName] = (value) => {
      this.$store.dispatch(actionName, value)
    }
  })
  return obj
}


export default {
  install,
  Store,
  mapState,
  mapGetters,
  mapMutations,
  mapActions
}
