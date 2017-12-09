(function (win) {

  'use strict';

  var doc = document, config = {
    modules: {}, //记录模块物理路径
    status: {}, //记录模块加载状态
    timeout: 10, //符合规范的模块请求最长等待秒数
    event: {} //记录模块自定义事件
  };

  var Mi = function () {
    this.version = '1.0';
  };

  var getPath = function () {
    var jsPath = doc.currentScript ? doc.currentScript.src : function () {
      var allJs = doc.scripts,
        last = allJs.length - 1,
        src;
      for (var i = last; i >= 0; i--) {
        if (allJs[i].readyState === 'interactive') {
          src = allJs[i].src;
          break;
        }
      }
      return src || allJs[last].src;
    }();
    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }();

  var error = function (msg) {
    win.console && console.error && console.error('mi error' + msg);
  };

  // 内置模块
  var modules = {
    alert: 'modules/alert',
    picker: 'modules/picker'
  };

  //记录基础数据
  Mi.prototype.cache = config;

  // 定义模块
  Mi.prototype.define = function () {
    var that = this;
    var args = arguments;
    var callback, dependencies;
    if (args.length === 1) {
      dependencies = [];
      callback = args[0];
    } else if (args.length > 1) {
      dependencies = args[0];
      callback = args[1];
    }
    var mods = function () {
      callback(function (namespace, exports) {
        mi[namespace] = exports;
        config.status[namespace] = true;
      })
    };
    that.use(dependencies, mods);
    return that;
  };

  // 使用指定模块
  Mi.prototype.use = function (apps, module, exports) {
    console.log(apps);
  };

  win.mi = new Mi();
})(window);