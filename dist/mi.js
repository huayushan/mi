(function (win) {

  'use strict';

  var doc = document;
  var config = {
    modules: {}, //记录模块物理路径
    status: {}, //记录模块加载状态
    timeout: 10, //符合规范的模块请求最长等待秒数
    event: {} //记录模块自定义事件
  };

  var error = function (msg) {
    win.console && console.error && console.error('mi error' + msg);
  };

  // 配置内置模块
  var modules = {
    alert: 'modules/alert',
    picker: 'modules/picker',
    jquery: 'modules/jquery'
  };

  /**
   * 获取当前脚本所在位置
   * @returns {string}
   */
  function getPath() {
    var jsPath = doc.currentScript ? doc.currentScript.src : function () {
      var allJs = doc.scripts,
        last = allJs.length - 1,
        src;
      for (var i = last; i > 0; i--) {
        if (/mi.js$/.test(allJs[i].src) && allJs[i].readyState === 'interactive') {
          src = allJs[i].src;
          break;
        }
      }
      return src || allJs[last].src;
    }();
    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }

  // mi.js 所在目录
  var miPath = getPath();

  var Mi = function () {
    this.version = '1.0';
  };

  Mi.prototype.cache = config;

  Mi.prototype.isFun = function (fn) {
    return typeof fn === 'function';
  };

  Mi.prototype.isPlainObject = function (obj) {
    return obj.constructor === Object;
  };

  Mi.prototype.isString = function (str) {
    return typeof str === 'string';
  };

  // 全局配置
  Mi.prototype.config = function (options) {
    options = options || {};
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        config[key] = options[key];
      }
    }
    return this;
  };

  //记录全部模块
  Mi.prototype.modules = function () {
    var clone = {};
    for (var module in modules) {
      clone[module] = modules[module];
    }
    return clone;
  }();

  //拓展模块
  Mi.prototype.extend = function (obj) {
    var that = this;
    obj = obj || {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (that[key] || that.modules[key]) {
          error('\u6A21\u5757\u540D ' + o + ' \u5DF2\u88AB\u5360\u7528');
        } else {
          that.modules[key] = options[key];
        }
      }
    }
    return that;
  };

  Mi.prototype.each = function () {
    var key,
      that = this,
      args = arguments,
      obj = args[0] || [],
      callback = args[1];
    if (!that.isFun(callback)) return that;
    if (that.isPlainObject(obj)) {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          callback.call(obj[key], key, obj);
        }
      }
    } else {
      for (key = 0; key < obj.length; key++) {
        if (obj.hasOwnProperty(key)) {
          callback.call(obj[key], key, obj);
        }
      }
    }
    return that;
  };

  Mi.prototype.router = function (hash) {
    var that = this;
    hash = hash || location.hash;
    var data = {
      path: [],
      search: {},
      hash: (hash.match(/[^#](#.*$)/) || [])[1] || ''
    };
    if (!/^#\//.test(hash)) return data; //禁止非路由规范
    //提取Hash结构
    that.each(hash, function (index, item) {
      /^\w+=/.test(item) ? function () {
        item = item.split('=');
        data.search[item[0]] = item[1];
      }() : data.path.push(item);
    });
    return data;
  };

  // 定义模块
  Mi.prototype.define = function (requires, callback) {
    var that = this;
    var args = arguments;
    if (args.length === 1) {
      requires = [];
      callback = args[0];
    } else if (args.length > 1) {
      requires = args[0];
      callback = args[1];
    }
    var module = function () {
      /**
       * @param name 定义模块时的模块名
       * @param exports 定义模块暴露出的方法
       */
      callback(function (name, exports) {
        mi[name] = exports;
        config.status[name] = true;
      });
    };
    that.use(requires, module);
    return that;
  };

  // 使用指定模块
  Mi.prototype.use = function (requires, callback, exports) {
    var that = this;
    var dir = config.dir = config.dir ? config.dir : miPath;
    var head = doc.getElementsByTagName('head')[0];
    requires = typeof requires === 'string' ? [requires] : requires;
    // 内部有加载jquery 1.12.1 版本
    if (window.jQuery && jQuery.version === '1.12.1') {
      that.each(requires, function (item, key) {
        if (key === 'jquery') {
          requires.splice(item, 1);
        }
      });
      mi.jquery = mi.$ = jQuery;
    }

    // 先把第一个取出来
    var item = requires[0], timeout = 0;
    exports = exports || [];
    // 当前脚本所在host
    config.host = config.host || (dir.match(/\/\/([\s\S]+?)\//));

    // 没有依赖其他模块时 直接返回吧
    if (requires.length === 0) {
      onCallback();
      return that;
    }

    // 第一次加载
    if (!config.modules[item]) {

      // 创建script
      var node = doc.createElement('script');

      // 现在只支持模块统一放在mi/dist/modules
      var url = dir + modules[item] + '.js';
      node.async = true;
      node.charset = 'utf-8';
      node.src = url;
      head.appendChild(node);
      if (node.addEventListener) {
        node.addEventListener('load', function (e) {
          onScriptLoad(e, url);
        }, false);
      } else {
        node.attachEvent('onreadystatechange', function (e) {
          onScriptLoad(e, url);
        });
      }
      config.modules[item] = url;
    } else {
      (function poll() {
        if (++timeout > config.timeout * 1000) {
          return error(item + 'is not a valid module');
        }
        (that.isString(config.modules[item]) && config.status[item])
          ? onCallback()
          : setTimeout(poll, 4);
      }());
    }

    // 加载完成
    function onScriptLoad(e, url) {
      config.modules[item] = url;
      (function poll() {
        if (++timeout > config.timeout * 1000) {
          return error(item + 'is not a valid module');
        }
        (that.isString(config.modules[item]) && config.status[item])
          ? onCallback()
          : setTimeout(poll, 4);
      }());
    }

    /**
     * 加载完成后的回调, 递归处理
     * 职责：上一步加载完成一个模块之后 根据模块的长度来判断是否继续加载下一个模块或调用回调函数
     */
    function onCallback() {
      exports.push(mi[item]);
      requires.length > 1
        ? that.use(deps.slice(1), callback, exports)
        : (that.isFun(callback) && callback.apply(mi, exports))
    }
  };

  // 挂载到window
  win.mi = new Mi();
})(window);