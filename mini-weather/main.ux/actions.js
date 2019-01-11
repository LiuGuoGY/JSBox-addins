let utils = require("scripts/utils");

let temp = $("label[0]");
let weatherType = $("label[1]");
let quality = $("label[2]");
let card = $("image[2]");

var app = require("./scripts/app");

exports.tapped = function(sender) {
  app.sayHello();
};

temp.text = utils.getCache("nowTemp", "0") + "°";
let cacheWeatherType = utils.getCache("todayType", "晴");
weatherType.text = cacheWeatherType;
card.src = utils.getCardSrc(cacheWeatherType);
quality.text = "空气质量：" + utils.getCache("nowQlty", "优");
card.height = utils.getWidgetHeight() - 20;
