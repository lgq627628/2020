// 一个目的多种选择

let strategy = {
  slow: function(time) {
    console.log('慢速运动', time * 2)
  },
  normal: function(time) {
    console.log('正常运动', time)
  },
  fast: function(time) {
    console.log('快速运动', time / 2)
  }
}

strategy['slow']
strategy['normal']
strategy['fast']


let opearte = {
  '+': function() {},
  '-': function() {},
  '*': function() {},
  '/': function() {}
}


let reg = {
  isEmpty: function(val, msg) {},
  isMobile: function(val, msg) {}
}
