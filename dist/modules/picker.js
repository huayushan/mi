var Picker = function () {
  this.version = '1.0';
};

var defaults = {

};

mi.define(function (exports) {
  exports('picker', function () {
    return new Picker();
  })
});