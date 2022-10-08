let ui = require('scripts/ui')
let utils = require('scripts/utils')
let update = require('scripts/update')

function setupWidgetView() {
  $widget.setTimeline(ctx => {
    const family = ctx.family;
    if(family <= 0) {
      return {
        type: "text",
        props: {
          text: "不支持小的桌面小组件，请选择中号或大号小组件",
          widgetURL: "jsbox://run?name=" + encodeURIComponent($addin.current.name)
        }
      }
    } else {
      const maxRows = (family == 1)?2:5;
      let items = utils.getCache("localItems", [])
      let columns = utils.getCache("columns")
      let showLength = (items.length > columns * maxRows)?columns * maxRows:items.length;
      let views = genViews(items, showLength)
      return {
        type: "zstack",
        props: {
          // padding: 0,
        },
        views: [{
          type: "color",
          props: {
            color: $color("secondarySurface"),
            padding: 0,
          },
        },{
          type: "vgrid",
          props: {
            widgetURL: "jsbox://run?name=" + encodeURIComponent($addin.current.name),
            padding: 10,
            columns: Array(columns).fill({
              flexible: {
                minimum: 10,
                maximum: Infinity
              },
              spacing: 3,
              // alignment: $widget.alignment.center
            }),
            spacing: 10,
            // alignment: $widget.verticalAlignment.center
          },
          views: views,
        }]
      }
    }
  });
}

function genViews(items, length) {
  let randomColor = utils.randomValue(utils.colors)
  let showMode = utils.getCache("showMode", 0)
  let itemViews = []
  for(let i = 0; i < length; i++) {
    let link = items[i].url;
    let iconUrl = items[i].icon.src;
    let text = items[i].title.text;
    if(showMode == 0) {
      itemViews.push({
        type: "zstack",
        props: {
          alignment: $widget.alignment.center,
          frame: { height: 50 },
          link: link,
        },
        views: [{
          type: "image",
          props: {
            uri: iconUrl,
            resizable: true,
            cornerRadius: 10,
            padding: 0,
            opacity: 0.2,
            blur: 20,
          },
        },{
          type: "vstack",
          props: {
            alignment: $widget.horizontalAlignment.center,
            padding: $insets(7, 0, 7, 0),
          },
          views: [{
            type: "image",
            props: {
              uri: iconUrl,
              resizable: true,
              background: $color("clear"),
              frame: { width: 20, height: 20 },
              cornerRadius: 5,
            }
          },{
            type: "text",
            props: {
              font: $font(13),
              text: text,
              lineLimit: 1,
            }
          }]
        }]
      })
    } else if(showMode == 1) {
      itemViews.push({
        type: "zstack",
        props: {
          alignment: $widget.alignment.center,
          frame: { height: 50 },
          link: link,
        },
        views: [{
          type: "color",
          props: {
            color: $color("systemGray6"),
            frame: { width: 42, height: 42 },
            cornerRadius: 21,
            // padding: 0,
          },
        },{
          type: "zstack",
          props: {
            alignment: $widget.alignment.center,
          },
          views: [{
            type: "image",
            props: {
              uri: iconUrl,
              resizable: true,
              background: $color("clear"),
              frame: { width: 20, height: 20 },
              cornerRadius: 5,
            }
          }]
        }]
      })
    } else if(showMode == 2) {
      itemViews.push({
        type: "zstack",
        props: {
          alignment: $widget.alignment.center,
          frame: { height: 50 },
          link: link,
        },
        views: [{
          type: "vstack",
          props: {
            alignment: $widget.horizontalAlignment.center,
          },
          views: [{
            type: "color",
            props: {
              color: randomColor,
              frame: { height: 1 , width: 30},
            }
          },{
            type: "text",
            props: {
              font: $font(13),
              text: text,
              frame: { height: 20 },
              // lineLimit: 1,
            }
          },{
            type: "color",
            props: {
              color: randomColor,
              frame: { height: 1 , width: 30},
            }
          }]
        }]
      })
    } else if(showMode == 3) {
      itemViews.push({
        type: "zstack",
        props: {
          alignment: $widget.alignment.center,
          frame: { height: 50 },
          link: link,
        },
        views: [{
          type: "image",
          props: {
            uri: iconUrl,
            cornerRadius: 10,
            // padding: 0,
            resizable: true,
            opacity: 0.2,
            blur: 20,
          },
        },{
          type: "hstack",
          props: {
            alignment: $widget.verticalAlignment.center,
          },
          views: [{
            type: "image",
            props: {
              uri: iconUrl,
              resizable: true,
              background: $color("clear"),
              frame: { width: 20, height: 20 },
              cornerRadius: 5,
            }
          },{
            type: "text",
            props: {
              font: $font(13),
              text: text,
              // lineLimit: 1,
            }
          }]
        }]
      })
    } else if(showMode == 4) {
      itemViews.push({
        type: "zstack",
        props: {
          alignment: $widget.alignment.center,
          frame: { height: 50 },
          link: link,
        },
        views: [{
          type: "color",
          props: {
            color: $color("systemGray6"),
            cornerRadius: 10,
            padding: 0,
          },
        },{
          type: "image",
          props: {
            uri: iconUrl,
            resizable: true,
            background: $color("clear"),
            frame: { width: 35, height: 35 },
            cornerRadius: 5,
          }
        }]
      })
    }
  }
  return itemViews;
}

module.exports = {
  show: setupWidgetView
}