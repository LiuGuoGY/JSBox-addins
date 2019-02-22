let view = require("scripts/view");
let update = require('scripts/update')
let request = require('scripts/request')
let utils = require("scripts/utils");

let appId = "KnKfUcSG1QcFIBPgM7D10thc-gzGzoHsz"
let appKey = "HqShYPrqogdvMOrBC6fIPqVa"

function setupView() {
  $ui.render({
    props: {
      navButtons: [
        {
          icon: "002", // Or you can use icon name
          handler: function() {
            setupSetting()
          }
        }
      ]
    },
    views: [{
      type: "view",
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.centerX.equalTo(view.super)
        make.top.inset(0)
        make.height.equalTo(220)
      },
      views: [view.setupCardView()]
    }]
  });
}


function setupSetting() {
  const feedBackTemplate = [{
    type: "label",
    props: {
      id: "templateTitle",
    },
    layout: function(make, view) {
      make.left.inset(15);
      make.centerY.equalTo(view.super);
    }
  },
  {
    type: "label",
    props: {
      id: "templateDetails",
      textColor: $color("#AAAAAA")
    },
    layout: function(make, view) {
      make.right.inset(15);
      make.centerY.equalTo(view.super);
    },
    events: {
      tapped: function(sender, indexPath, item) {
  
      }
    }
  }]

  const tabShowInstalls = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "tabShowInstalls",
          text: "安装量统计",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "label",
        props: {
          id: "tabShowInstallsDetail",
          text: "",
          textColor: $color("#AAAAAA"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        }
      }
    ],
    layout: $layout.fill
  }

  let array = [{
    templateTitle: {
      text : "更新日志",
    },
    templateDetails: {
      text : "",
    },
    url: "https://www.liuguogy.com/archives/mini-weather.html",
  },
  {
    templateTitle: {
      text : "GitHub",
    },
    templateDetails: {
      text : "",
    },
    url: "https://github.com/LiuGuoGY/JSBox-addins",
  },
  {
    templateTitle: {
      text : "检查更新",
    },
    templateDetails: {
      text : "",
    },
  },
  {
    templateTitle: {
      text : "反馈建议",
    },
    templateDetails: {
      text : "",
    },
  },]
  $ui.push({
    props: {
      title: "设置",
    },
    views: [{
      type: "list",
      props: {
        id: "list",
        template: feedBackTemplate,
        footer: {
          type: "view",
          props:{
            height: 60,
          },
          views: [{
            type: "label",
            props: {
              text: "Version " + update.getCurVersion() + " Beta (Build " + update.getCurDate() + "-" + update.getCurBuild() + ") © Linger.",
              textColor: $color("#BBBBBB"),
              align: $align.center,
              font: $font(13)
            },
            layout: function(make, view) {
              make.center.equalTo(view.super)
              make.height.equalTo(view.super)
            }
          },],
        },
        data: [{
          title: "功能",
          rows: [{
            templateTitle: {
              text : "报告天气错误",
              textColor: $color("#14BCF7"),
            },
            templateDetails: {
              text : "",
            },
          },]
        },{
          title: "关于",
          rows: array,
        },{
          title: "统计",
          rows: [tabShowInstalls]
        }
        ],
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.height.equalTo(view.super)
        make.width.equalTo(view.super)
      },
      events: {
        didSelect: function(sender, indexPath, title) {
          if(title.templateTitle == undefined) {
            return 0
          }
          let titleText = title.templateTitle.text
          if(title.url) {
            setupWebView(titleText, title.url)
          } else {
            switch(title.templateTitle.text) {
              case "反馈建议": setupFeedBack()
                break
              case "检查更新": update.checkUpdate(true);
                break
              case "报告天气错误": reportWeatherError();
                break
              default:
            }
          }
        }
      }
    }]
  })
  requireInstallNumbers()
}

function reportWeatherError() {
  $ui.alert({
    title: "提示",
    message: "点击确定按钮会提交所有的请求数据以供开发者进行适配，如介意请取消",
    actions: [
      {
        title: "确定",
        handler: function() {
          $console.info(utils.getCache("weatherRequestLog", ""));
          sendFeedBack("天气报错--->" + utils.getCache("weatherRequestLog", ""), "", ()=>{
            $ui.alert({
              title: "发送成功",
              message: "感谢您的反馈！",
              actions: [{
                title: "OK",
                handler: function() {
                }
              }]
            })
          })
        }
      },
      {
        title: "取消",
        handler: function() {
  
        }
      }
    ]
  });
}

//反馈页面
function setupFeedBack(text) {
  $ui.push({
    props: {
      id: "feedbackView",
      title: "反馈建议",
    },
    layout: $layout.fill,
    events: {
      appeared: function(sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      didAppear: function(sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      disappeared: function() {
        $app.autoKeyboardEnabled = false
        $app.keyboardToolbarEnabled = false
      }
    },
    views: [{
        type: "view",
        props: {
          id: "feedback",
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.height.equalTo(300)
          make.top.inset(20)
        },
        events: {
          tapped: function(sender) {
            $("feedbackText").blur()
            $("feedbackContact").blur()
          }
        },
        views: [{
            type: "label",
            props: {
              id: "feedbackTextTitle",
              text: "反馈内容：",
              textColor: $color("#333333"),
              font: $font(15),
            },
            layout: function(make, view) {
              make.top.inset(10)
              make.left.inset(20)
            }
          },
          {
            type: "text",
            props: {
              id: "feedbackText",
              text: (text)?text:"",
              align: $align.left,
              radius: 5,
              textColor: $color("#333333"),
              font: $font(15),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              insets: $insets(5, 5, 5, 5),
              alwaysBounceVertical: true,
            },
            layout: function(make, view) {
              make.height.equalTo(160)
              make.top.equalTo($("feedbackTextTitle").bottom).inset(5)
              make.centerX.equalTo(view.center)
              make.left.right.inset(20)
            },
          },
          {
            type: "label",
            props: {
              id: "feedbackContactTitle",
              text: "联系方式(选填):",
              textColor: $color("#333333"),
              font: $font(15),
            },
            layout: function(make, view) {
              make.top.equalTo($("feedbackText").bottom).inset(20)
              make.left.inset(20)
            }
          },
          {
            type: "text",
            props: {
              id: "feedbackContact",
              textColor: $color("#333333"),
              font: $font(15),
              bgcolor: $color("white"),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              insets: $insets(5, 5, 5, 5),
              radius: 5,
              align: $align.center,
            },
            layout: function(make, view) {
              make.left.equalTo($("feedbackContactTitle").right).inset(10)
              make.right.inset(20)
              make.centerY.equalTo($("feedbackContactTitle").centerY)
              make.height.equalTo(30)
            }
          },
          {
            type: "button",
            props: {
              id: "sendFeedback",
              title: "发送",
              bgcolor: $color("#F0F0F6"),
              titleColor: $color("#3478f7"),
              font: $font("bold", 16),
              titleEdgeInsets: $insets(2, 5, 2, 5)
            },
            layout: function(make, view) {
              make.left.right.inset(20)
              make.height.equalTo(40)
              make.bottom.inset(10)
              make.centerX.equalTo(view.super)
            },
            events: {
              tapped: function(sender) {
                if ($("feedbackText").text.length > 0) {
                  sendFeedBack($("feedbackText").text, $("feedbackContact").text, ()=>{
                    $ui.alert({
                      title: "发送成功",
                      message: "感谢您的反馈！开发者会认真考虑！",
                      actions: [{
                        title: "OK",
                        handler: function() {
                          $ui.pop()
                        }
                      }]
                    })
                  })
                }
              },
            }
          },
        ]
      },
    ]
  })
  if(text) {
    $delay(0.5, ()=>{
      if($("feedbackText")) {
        $("feedbackText").focus()
      }
    })
  }
}

function sendFeedBack(text, contact, handler) {
  $http.request({
    method: "POST",
    url: "https://knkfucsg.api.lncld.net/1.1/feedback",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    body: {
      status: "open",
      content: text + "\nID: " + $objc("FCUUID").invoke("uuidForDevice").rawValue().toString(),
      contact: contact,
    },
    handler: function(resp) {
      $device.taptic(2)
      $delay(0.2, function() {
        $device.taptic(2)
      })
      handler()
    }
  })
}

function setupWebView(title, url) {
  $ui.push({
    props: {
      title: title,
    },
    views: [{
      type: "web",
      props: {
        id: "webView",
        url: url,
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.height.equalTo(view.super)
        make.width.equalTo(view.super)
      },
    }]
  })
}

function requireInstallNumbers(){
  $http.request({
    method: "GET",
    url: "https://knkfucsg.api.lncld.net/1.1/installations?count=1&limit=0",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": appId,
      "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let results = resp.data.count
      if(results != undefined) {
        $("tabShowInstallsDetail").text = "" + results
      }
    }
  })
}

module.exports = {
  setupView: setupView,
};
