let utils = require("scripts/utils");
let request = require('scripts/request')

async function show() {
    $ui.render({
        views: [{
            type: "view",
            props: {
            },
            layout: $layout.fill,
            views: [{
              type: "image",
              props: {
                src: "assets/weibo.png",
                alpha: 0.12,
                contentMode: $contentMode.scaleAspectFit,
              },
              layout: function(make, view) {
                make.centerX.equalTo(view.super)
                make.centerY.equalTo(view.super).offset(-10)
                make.size.equalTo($size(120, 120))
              }
            },{
                type: "matrix",
                props: {
                    id: "list",
                    autoItemSize: true,
                    estimatedItemSize: $size($device.info.screen.width-60, 0),
                    spacing: 2,
                    template: {
                        props: {
                          bgcolor: $color("clear")
                        },
                        views: [{
                          type: "image",
                          props: {
                            id: "order",
                            symbol: "",
                            tintColor: $color("gray"),
                          },
                          layout: function(make, view) {
                            make.centerY.equalTo(view.super)
                            make.size.equalTo($size(19, 19))
                            make.left.inset(5)
                          }
                        }, {
                          type: "label",
                          props: {
                            id: "text",
                            text: "",
                            font: $font(15),
                            align: $align.left,
                            lines: 2,
                          },
                          layout: function(make, view) {
                            make.centerY.equalTo(view.super)
                            make.left.equalTo(view.prev.right).inset(5)
                            make.right.inset(5)
                            make.height.equalTo(view.super)
                          }
                        }]
                      },
                },
                layout: function (make, view) {
                  make.center.equalTo(view.super)
                  make.edges.insets($insets(0, 10, 0, 10))
                },
                events: {
                    didSelect: function(sender, indexPath, data) {
                        $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name) + "&title=" + encodeURI(data.text.text) + "&url=" + encodeURI(data.text.info));
                    }
                },
            }],
        }]
    });
    $("list").data = utils.getCache("listData", []);
    let nowTime = new Date().getTime()
    if (nowTime - utils.getCache("lastRequestTime", 0) > 60000) {
        let weiboHotData = await request.getWeiboHot();
        let len = weiboHotData.data.length;
        let listData = [];
        for (let i = 0; i < 10; i++) {
            let tintColor = $color("gray");
            switch (i) {
                case 0: tintColor = $color("#E74C3C"); break;
                case 1: tintColor = $color("#E67E22"); break;
                case 2: tintColor = $color("#F1C40F"); break;
                default: break;
            }
            listData.push({
              order: {
                symbol: (i + 1) + ".circle.fill",
                tintColor: tintColor,
              },
              text: {
                text: weiboHotData.data[i].title,
                info: "https://s.weibo.com/weibo?q=" + encodeURIComponent(weiboHotData.data[i].scheme.match(/search\?keyword=(.*)/)[1]) + "&Refer=index",
              },
            })
        }
        $("list").data = listData;
        $cache.set("listData", listData);
        $cache.set("lastRequestTime", nowTime);
    }
    
}

module.exports = {
    show: show,
};
