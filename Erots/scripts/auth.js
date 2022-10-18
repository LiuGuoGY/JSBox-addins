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
            views: [welcomeView, {
                type: "view",
                props: {
                    id: "statusView",
                    
                },
                layout: function(make, view) {
                    make.centerX.equalTo(view.super)
                    make.bottom.inset(30)
                    make.width.equalTo(view.super)
                    make.height.equalTo(40)
                }
            }]
        });
        let states = await api.requireServerState();
        let monitors = states.psp.monitors;
        let statusViews = [];
        let itemWidth = 80;
        for(let i = 0; i < monitors.length; i++) {
            statusViews.push({
                type: "view",
                layout: function(make, view) {
                    make.centerY.equalTo(view.super)
                    make.width.equalTo(itemWidth)
                    make.height.equalTo(view.super)
                    if(i == 0) {
                        make.left.inset(0)
                    } else {
                        make.left.equalTo(view.prev.right).inset(5)
                    }
                },
                views: [{
                    type: "view",
                    props: {
                        bgcolor: (monitors[i].statusClass == "success")?$color("#3bd771"):$color("#df484a"),
                        circular: true,
                    },
                    layout: function(make, view) {
                        make.centerY.equalTo(view.super)
                        make.size.equalTo($size(12, 12))
                        make.left.inset(0)
                    },
                },{
                    type: "label",
                    props: {
                        text: monitors[i].name,
                        align: $align.center,
                        font: $font(12),
                        textColor: (utils.getThemeMode() == "dark") ? $color("white") : $color("darkGray"),
                        align: $align.left,
                    },
                    layout: function(make, view) {
                        make.centerY.equalTo(view.super)
                        make.height.equalTo(30)
                        make.left.equalTo(view.prev.right).inset(5)
                    }
                }]
            })
        }
        $("statusView").add({
            type: "view",
            layout: function(make, view) {
                make.center.equalTo(view.super)
                make.height.equalTo(view.super)
                make.width.equalTo(itemWidth*monitors.length)
            },
            views: statusViews,
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
                    make.width.equalTo(100)
                },
                events: {
                    tapped: function(sender) {
                        detect()
                    }
                }
            }],
        }, {
            type: "button",
            props: {
                title: "查看可能的原因",
                align: $align.center,
                font: $font(15),
                titleColor: $color("gray"),
                borderWidth: 0,
                contentEdgeInsets: $insets(5, 15, 6, 15),
                bgcolor: $color("clear"),
            },
            layout: function(make, view) {
                make.centerX.equalTo(view.super)
                make.bottom.inset(20)
            },
            events: {
                tapped: function(sender) {
                    $ui.alert({
                        title: "无法连接的原因",
                        message: "1. 请检查与 " + utils.domain + " 的连通性；\n2. 请尝试关闭代理或者更换节点；",
                    });
                }
            }
        }]
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