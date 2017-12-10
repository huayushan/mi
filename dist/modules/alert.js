mi.define('jquery', function (exports) {
  exports('alert', function (params) {
    var $ = mi.$;
    var wrapper = '<div class="mi-alert">' +
      '<div class="mi-alert-hd">' +
      '<span>{{ title }}</span>' +
      '<i class="icon-close"></i></div>' +
      '<div class="mi-alert-bd">{{ content }}</div>' +
      '</div>';
    wrapper = wrapper.replace(/{{ title }}/, params.title).replace(/{{ content }}/, params.content);
    var alert = $(wrapper);
    $('body').append(alert);
  })
});