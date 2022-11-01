let utils = require("scripts/utils");
let request = require('scripts/request')

async function show() {
    const data = await fetchWeiboHotData();
    const date = new Date();
    let aDate = new Date();
    aDate.setMinutes(aDate.getMinutes() + 15);

    $widget.setTimeline({
        // entries: [
        //     {
        //         date: new Date(),
        //         info: {}
        //     }
        // ],
        policy: {
            afterDate: aDate,
        },
        render: function (ctx) {
            const entry = ctx.entry;
            const family = ctx.family;
            const displaySize = ctx.displaySize;
            const isDarkMode = ctx.isDarkMode;

            if (family == 0) {
                let lists = [];
                for (let i = 0; i < 4; i++) {
                    let tintColor = $color("gray");
                    let lineLimit = 2;
                    switch (i) {
                        case 0: tintColor = $color("#E74C3C"); lineLimit = 3; break;
                        case 1: tintColor = $color("#E67E22"); break;
                        case 2: tintColor = $color("#F1C40F"); break;
                        default: break;
                    }
                    lists.push({
                        type: "image",
                        props: {
                            symbol: (i + 1) + ".circle.fill",
                            resizable: true,
                            color: tintColor,
                            frame: $size(18, 18),
                        }
                    })
                    lists.push({
                        type: "text",
                        props: {
                            text: data[i].title,
                            font: $font(14),
                            lineLimit: lineLimit,
                            frame: {
                                alignment: $widget.alignment.center,
                            }
                        }
                    })
                }
                return {
                    type: "zstack",
                    props: {
                        alignment: $widget.alignment.center,
                        widgetURL: "jsbox://run?name=" + encodeURI($addin.current.name),
                    },
                    views: [
                        {
                            type: "image",
                            props: {
                                image: $image("assets/weibo.png"),
                                opacity: 0.1,
                                resizable: true,
                                rotationEffect: Math.PI * 0.05,
                                offset: $point(-0.25 * displaySize.width, -0.25 * displaySize.height),
                                frame: {
                                    width: displaySize.width,
                                    height: displaySize.height,
                                }
                            }
                        },
                        {
                            type: "vgrid",
                            props: {
                                columns: [{
                                    fixed: 15,
                                }, {
                                    flexible: {
                                        minimum: 20,
                                        maximum: Infinity
                                    }
                                }],
                                spacing: 5,
                                padding: 10,
                                alignment: $widget.horizontalAlignment.leading,
                            },
                            views: lists,
                        },
                        {
                            type: "zstack",
                            props: {
                                frame: {
                                    width: 40,
                                    height: 15,
                                    alignment: $widget.alignment.center,
                                },
                                clipped: true,
                                position: $point(displaySize.width - 35, displaySize.height - 10),
                            },
                            views: [
                                {
                                    type: "color",
                                    props: {
                                        light: "black",
                                        dark: "white",
                                        cornerRadius: {
                                            value: 7,
                                            style: 1 // 0: circular, 1: continuous
                                        },
                                        opacity: 0.2,
                                    }
                                },
                                {
                                    type: "text",
                                    props: {
                                        date: date,
                                        font: $font("bold", 10),
                                        color: $color("white"),
                                        style: $widget.dateStyle.time,
                                        opacity: 0.8,
                                    }
                                },
                            ]
                        }
                    ]
                }
            } else if (family == 1) {
                let lists = [];
                for (let i = 0; i < 6; i++) {
                    let tintColor = $color("gray");
                    switch (i) {
                        case 0: tintColor = $color("#E74C3C"); break;
                        case 1: tintColor = $color("#E67E22"); break;
                        case 2: tintColor = $color("#F1C40F"); break;
                        default: break;
                    }
                    lists.push({
                        type: "hstack",
                        props: {
                            alignment: $widget.verticalAlignment.leading,
                            spacing: 10,
                            link: "jsbox://run?name=" + encodeURI($addin.current.name) + "&title=" + encodeURI(data[i].title) + "&url=" + encodeURI("https://s.weibo.com/weibo?q=" + encodeURIComponent(data[i].scheme.match(/search\?keyword=(.*)/)[1])),
                        },
                        views: [
                            {
                                type: "image",
                                props: {
                                    symbol: (i + 1) + ".circle.fill",
                                    resizable: true,
                                    color: tintColor,
                                    frame: $size(18, 18),
                                }
                            },
                            {
                                type: "text",
                                props: {
                                    text: data[i].title,
                                    font: $font(14),
                                    frame: {
                                        alignment: $widget.alignment.leading,
                                    }
                                }
                            }
                        ]
                    })
                }
                return {
                    type: "zstack",
                    props: {
                        alignment: $widget.alignment.center,
                        widgetURL: "jsbox://run?name=" + encodeURI($addin.current.name),
                    },
                    views: [
                        {
                            type: "image",
                            props: {
                                image: $image("assets/weibo.png"),
                                opacity: 0.1,
                                resizable: true,
                                frame: $size(displaySize.height * 0.7 * 1.23, displaySize.height * 0.7),
                            }
                        },
                        {
                            type: "vstack",
                            props: {
                                spacing: 5,
                                padding: 10,
                                alignment: $widget.horizontalAlignment.leading,
                            },
                            views: lists,
                        },
                        {
                            type: "zstack",
                            props: {
                                frame: {
                                    width: 50,
                                    height: 20,
                                    alignment: $widget.alignment.center,
                                },
                                clipped: true,
                                position: $point(displaySize.width - 40, displaySize.height - 20),
                            },
                            views: [
                                {
                                    type: "color",
                                    props: {
                                        light: "black",
                                        dark: "white",
                                        cornerRadius: {
                                            value: 10,
                                            style: 1 // 0: circular, 1: continuous
                                        },
                                        opacity: 0.2,
                                    }
                                },
                                {
                                    type: "text",
                                    props: {
                                        date: date,
                                        font: $font("bold", 12),
                                        color: $color("white"),
                                        style: $widget.dateStyle.time,
                                        opacity: 0.8,
                                    }
                                },
                            ]
                        }
                    ]
                }
            } else {
                let lists = [];
                for (let i = 0; i < 13; i++) { //仅展示10条
                    let tintColor = $color("gray");
                    switch (i) {
                        case 0: tintColor = $color("#E74C3C"); break;
                        case 1: tintColor = $color("#E67E22"); break;
                        case 2: tintColor = $color("#F1C40F"); break;
                        default: break;
                    }
                    lists.push({
                        type: "hstack",
                        props: {
                            alignment: $widget.verticalAlignment.leading,
                            spacing: 10,
                            link: "jsbox://run?name=" + encodeURI($addin.current.name) + "&title=" + encodeURI(data[i].title) + "&url=" + encodeURI("https://s.weibo.com/weibo?q=" + encodeURIComponent(data[i].scheme.match(/search\?keyword=(.*)/)[1])),
                        },
                        views: [
                            {
                                type: "image",
                                props: {
                                    symbol: (i + 1) + ".circle.fill",
                                    resizable: true,
                                    color: tintColor,
                                    frame: $size(18, 18),
                                }
                            },
                            {
                                type: "text",
                                props: {
                                    text: data[i].title,
                                    font: $font(14),
                                    frame: {
                                        alignment: $widget.alignment.leading,
                                    }
                                }
                            }
                        ]
                    })
                }
                return {
                    type: "zstack",
                    props: {
                        alignment: $widget.alignment.center,
                        widgetURL: "jsbox://run?name=" + encodeURI($addin.current.name),
                    },
                    views: [
                        {
                            type: "image",
                            props: {
                                image: $image("assets/weibo.png"),
                                opacity: 0.1,
                                resizable: true,
                                frame: $size(displaySize.height * 0.4 * 1.23, displaySize.height * 0.4),
                            }
                        },
                        {
                            type: "vstack",
                            props: {
                                spacing: 5,
                                padding: 10,
                                alignment: $widget.horizontalAlignment.leading,
                            },
                            views: lists,
                        },
                        {
                            type: "zstack",
                            props: {
                                frame: {
                                    width: 50,
                                    height: 20,
                                    alignment: $widget.alignment.center,
                                },
                                clipped: true,
                                position: $point(displaySize.width - 40, displaySize.height - 20),
                            },
                            views: [
                                {
                                    type: "color",
                                    props: {
                                        light: "black",
                                        dark: "white",
                                        cornerRadius: {
                                            value: 10,
                                            style: 1 // 0: circular, 1: continuous
                                        },
                                        opacity: 0.2,
                                    }
                                },
                                {
                                    type: "text",
                                    props: {
                                        date: date,
                                        font: $font("bold", 12),
                                        color: $color("white"),
                                        style: $widget.dateStyle.time,
                                        opacity: 0.8,
                                    }
                                },
                            ]
                        }
                    ]
                }
            }
        }
    });
}

async function fetchWeiboHotData() {
    const data = utils.getCache("hotData", []);

    let weiboHotData = await request.getWeiboHot();

    if (weiboHotData) {
        utils.setCache("hotData", weiboHotData.list);
        return weiboHotData.data;
    } else {
        return data;
    }
}

module.exports = {
    show: show,
};
