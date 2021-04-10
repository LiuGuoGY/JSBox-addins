let app = require("scripts/app");
let ui = require("scripts/ui");
let utils = require("scripts/utils");
let api = require("scripts/api");

async function detect() {
    if ($app.env == $env.app) {
        // let url = utils.domain + "/classes/fansList?where={\"deviceId\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
        // $http.request({
        //     method: "GET",
        //     url: encodeURI(url),
        //     timeout: 10,
        //     header: {
        //         "Content-Type": "application/json",
        //         "X-LC-Id": utils.conAppId,
        //         "X-LC-Key": utils.conAppKey,
        //     },
        //     handler: async function(resp) {
        //         if (!resp.data) {
        //             setupNotConnectView()
        //         } else {
        //             let data = resp.data.results
        //             await api.getErotsSetting();
        //             $delay(0.1, function() {
        //                 go();
        //             });
        //         }
        //     }
        // })
        let welcomeView = {
            type: "view",
            layout: function(make, view) {
                make.center.equalTo(view.super)
                make.size.equalTo($size(40, 40))
            },
            views: [{
                type: "spinner",
                props: {
                    loading: true,
                    style: (utils.getThemeMode() == "dark") ? 1 : 2,
                    bgcolor: $color("clear"),
                },
                layout: function(make, view) {
                    make.top.inset(0)
                    make.centerX.equalTo(view.super)
                }
            }, {
                type: "label",
                props: {
                    text: "正在载入...",
                    align: $align.center,
                    font: $font(12),
                    textColor: (utils.getThemeMode() == "dark") ? $color("white") : $color("darkGray"),
                },
                layout: function(make, view) {
                    make.centerX.equalTo(view.super).offset(4)
                    make.bottom.inset(0)
                }
            }],
        }
        if(utils.getCache("welcomeAnimation")) {
            welcomeView = {
                type: "view",
                layout: function(make, view) {
                    make.center.equalTo(view.super)
                    make.size.equalTo($size(100, 100))
                },
                views: [{
                    type: "lottie",
                    props: {
                        src: "assets/7899-loading.json",
                        loop: true,
                        // autoReverse: true,
                    },
                    layout: (make, view) => {
                        make.size.equalTo($size(100, 100));
                        make.top.inset(0)
                        make.centerX.equalTo(view.super);
                    },
                    events: {
                        ready: (sender)=>{
                            sender.play()
                        }
                    }
                }, {
                    type: "label",
                    props: {
                        text: "正在载入...",
                        align: $align.center,
                        font: $font(12),
                        textColor: (utils.getThemeMode() == "dark") ? $color("white") : $color("darkGray"),
                    },
                    layout: function(make, view) {
                        make.centerX.equalTo(view.super).offset(4)
                        make.bottom.inset(10)
                    }
                }],
            }
        }
        $ui.render({
            props: {
                navBarHidden: true,
                statusBarStyle: (utils.getThemeMode() == "dark") ? 1 : 0,
                bgcolor: (utils.getThemeMode() == "dark") ? $color("black") : $color("#FEFFFE"),
            },
            views: [welcomeView]
        });
        let times = 0;
        let failed = false;
        function isGo() {
            if(times >= 2) {
                if(!failed) {
                    go();
                } else {
                    setupNotConnectView();
                }
            }
        }
        $delay(0, async function() {
            let res = await api.getErotsSetting();
            times++;
            if(!res) {
                failed = true;
            }
            isGo();
        });
        $delay(0, async function() {
            let res = await api.requireApps();
            times++;
            if(!res) {
                failed = true;
            }
            isGo();
        });
    } else {
        go();
    }
}

function setupNotConnectView() {
    $ui.render({
        props: {
            navBarHidden: true,
            statusBarStyle: (utils.getThemeMode() == "dark") ? 1 : 0,
            bgcolor: (utils.getThemeMode() == "dark") ? $color("black") : $color("#FEFFFE"),
        },
        views: [{
            type: "view",
            layout: function(make, view) {
                make.center.equalTo(view.super)
                make.height.equalTo(110)
                make.width.equalTo(view.super)
            },
            views: [{
                type: "label",
                props: {
                    text: "无法连接到 Erots",
                    align: $align.center,
                    font: $font(32),
                    textColor: $color("gray"),
                },
                layout: function(make, view) {
                    make.top.inset(0)
                    make.centerX.equalTo(view.super)
                }
            }, {
                type: "button",
                props: {
                    title: "重试",
                    align: $align.center,
                    font: $font(15),
                    titleColor: $color("gray"),
                    borderWidth: 1,
                    borderColor: $color("gray"),
                    contentEdgeInsets: $insets(5, 15, 6, 15),
                    bgcolor: $color("clear"),
                },
                layout: function(make, view) {
                    make.centerX.equalTo(view.super).offset(4)
                    make.bottom.inset(0)
                },
                events: {
                    tapped: function(sender) {
                        detect()
                    }
                }
            }],
        }, ]
    });
}

function authCheck(pass) {
    if (!pass) {
        $cache.remove("themeColor");
        $cache.set("authPass", false);
    } else {
        $cache.set("authPass", true);
    }
}

function go() {
    if ($app.env != $env.app) {
        if (utils.getCache("haveBanned") === true) {
            ui.showBannedAlert()
        } else {
            // widget.setupView()
        }
    } else {
        app.show();
    }
}

module.exports = {
    start: detect,
};