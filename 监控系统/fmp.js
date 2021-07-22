
function isFunction(what) {
    return typeof what === 'function';
  }



class FMPMonitor {
  constructor() {
    this._observer = new MutationObserver(this._count);
    this._startTime = Date.now();
    this._list = [];
  }

  setup = (callback) => {
    if (!this._observer) {
      return null;
    }

    this._callback = isFunction(callback) ? callback : () => {};
    this._startTime = Date.now();
    this._list = [];

    if (isFunction(this._observer.observe)) {
      this._observer.observe(document, {
        childList: true,
        subtree: true
      });
    }
  };

   _count = () => {
    const duration = Date.now() - this._startTime;
    const body = document.querySelector('body');
    if (body) {
      this._list.push({
        score: this._score(body, 1, false),
        time: duration
      });
    } else {
      this._list.push({
        score: 0,
        time: duration
      });
    }
    console.log(JSON.parse(JSON.stringify(this._list)))
  };

  _score = (element, depth, exist) => {
    let score = 0;
    const tagName = element.tagName;
    if (
      'SCRIPT' !== tagName &&
      'STYLE' !== tagName &&
      'META' !== tagName &&
      'HEAD' !== tagName
    ) {
      var childrenLength = element.children ? element.children.length : 0;
      if (childrenLength > 0) {
        const children = element.children;
        for (let length = childrenLength - 1; length >= 0; length--) {
          score += this._score(children[length], depth + 1, score > 0);
        }
      }
      if (score <= 0 && !exist) {
        if (
          !(
            element.getBoundingClientRect &&
            element.getBoundingClientRect().top < window.innerHeight
          )
        ) {
          return 0;
        }
      }
      score += 1 + 0.5 * depth;
    }
    return score;
  };

   _getFmp = () => {
    if (!this._observer) {
      return 0;
    }
    const duration = this._startTime - Date.now();

    if (!this._list.length) {
      return 0;
    }

    if (duration - this._list[this._list.length - 1].time > 1000) {
      return 0;
    }

    if (isFunction(this._observer.disconnect)) {
      this._observer.disconnect();
    }

    let target = {
      time: this._list[0].time,
      rate: 0
    };
    for (let s = 1; s < this._list.length; s++) {
      if (this._list[s].time >= this._list[s - 1].time) {
        var diff = this._list[s].score - this._list[s - 1].score;
        if (target.rate < diff) {
          target = {
            time: this._list[s].time,
            rate: diff
          };
        }
      }
    }

    return target.time;
  };

  _getTimeGap = () => {
    const gap = this._startTime - performance.timing.navigationStart;
    return gap;
  };

   _formatEvent = time => {
    const event = {
      name: this.name,
      type: 'post',
      event: {
        ev_type: 'fmp',
        fmp: time
      }
    };

    return event;
  };

   getLoadFmp = () => {
    const _fmp = this._getFmp();
    const time = _fmp ? this._getTimeGap() + _fmp : 0;

    const event = this._formatEvent(time);
    this._callback(event);
    return event;
  };

  getFmp = () => {
    const time = this._getFmp();
    const event = this._formatEvent(time);
    this._callback(event);
    return event;
  };
}



const monitor = new FMPMonitor();
monitor.setup();
