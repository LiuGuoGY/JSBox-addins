let view = require("scripts/app");
if($app.env == $env.widget) {
    view = require("scripts/widget");
} else if($app.env == $env.today){
    view = require("scripts/today");
}
view.show()