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
                for (let i = 0; i < 3; i++) {
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
                            frame: $size(20, 20),
                        }
                    })
                    lists.push({
                        type: "text",
                        props: {
                            text: data[i].name,
                            font: $font(15),
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
                                opacity: 0.12,
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
                            type: "text",
                            props: {
                                date: date,
                                font: $font("bold", 35),
                                opacity: 0.12,
                                position: $point(displaySize.width * 0.65, displaySize.height - 18),
                                color: $color("gray"),
                                style: $widget.dateStyle.time
                            }
                        },
                        {
                            type: "vgrid",
                            props: {
                                columns: [{
                                    fixed: 20,
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
                        }
                    ]
                }
            } else if (family == 1) {
                // let lists = [];
                // for (let i = 0; i < 8; i++) {
                //     let tintColor = $color("gray");
                //     let lineLimit = 1;
                //     switch (i) {
                //         case 0: tintColor = $color("#E74C3C"); lineLimit = 2; break;
                //         case 1: tintColor = $color("#E67E22"); lineLimit = 2; break;
                //         case 2: tintColor = $color("#F1C40F"); lineLimit = 2; break;
                //         case 3: lineLimit = 2; break;
                //         default: break;
                //     }
                //     lists.push({
                //         type: "image",
                //         props: {
                //             symbol: (i + 1) + ".circle.fill",
                //             resizable: true,
                //             color: tintColor,
                //             frame: $size(20, 20),
                //         }
                //     })
                //     lists.push({
                //         type: "text",
                //         props: {
                //             link: "jsbox://run?name=" + encodeURI($addin.current.name) + "&title=" + encodeURI(data[i].name) + "&url=" + encodeURI(data[i].url),
                //             text: data[i].name,
                //             font: $font(15),
                //             lineLimit: lineLimit,
                //             frame: {
                //                 alignment: $widget.alignment.leading,
                //             }
                //         }
                //     })
                // }
                // return {
                //     type: "zstack",
                //     props: {
                //         alignment: $widget.alignment.center,
                //     },
                //     views: [
                //         {
                //             type: "image",
                //             props: {
                //                 image: $image("assets/weibo.png"),
                //                 opacity: 0.12,
                //                 resizable: true,
                //                 frame: $size(displaySize.height * 0.7 * 1.23, displaySize.height * 0.7),
                //             }
                //         },
                //         {
                //             type: "text",
                //             props: {
                //                 date: date,
                //                 font: $font("bold", 35),
                //                 opacity: 0.12,
                //                 position: $point(displaySize.width - 60, displaySize.height - 18),
                //                 color: $color("gray"),
                //                 style: $widget.dateStyle.time
                //             }
                //         },
                //         {
                //             type: "vgrid",
                //             props: {
                //                 columns: [{
                //                     fixed: 20,
                //                 }, {
                //                     flexible: {
                //                         minimum: 20,
                //                         maximum: Infinity
                //                     }
                //                 }, {
                //                     fixed: 20,
                //                 }, {
                //                     flexible: {
                //                         minimum: 20,
                //                         maximum: Infinity
                //                     }
                //                 }],
                //                 spacing: 5,
                //                 padding: 10,
                //                 alignment: $widget.horizontalAlignment.leading,
                //             },
                //             views: lists,
                //         }
                //     ]
                // }
                let lists = [];
                for (let i = 0; i < 5; i++) {
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
                            link: "jsbox://run?name=" + encodeURI($addin.current.name) + "&title=" + encodeURI(data[i].name) + "&url=" + encodeURI(data[i].url),
                        },
                        views: [
                            {
                                type: "image",
                                props: {
                                    symbol: (i + 1) + ".circle.fill",
                                    resizable: true,
                                    color: tintColor,
                                    frame: $size(20, 20),
                                }
                            },
                            {
                                type: "text",
                                props: {
                                    text: data[i].name,
                                    font: $font(15),

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
                    },
                    views: [
                        {
                            type: "image",
                            props: {
                                image: $image("assets/weibo.png"),
                                opacity: 0.12,
                                resizable: true,
                                frame: $size(displaySize.height * 0.7 * 1.23, displaySize.height * 0.7),
                            }
                        },
                        {
                            type: "text",
                            props: {
                                date: date,
                                font: $font("bold", 35),
                                opacity: 0.12,
                                position: $point(displaySize.width - 60, displaySize.height - 18),
                                color: $color("gray"),
                                style: $widget.dateStyle.time
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
                        }
                    ]
                }
            } else {
                let lists = [];
                for (let i = 0; i < data.length; i++) {
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
                            link: "jsbox://run?name=" + encodeURI($addin.current.name) + "&title=" + encodeURI(data[i].name) + "&url=" + encodeURI(data[i].url),
                        },
                        views: [
                            {
                                type: "image",
                                props: {
                                    symbol: (i + 1) + ".circle.fill",
                                    resizable: true,
                                    color: tintColor,
                                    frame: $size(20, 20),
                                }
                            },
                            {
                                type: "text",
                                props: {
                                    text: data[i].name,
                                    font: $font(15),
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
                    },
                    views: [
                        {
                            type: "image",
                            props: {
                                image: $image("assets/weibo.png"),
                                opacity: 0.12,
                                resizable: true,
                                frame: $size(displaySize.height * 0.5 * 1.23, displaySize.height * 0.5),
                            }
                        },
                        {
                            type: "text",
                            props: {
                                date: date,
                                font: $font("bold", 35),
                                opacity: 0.12,
                                position: $point(displaySize.width * 0.5, displaySize.height - 18),
                                color: $color("gray"),
                                style: $widget.dateStyle.time
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

    if (weiboHotData && weiboHotData.data == 200 && weiboHotData.list) {
        utils.setCache("hotData", weiboHotData.list);
        return weiboHotData.list;
    } else {
        return data;
    }
}

module.exports = {
    show: show,
};
