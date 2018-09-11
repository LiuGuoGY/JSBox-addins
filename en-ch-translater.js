/**
 * @Version 4.2
 * @author Liu Guo
 * @date 2018.9.11
 * @brief
 *   1. 优化启动授权方式
 * @/brief
 */

"use strict"

let appVersion = 4.2
let addinURL = "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/en-ch-translater.js"
let appId = "PwqyveoNdNCk7FqvwOx9CL0D-gzGzoHsz"
let appKey = "gRxHqQeeWrM6U1QAPrBi9R3i"
let query = $context.query
let resumeAction = 0
let colors = [$rgba(120, 219, 252, 0.4), $rgba(252, 175, 230, 0.4), $rgba(252, 200, 121, 0.4), $rgba(187, 252, 121, 0.4), $rgba(173, 121, 252, 0.4), $rgba(252, 121, 121, 0.4), $rgba(121, 252, 252, 0.4), $rgba(121, 252, 127, 0.4)]
let cardHeight = 300

uploadInstall()
if ($app.env == $env.app) {
  checkBlackList()
}
if(!getCache("haveBanned", false)) {
  main()
} else {
  showBannedAlert()
}

function main() {
  requireLoadingHtml()
  if (($context.link != undefined || $context.safari != undefined) && ($app.env == $env.action || $app.env == $env.safari)) {
    let url = ($context.link != undefined)?$context.link:$context.safari.items.baseURI
    if(url != undefined) {
      let tUrl = "http://translate.googleusercontent.com/translate_c?depth=2&langpair=auto%7Czh-CN&nv=1&rurl=translate.google.com&sp=nmt4&u=" + encodeURI(url) + "&xid=17259,15700019,15700124,15700126,15700149,15700168,15700173,15700186,15700190,15700201,15700208&usg=ALkJrhjNujo9F9kpb17yrS0hQ0_rYZ4hng"
      $ui.render({
        props: {
          title: "网页翻译",
          navButtons: [
            {
              icon: "015",
              handler: function() {
                $context.close()
              }
            }
          ]
        },
        views: [{
          type: "web",
          props: {
            url: tUrl,
          },
          layout: $layout.fill
        }],
        events: {
          didFail: function(sender, navigation, error) {
            $ui.toast("message")
          }
        }
      })
    }
    $app.tips("网页翻译使用谷歌引擎，需要使用代理！")
  } else if ($app.env == $env.keyboard) {
    setupKeyBdView()
    detectContent()
  } else {
    if ($app.env != $env.today || getCache("showUi", true)) {
      setupView()
    }
    if(query.action != null) {
      solveAction(query.action)
    }
    if (needCheckup()) {
      checkupVersion()
    }
    translate(sourceText())
  }
}

$app.listen({
  resume: function() {
    let nDate = new Date()
    let sTime = getCache("stopTime", nDate.getTime())
    let tdoa = (nDate.getTime() - sTime) / 1000
    if (tdoa > 5) {
      switch(resumeAction) {
        case 1: 
        $photo.delete({
          count: 1,
          format: "data",
          handler: function(success) {
            $ui.alert({
              title: "温馨提示",
              message: "如果赞赏成功\n待开发者审核之后\n会将你的昵称放入赞赏名单里\n-----------\n如有匿名或其他要求请反馈给开发者",
            })
          }
        })
        break
      }
      resumeAction = 0
    }
  }
})

function detectContent() {
  let preSelected = ""
  let selectedText = ""
  let copyedText = $clipboard.text
  let preCopyed = $clipboard.text
  var timer = $timer.schedule({
    interval: 0.2,
    handler: function() {
      selectedText = $keyboard.selectedText
      copyedText = $clipboard.text
      if(selectedText != preSelected) {
        if(selectedText != "" && selectedText != undefined) {
          translate(selectedText)
          preSelected = selectedText
        }
      } else if (copyedText != preCopyed) {
        if(copyedText != "" && copyedText != undefined) {
          translate(copyedText)
          preCopyed = copyedText
        }
      }
    }
  })
}

function setupKeyBdView() {
  $ui.render({
    props: {
      title: "中英互译",
    },
    views: [{
      type: "gradient",
      props: {
        colors: [randomColor(), $rgba(255, 255, 255, 0.0), randomColor()],
        locations: [0.0, 0.5, 1.0],
        startPoint: $point(0.1, 0),
        endPoint: $point(0.7, 1),
        hidden: !getCache("showColor", true)
      },
      layout: $layout.fill,
    },
    {
      type: "blur",
      props: {
        style: 1,
        radius: 10,
        hidden: !getCache("showColor", true)
      },
      layout: $layout.fill
    },
    {
      type: "text",
      props: {
        id: "result",
        text: "",
        align: $align.left,
        radius: 10,
        textColor: $color("#333333"),
        font: $font(15),
        borderColor: $rgba(90, 90, 90, 0.6),
        borderWidth: 1,
        editable: false,
        selectable: false,
        bgcolor: $color("#F3F4F5"),
        alwaysBounceVertical: false,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.center)
        make.top.bottom.inset(20)
        make.left.right.inset(20)
      },
      events:{
        didBeginEditing: function(sender) {
        },
        didEndEditing: function(sender) {
        },
      },
    },
    {
      type: "button",
      props: {
        id: "textSpeech2",
        borderColor: $rgba(255, 255, 255, 0.0),
        borderWidth: 1,
        bgcolor: $rgba(255, 255, 255, 0.0),
        icon: $icon("012", $rgba(100, 100, 100, 0.3), $size(20, 20)),
        hidden: false,
      },
      layout: function(make, view) {
        make.bottom.equalTo($("result").bottom).inset(5)
        make.right.equalTo($("result").right).inset(5)
        make.width.equalTo(20)
        make.height.equalTo(20)
      },
      events: {
        tapped: function(sender) {
          speechText($("result").text)
        }
      }
    }]
  })
}

function sourceText() {
  if($context.textItems != undefined) {
    return $context.textItems[0]
  } else {
    return $clipboard.text
  }
}

function setupView() {
  $app.autoKeyboardEnabled = true
  $app.keyboardToolbarEnabled = true
  if(isInToday()) {
    let alpha = 1
    $delay(0.7, function(){
      let timer = $timer.schedule({
        interval: 0.01,
        handler: function() {
          if(alpha > 0) {
            $ui.vc.runtimeValue().$view().$setBackgroundColor($rgba(255, 255, 255, alpha))
            alpha -= 0.02
          } else {
            timer.invalidate()
          }
        }
      })
    })
  }
  $ui.render({
    props: {
      title: "中英互译",
      navBarHidden: isInToday(),
    },
    views: [{
      type: "view",
      props: {
        id: "backgroud",
        bgcolor: $color("clear"),
      },
      layout: $layout.fill,
      events: {
        tapped: function(sender) {
          $("text").blur()
          $("result").blur()
        },
      },
    },
    {
      type: "view",
      props: {
        id: "card",
        bgcolor: $color("white"),
        borderColor: $rgba(100, 100, 100, 0.4),
        borderWidth: 0,
        clipsToBounds: false,
      },
      layout: function(make, view) {
        make.left.right.inset(10)
        if($app.env == $env.today) {
          make.height.equalTo(cardHeight)
        } else {
          make.top.inset(50)
          if($device.info.version >= "11"){
            make.bottom.equalTo(view.super.safeAreaBottom).inset(50)
          } else {
            make.bottom.inset(50)
          }
        }
        make.center.equalTo(view.super)
        shadow(view)
      },
      events: {
        tapped: function(sender) {
          $("text").blur()
          $("result").blur()
        }
      },
      views: [{
        type: "gradient",
        props: {
          colors: [randomColor(), $rgba(255, 255, 255, 0.0), randomColor()],
          locations: [0.0, 0.5, 1.0],
          smoothRadius: 10,
          startPoint: $point(0.1, 0),
          endPoint: $point(0.7, 1),
          hidden: !getCache("showColor", true)
        },
        layout: $layout.fill,
      },
      {
        type: "blur",
        props: {
          style: 1,
          smoothRadius: 10,
          hidden: !getCache("showColor", true)
        },
        layout: $layout.fill
      },
      {
        type: "label",
        props: {
          id: "title",
          text: "中英互译",
          align: $align.center,
          textColor: $color("#333333"),
          font: $font(20),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.center)
          make.top.inset(15)
        }
      },
      {
        type: "label",
        props: {
          id: "version",
          text: "V" + appVersion,
          align: $align.center,
          textColor: $color("#333333"),
          font: $font(8),
          hidden: true,
        },
        layout: function(make, view) {
          make.left.inset(40)
          make.bottom.inset(10)
        }
      },
      {
        type: "label",
        props: {
          id: "copyright",
          text: "Linger",
          align: $align.center,
          textColor: $color("#333333"),
          font: $font(8),
          hidden: true,
        },
        layout: function(make, view) {
          make.right.inset(40)
          make.bottom.inset(10)
        }
      },
      {
        type: "button",
        props: {
          id: "translate",
          title: "翻译",
          bgcolor: $color("clear"),
          borderColor: $rgba(90, 90, 90, 0.6),
          borderWidth: 1,
          titleColor: $rgba(90, 90, 90, 0.6),
          font: $font(15),
          titleEdgeInsets: $insets(2, 5, 2, 5)
        },
        layout: function(make, view) {
          make.width.equalTo(50)
          make.height.equalTo(25)
          make.bottom.inset(20)
          make.centerX.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            $device.taptic(1)
            $("result").text = ""
            translate($("text").text)
          }
        }
      },
      {
        type: "view",
        layout: function(make, view) {
          make.centerX.equalTo(view.center)
          make.top.equalTo($("title").bottom)
          make.bottom.equalTo($("translate").top)
          make.left.right.inset(0)
        },
        views: [{
          type: "view",
          layout: function(make, view) {
            make.centerX.equalTo(view.center)
            make.top.inset(0)
            make.left.right.inset(0)
            make.height.equalTo(view.super).multipliedBy(0.5)
          },
          views: [{
            type: "text",
            props: {
              id: "text",
              text: "",
              align: $align.left,
              radius: 5,
              textColor: $color("#333333"),
              font: $font(15),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              insets: $insets(5,5,5,5),
              alwaysBounceVertical: false,
            },
            layout: function(make, view) {
              make.centerX.equalTo(view.super)
              if($app.env == $env.today) {
                make.top.inset(15)
              } else {
                make.top.inset(20)
              }
              if($app.env == $env.today) {
                make.bottom.inset(7.5)
              } else {
                make.bottom.inset(10)
              }
              make.left.right.inset(20)
            },
            events:{
              didBeginEditing: function(sender) {
                $("textDrop1").hidden = false
                $("textSpeech1").hidden = false
                $("speechInput").hidden = false
                // $("ocr").hidden = false
                $("speechLan").hidden = false
              },
              didEndEditing: function(sender) {
                $("textDrop1").hidden = true
                $("textSpeech1").hidden = true
                $("speechInput").hidden = true
                // $("ocr").hidden = true
                $("speechLan").hidden = true
                translate(sender.text)
              },
            },
          },]
        },{
          type: "view",
          layout: function(make, view) {
            make.centerX.equalTo(view.center)
            make.bottom.inset(0)
            make.left.right.inset(0)
            make.height.equalTo(view.super).multipliedBy(0.5)
          },
          views: [{
            type: "text",
            props: {
              id: "result",
              text: "",
              align: $align.left,
              radius: 5,
              textColor: $color("#333333"),
              font: $font(15),
              borderColor: $rgba(90, 90, 90, 0.6),
              borderWidth: 1,
              editable: true,
              bgcolor: $color("#F3F4F5"),//$rgba(100, 100, 100, 0.07),
              alwaysBounceVertical: false,
            },
            layout: function(make, view) {
              make.centerX.equalTo(view.super)
              if($app.env == $env.today) {
                make.bottom.inset(15)
              } else {
                make.bottom.inset(20)
              }
              if($app.env == $env.today) {
                make.top.inset(7.5)
              } else {
                make.top.inset(10)
              }
              make.left.right.inset(20)
            },
            events:{
              didBeginEditing: function(sender) {
                $("textCopy2").hidden = false
                $("textSpeech2").hidden = false
              },
              didEndEditing: function(sender) {
                $("textCopy2").hidden = true
                $("textSpeech2").hidden = true
              },
            },
          },],
        },]
      },
      
      {
        type: "button",
        props: {
          id: "textDrop1",
          borderColor: $rgba(255, 255, 255, 0.0),
          borderWidth: 1,
          bgcolor: $rgba(255, 255, 255, 0.0),
          icon: $icon("027", $rgba(100, 100, 100, 0.3), $size(20, 20)),
          hidden: true,
        },
        layout: function(make, view) {
          make.top.equalTo($("text").top).inset(5)
          make.right.equalTo($("text").right).inset(5)
          make.width.equalTo(20)
          make.height.equalTo(20)
        },
        events: {
          tapped: function(sender) {
            $("text").text = ""
            $("result").text = ""
            $device.taptic(2)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "textSpeech1",
          borderColor: $color("clear"),
          borderWidth: 1,
          bgcolor: $color("clear"),
          icon: $icon("012", $rgba(100, 100, 100, 0.3), $size(20, 20)),
          hidden: true,
        },
        layout: function(make, view) {
          make.bottom.equalTo($("text").bottom).inset(5)
          make.right.equalTo($("text").right).inset(5)
          make.width.equalTo(20)
          make.height.equalTo(20)
        },
        events: {
          tapped: function(sender) {
            speechText($("text").text)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "speechInput",
          borderColor: $color("clear"),
          borderWidth: 1,
          bgcolor: $color("clear"),
          icon: $icon("044", $rgba(100, 100, 100, 0.3), $size(20, 20)),
          hidden: true,
        },
        layout: function(make, view) {
          make.top.equalTo($("textSpeech1").top)
          make.right.equalTo($("textSpeech1").left).inset(15)
          make.width.equalTo(20)
          make.height.equalTo(20)
        },
        events: {
          tapped: function(sender) {
            $app.tips("长按录音按钮可以切换语言")
            let language = ($("speechLan").text == "英")?"en-US":"zh-CN"
            if($app.env != $env.app) {
              $app.openURL("jsbox://run?name=" + encodeURI(currentName()) + "&action=inputSpeech");
            } else {
              $input.speech({
                locale: language,
                handler:function(text) {
                  translate(text)
                }
              })
            }
          },
          longPressed: function(sender) {
            if($("speechLan").text == "英") {
              $("speechLan").text = "中"
              $cache.set("speechLan", "中")
            } else {
              $("speechLan").text = "英"
              $cache.set("speechLan", "英")
            }
            $device.taptic(2)
          }
        }
      },
      {
        type: "label",
        props: {
          id: "speechLan",
          text: getSpeechLan(),
          textColor: $rgba(200, 100, 100, 0.8),
          font: $font("bold", 8),
          hidden: true,
        },
        layout: function(make, view) {
          make.right.equalTo($("speechInput").right)
          make.bottom.equalTo($("speechInput").bottom)
        }
      },
      {
        type: "button",
        props: {
          id: "ocr",
          borderColor: $color("clear"),
          borderWidth: 1,
          bgcolor: $color("clear"),
          icon: $icon("018", $rgba(100, 100, 100, 0.3), $size(20, 20)),
          hidden: true,
        },
        layout: function(make, view) {
          make.top.equalTo($("speechInput").top)
          make.right.equalTo($("speechInput").left).inset(15)
          make.width.equalTo(20)
          make.height.equalTo(20)
        },
        events: {
          tapped: function(sender) {
            $photo.prompt({
              handler: function(resp) {
                var image = resp.image
              }
            })
          }
        }
      },
      
      {
        type: "button",
        props: {
          id: "textCopy2",
          borderColor: $color("clear"),
          borderWidth: 1,
          bgcolor: $color("clear"),
          icon: $icon("019", $rgba(100, 100, 100, 0.3), $size(20, 20)),
          hidden: true,
        },
        layout: function(make, view) {
          make.top.equalTo($("result").top).inset(5)
          make.right.equalTo($("result").right).inset(5)
          make.width.equalTo(20)
          make.height.equalTo(20)
        },
        events: {
          tapped: function(sender) {
            copy($("result").text)
            $device.taptic(2)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "textSpeech2",
          borderColor: $color("clear"),
          borderWidth: 1,
          bgcolor: $color("clear"),
          icon: $icon("012", $rgba(100, 100, 100, 0.3), $size(20, 20)),
          hidden: true,
        },
        layout: function(make, view) {
          make.bottom.equalTo($("result").bottom).inset(5)
          make.right.equalTo($("result").right).inset(5)
          make.width.equalTo(20)
          make.height.equalTo(20)
        },
        events: {
          tapped: function(sender) {
            speechText($("result").text)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "tools",
          bgcolor: $color("clear"),
          icon: $icon("102", $rgba(100, 100, 100, 0.4), $size(20, 20)),
          hidden: false,
        },
        layout: function(make, view) {
          make.top.inset(17)
          make.left.inset(20)
          make.width.equalTo(20)
          make.height.equalTo(20)
        },
        events: {
          tapped: function(sender) {
            $ui.menu({
              items: ["截图分享"],
              handler: function(title, idx) {
                switch(idx) {
                  case 0: share()
                    break
                }
              }
            })
          }
        }
      },
      {
        type: "button",
        props: {
          id: "setting",
          bgcolor: $color("clear"),
          icon: $icon("002", $rgba(100, 100, 100, 0.4), $size(20, 20)),
        },
        layout: function(make, view) {
          make.top.inset(17)
          make.right.inset(20)
          make.width.equalTo(20)
          make.height.equalTo(20)
        },
        events: {
          tapped: function(sender) {
            setupSetting()
          }
        }
      }]
    },
    {
      type: "button",
      props: {
        title: "CLOSE",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.bottom.equalTo($("card").top).inset(1)
        make.width.equalTo(120)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $device.taptic(1)
          $app.close(0.1)
        }
      }
    }]
  })
  if(isInToday()) {
    $widget.height = cardHeight + 70
  }
}

function share() {
  let image = $("card").snapshot
  $share.universal(image)
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

  const tabShowUiItem = {
    type: "view",
    props: {

    },
    views: [{
        type: "label",
        props: {
          id: "tabShowUiLabel",
          text: "通知中心显示卡片",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "switch",
        props: {
          id: "tabShowUiSwitch",
          on: getCache("showUi", true),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
              $cache.set("showUi", sender.on)
          }
        }
      }
    ],
    layout: $layout.fill
  }

  const tabShowColorItem = {
    type: "view",
    props: {

    },
    views: [{
        type: "label",
        props: {
          text: "炫",
          textColor: $color("magenta"),
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "label",
        props: {
          text: "彩",
          textColor: $color("orange"),
        },
        layout: function(make, view) {
          make.left.equalTo(view.prev.right)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "label",
        props: {
          text: "皮",
          textColor: $color("#32AFF6"),
        },
        layout: function(make, view) {
          make.left.equalTo(view.prev.right)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "label",
        props: {
          text: "肤",
          textColor: $color("#36CD36"),
        },
        layout: function(make, view) {
          make.left.equalTo(view.prev.right)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "switch",
        props: {
          id: "tabShowColorSwitch",
          on: getCache("showColor", true),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
              $cache.set("showColor", sender.on)
              $delay(0.3, function() {
                $app.openExtension($addin.current.name)
              })
          }
        }
      }
    ],
    layout: $layout.fill
  }

  const tabShowInstalls = {
    type: "view",
    props: {

    },
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
    url: "https://www.liuguogy.com/archives/jsbox-addin-zh-en-translater.html",
  },
  {
    templateTitle: {
      text : "GitHub",
    },
    templateDetails: {
      text : "",
    },
    url: "https://github.com/LiuGuoGY/JSBox-addins/blob/master/en-ch-translater.js",
  },
  {
    templateTitle: {
      text : "检查更新",
    },
    templateDetails: {
      text : "" + appVersion.toFixed(1),
    },
  },
  {
    templateTitle: {
      text : "反馈与建议",
      textColor: $color("#14BCF7"),
    },
    templateDetails: {
      text : "",
    },
  },
  {
    templateTitle: {
      text : "支持与赞赏",
      textColor: $color("#FF823E"),
    },
    templateDetails: {
      text : "",
    },
  }]
  $ui.push({
    props: {
      title: "设置",
      navBarHidden: isInToday(),
    },
    views: [{
      type: "list",
      props: {
        id: "list",
        template: feedBackTemplate,
        data: [
          {
            title: "界面",
            rows: [tabShowUiItem, tabShowColorItem]
          },
          {
            title: "关于",
            rows: array,
          },
          {
            title: "统计",
            rows: [tabShowInstalls]
          }
        ],
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        if(isInToday()) {
          make.height.equalTo(cardHeight)
        } else {
          make.height.equalTo(view.super)
        }
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
              case "反馈与建议": setupFeedBack()
                break
              case "检查更新": checkupVersion()
                break
              case "支持与赞赏": setupReward()
                break
              default:
            }
          }
        }
      }
    },
    {
      type: "button",
      props: {
        title: "CLOSE",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.right.inset(0)
        make.width.equalTo(view.super).multipliedBy(0.5)
        make.bottom.equalTo($("list").top).inset(1)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $app.close(0.1)
        }
      }
    },
    {
      type: "button",
      props: {
        title: "BACK",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.left.inset(0)
        make.width.equalTo(view.super).multipliedBy(0.5)
        make.bottom.equalTo($("list").top).inset(1)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $ui.pop()
        }
      }
    }]
  })
  requireInstallNumbers()
}

//赞赏页面
function setupReward() {
  const rewardTemplate = [{
    type: "label",
    props: {
      id: "templateTitle",
      textColor: $color("#333333"),
      font: $font("TrebuchetMS-Italic",17)
    },
    layout: function(make, view) {
      make.left.inset(40);
      make.centerY.equalTo(view.super);
    }
  },
  {
    type: "image",
    props: {
      id: "templateImage",
      icon: $icon("061", $color("#FF823E"), $size(15, 15)),
      bgcolor: $color("clear"),
      hidden: false,
    },
    layout: function(make, view) {
      make.right.inset(40);
      make.centerY.equalTo(view.super);
    }
  }]
  let array = $cache.get("rewardList")
  if(array == undefined) {
    array = []
  }
  $ui.push({
    props: {
      title: "支持与赞赏",
      navButtons: [
        {
          icon: "141", // Or you can use icon name
          handler: function() {
            $app.openURL("https://qr.alipay.com/c1x01118pzbsiaajndmmp65")
          }
        }
      ],
      navBarHidden: isInToday(),
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "reward",
      },
      layout: function(make, view) {
        make.left.right.inset(10)
        if($app.env == $env.today) {
          make.height.equalTo(cardHeight)
        } else {
          make.top.inset(50)
          if($device.info.version >= "11"){
            make.bottom.equalTo(view.super.safeAreaBottom).inset(50)
          } else {
            make.bottom.inset(50)
          }
        }
        make.center.equalTo(view.super)
      },
      events: {
        
      },
      views:[{
        type: "label",
        props: {
          id: "rewardTextTitle",
          text: "赞赏名单(按时间排序)：",
          textColor: $color("#333333"),
          font: $font(15),
        },
        layout: function(make, view) {
          make.top.inset(10)
          make.left.inset(20)
        }
      },
      {
        type: "tab",
        props: {
          id: "selection",
          items: ["辣条￥2", "饮料￥5", "咖啡￥10"],
          tintColor: $color("#333333"),
          index: 0,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.width.equalTo(200)
          make.bottom.inset(60)
          make.height.equalTo(25)
        },
        events: {
          changed: function(sender) {
          }
        }
      },
      {
        type: "button",
        props: {
          id: "aliRewardButton",
          title: " 支付宝 ",
          icon: $icon("074", $color("#108EE9"), $size(20, 20)),
          bgcolor: $color("clear"),
          titleColor: $color("#108EE9"),
          font: $font(15),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.height.equalTo(40)
          make.bottom.inset(10)
        },
        events: {
          tapped: function(sender) {
            switch($("selection").index) {
              case 0: $app.openURL("HTTPS://QR.ALIPAY.COM/FKX08935BBCTQWGRIJ7VDF")
                break
              case 1: $app.openURL("HTTPS://QR.ALIPAY.COM/FKX09116CT3WME79IRNO41")
                break
              case 2: $app.openURL("HTTPS://QR.ALIPAY.COM/FKX09563WVPH2YUGMKTX0A")
                break
            }
          }
        }
      },
      {
        type: "button",
        props: {
          id: "wxRewardButton",
          title: " 微信 ",
          icon: $icon("189", $color("#1AAD19"), $size(20, 20)),
          bgcolor: $color("clear"),
          titleColor: $color("#1AAD19"),
          font: $font(15),
        },
        layout: function(make, view) {
          make.left.inset(40)
          make.height.equalTo(40)
          make.bottom.inset(10)
        },
        events: {
          tapped: function(sender) {
            begainReward(sender.title)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "qqRewardButton",
          title: " QQ ",
          icon: $icon("070", $color("#E81F1F"), $size(20, 20)),
          bgcolor: $color("clear"),
          titleColor: $color("#E81F1F"),
          font: $font(15),
        },
        layout: function(make, view) {
          make.right.inset(40)
          make.height.equalTo(40)
          make.bottom.inset(10)
        },
        events: {
          tapped: function(sender) {
            begainReward(sender.title)
          }
        }
      },
      {
        type: "label",
        props: {
          id: "recommandText",
          text: "— 推荐方式 —",
          textColor: $rgba(100, 100, 100, 0.5),
          font: $font(10),
        },
        layout: function(make, view) {
          make.centerX.equalTo($("aliRewardButton"))
          make.bottom.inset(8)
        }
      },]
    },
    {
      type: "list",
      props: {
        id: "rewardList",
        template: rewardTemplate,
        radius: 5,
        borderColor: $rgba(90, 90, 90, 0.4),
        borderWidth: 1,
        insets: $insets(5,5,5,5),
        rowHeight: 35,
        bgcolor: $color("clear"),
        selectable: false,
        data: [
          {
            rows: array,
          },
        ],
        header: {
          type: "label",
          props: {
            height: 20,
            text: "Thank you all.",
            textColor: $rgba(90, 90, 90, 0.6),
            align: $align.center,
            font: $font(12)
          }
        }
      },
      layout: function(make, view) {
        make.top.equalTo($("rewardTextTitle").bottom).inset(5)
        make.bottom.equalTo($("selection").top).inset(20)
        make.centerX.equalTo(view.center)
        make.left.right.inset(20)
      },
      events: {
        didSelect: function(sender, indexPath, data) {

        }
      }
    },
    {
      type: "button",
      props: {
        title: "CLOSE",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.right.inset(0)
        make.width.equalTo(view.super).multipliedBy(0.5)
        make.bottom.equalTo($("reward").top).inset(1)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $app.close(0.1)
        }
      }
    },
    {
      type: "button",
      props: {
        title: "BACK",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.left.inset(0)
        make.width.equalTo(view.super).multipliedBy(0.5)
        make.bottom.equalTo($("reward").top).inset(1)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $ui.pop()
        }
      }
    }]
  })
  requireReward()
  $delay(1, function(){
    $("rewardList").scrollToOffset($point(0, 20))
  })
}

function begainReward(way) {
  $ui.alert({
    title: "确定赞赏？",
    message: "点击确定后，将会下载付款码到手机相册，并会跳转到" + way + "扫一扫\n你只需要选择相册里的付款码即可赞赏\n----------\n赞赏完成后别忘记回来，插件会自动删除付款码图片",
    actions: [
      {
        title: "确定",
        handler: function() {
          downloadRewardPic(way)
        }
      },
      {
        title: "取消",
      }
    ]
  })
}

function downloadRewardPic(way) {
  let PicWay = ""
  let PicMoney = ""
  let url = ""
  switch($("selection").index) {
    case 0: PicMoney = "02"
      break
    case 1: PicMoney = "05"
      break
    case 2: PicMoney = "10"
      break
  }
  switch(way) {
    case " 微信 ": PicWay = "wx"
      url = "weixin://scanqrcode"
      break
    case " QQ ": PicWay = "qq"
      url = "mqqapi://qrcode/scan_qrcode?version=1&src_type=app"
      break
  }
  $http.download({
    url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/en-ch-translater/" + PicWay + "_reward_" + PicMoney + ".JPG",
    progress: function(bytesWritten, totalBytes) {
      var percentage = bytesWritten * 1.0 / totalBytes
    },
    handler: function(resp) {
      $photo.save({
        data: resp.data,
        handler: function(success) {
          if (success) {
            let nDate = new Date()
            $cache.set("stopTime", nDate.getTime())
            resumeAction = 1
            $app.openURL(url)
          }
        }
      })
    }
  })
}

function setupWebView(title, url) {
  $ui.push({
    props: {
      title: title,
      navBarHidden: isInToday()
    },
    views: [{
      type: "web",
      props: {
        id: "webView",
        url: url,
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        if(isInToday()) {
          make.height.equalTo(cardHeight)
        } else {
          make.height.equalTo(view.super)
        }
        make.width.equalTo(view.super)
      },
    },
    {
      type: "button",
      props: {
        title: "CLOSE",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.right.inset(0)
        make.width.equalTo(view.super).multipliedBy(0.5)
        make.bottom.equalTo($("webView").top).inset(1)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $app.close(0.1)
        }
      }
    },
    {
      type: "button",
      props: {
        title: "BACK",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.left.inset(0)
        make.width.equalTo(view.super).multipliedBy(0.5)
        make.bottom.equalTo($("webView").top).inset(1)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $ui.pop()
        }
      }
    }]
  })
}

//反馈页面
function setupFeedBack() {
  $app.autoKeyboardEnabled = true
  $app.keyboardToolbarEnabled = true
  $ui.push({
    props: {
      title: "反馈与建议",
      navBarHidden: isInToday(),
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "feedback",
      },
      layout: function(make, view) {
        make.left.right.inset(10)
        make.height.equalTo(cardHeight)
        make.center.equalTo(view.super)
      },
      events: {
        tapped: function(sender) {
          $("feedbackText").blur()
          $("feedbackContact").blur()
        }
      },
      views:[{
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
        type: "button",
        props: {
          id: "sendFeedback",
          title: "发送",
          bgcolor: $color("#62BEF2"),
          titleColor: $color("white"),
          font: $font(15),
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
            if($("feedbackText").text.length > 0) {
              sendFeedBack($("feedbackText").text, $("feedbackContact").text)
            }
          }
        }
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
          make.bottom.equalTo($("sendFeedback").top).inset(20)
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
          insets: $insets(5,5,5,5),
          radius: 5,
          align: $align.center,
        },
        layout: function(make, view) {
          make.left.equalTo($("feedbackContactTitle").right).inset(10)
          make.right.inset(20)
          make.centerY.equalTo($("feedbackContactTitle").centerY)
          make.height.equalTo(30)
        }
      },{
        type: "text",
        props: {
          id: "feedbackText",
          text: "",
          align: $align.left,
          radius: 5,
          textColor: $color("#333333"),
          font: $font(15),
          borderColor: $rgba(90, 90, 90, 0.6),
          borderWidth: 1,
          insets: $insets(5,5,5,5),
          alwaysBounceVertical: true,
        },
        layout: function(make, view) {
          make.top.equalTo($("feedbackTextTitle").bottom).inset(5)
          make.bottom.equalTo($("feedbackContact").top).inset(15)
          make.centerX.equalTo(view.center)
          make.left.right.inset(20)
        },
      },]
    },
    {
      type: "button",
      props: {
        title: "CLOSE",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.right.inset(0)
        make.width.equalTo(view.super).multipliedBy(0.5)
        make.bottom.equalTo($("feedback").top).inset(1)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $app.close(0.1)
        }
      }
    },
    {
      type: "button",
      props: {
        title: "BACK",
        bgcolor: $color("clear"),
        titleColor: $rgba(100, 100, 100, 0.2),
        font: $font(15),
        hidden: !isInToday(),
      },
      layout: function(make, view) {
        make.left.inset(0)
        make.width.equalTo(view.super).multipliedBy(0.5)
        make.bottom.equalTo($("feedback").top).inset(1)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          $ui.pop()
        }
      }
    }]
  })
}

//获取缓存 def为默认值
function getCache(key, def) {
  let temp= $cache.get(key)
  if(temp == undefined) {
    $cache.set(key, def)
    return def
  } else {
    return temp
  }
}

function randomColor() {
  return colors[Math.floor(Math.random()*colors.length)]
}

function shadow(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 15)
  layer.invoke("setShadowOffset", $size(3, 3))
  layer.invoke("setShadowColor", $color("gray").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.3)
  layer.invoke("setShadowRadius", 8)
}

function isInToday() {
  return ($app.env == $env.today)?true:false
}

function solveAction(action) {
  let language = ($("speechLan").text == "英")?"en-US":"zh-CN"
  switch(action) {
    case "inputSpeech":
      $input.speech({
        locale: language,
        handler:function(text) {
          translate(text)
        }
      })
      break
    default:
  }
}

function translate(text) {
  if (text == undefined || text == "") {
    myAlert("剪切板为空")
  } else {
    let newText = preprocess(text)
    myLoading("翻译中")
    if (checkSpecChar(newText)) {
      googleTran(newText)
    } else {
      if (isTooLoog(newText)) {
        googleTran(newText)
      } else {
        bingTran(newText)
      }
    }
  }
}

function getSpeechLan() {
  let value = $cache.get("speechLan")
  if(value == undefined) {
    $cache.set("speechLan", "中")
    return "中"
  } else {
    return value
  }
}

//连字符预处理
function preprocess(txt) {
  let newText = txt
  if (whichLan(txt) == "en") {
    newText = txt.replace(/-\n/g, "")
  }
  return newText
}

//判断是否含特殊字符
function checkSpecChar(text) {
  let rule = /[~#^$@%&!*]/gi
  if (rule.test(text)) {
    return true
  } else {
    return false
  }
}

//长度预判断
function isTooLoog(text) {
  if (whichLan(text) == "en") {
    if (text.length > 20) {
      return true
    }
  } else {
    if (text.length > 6) {
      return true
    }
  }
  return false 
}

//必应翻译
function bingTran(text) {
  let url = "http://xtk.azurewebsites.net/BingDictService.aspx?Word=" + text + "&Samples=false"
  let codeUrl = encodeURI(url)
  $http.request({
    method: "GET",
    url: codeUrl,
    timeout: 5,
    showsProgress: false,
    handler: function(resp) {
      $console.info(resp.data)
      if (resp.error != null) {
        myLoading(false)
        myAlert("网络开小差了")
      } else if (!resp.data.hasOwnProperty("defs")) {
        if (resp.data.indexOf("An error occurs") >= 0) {
          googleTran(text)
        } else {
          kingsoftTran(text)
        }
      } else if (resp.data.defs == null) {
        googleTran(text)
      } else {
        myLoading(false)
        analyseBData(resp.data)
      }
    }
  })
}

//谷歌翻译
function googleTran(text) {
  let sl = whichLan(text)
  let tl = ""
  if (sl == "en") {
    tl = "zh-CN"
  } else {
    tl = "en"
  }
  $http.request({
    method: "POST",
    url: "http://translate.google.cn/translate_a/single",
    timeout: 5,
    header: {
      "User-Agent": "iOSTranslate",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      "dt": "t",
      "q": text,
      "tl": tl,
      "ie": "UTF-8",
      "sl": sl,
      "client": "ia",
      "dj": "1"
    },
    showsProgress: false,
    handler: function(resp) {
      myLoading(false)
      analyseGData(resp.data)
    }
  })
}

//金山词霸
function kingsoftTran(text) {
  let url = "http://dict-mobile.iciba.com/interface/index.php?c=word&m=getsuggest&nums=1&client=6&is_need_mean=1&word=" + text
  let codeUrl = encodeURI(url)
  $http.get({
    url: codeUrl,
    timeout: 5,
    showsProgress: false,
    handler: function(resp) {
      let data = resp.data
      if (data.status == 1) {
        myLoading(false)
        analyseKData(data)
      } else {
        googleTran(text)
      }
    }
  })
}

//分析谷歌数据
function analyseGData(data) {
  let length = data.sentences.length
  if(length != undefined) {
    let meanText = "▫️"
    let meanTitle = ""
    for (let i = 0; i < length; i++) {
      meanText += data.sentences[i].trans
      if (i < length - 1) {
        meanText += "\n"
      }
      meanTitle += data.sentences[i].orig
    }
    showResult(meanTitle, meanText)
  }
}

//分析必应数据
function analyseBData(data) {
  let length = data.defs.length
  let meanText = ""
  for (let i = 0; i < length; i++) {
    meanText += data.defs[i].pos
    meanText += "▫️"
    meanText += data.defs[i].def
    meanText += ";"
    if (i < length - 1) {
      meanText += "\n"
    }
  }
  showResult(data.word, meanText)
}

//分析金山数据
function analyseKData(data) {
  let mess = data.message[0]
  let length = mess.means.length
  let meanText = ""
  for (let i = 0; i < length; i++) {
    meanText += mess.means[i].part
    meanText += "▫️"
    let meansLength = mess.means[i].means.length
    for (let j = 0; j < meansLength; j++) {
      meanText += mess.means[i].means[j]
      meanText += "; "
    }
    if (i < length - 1) {
      meanText += "\n"
    }
  }
  showResult(mess.key, meanText)
}

//展示翻译结果
function showResult(title, msg) {
  if(!getCache("showUi", true) && $app.env == $env.today) {
    $ui.alert({
      title: shortDisplay(title),
      message: msg,
      actions: [{
          title: "OK",
          handler: function() {}
        },
        {
          title: "MORE",
          handler: function() {
            $delay(0.2, function() {
              showMore(title, msg)
            })
          }
        }
      ]
    })
  } else if($app.env == $env.keyboard) {
    $("result").text = msg
    $device.taptic(0)
  } else {
    $("text").text = title
    $("result").text = msg
  }
}

//更多操作
function showMore(text, msg) {
  $ui.menu({
    items: ["COPY", "SPEECH"],
    handler: function(title, idx) {
      switch (idx) {
        case 0:
          copy(msg)
          break;
        case 1:
          speechText(chooseEn(text, msg))
          break;
        default:
          break;
      }
    },
    finished: function(cancelled) {}
  })
}

//缩略显示
function shortDisplay(text) {
  let newText = text
  if ($app.env != $env.app) {
    if (whichLan(text) == "en") {
      if (text.length > 120) {
        newText = text.substring(0, 120) + " ..."
      }
    } else {
      if (text.length > 50) {
        newText = text.substring(0, 50) + " ..."
      }
    }
  }
  return newText
}

//需要更新？
function needUpdate(nv, lv) {
  let m = parseFloat(nv) - parseFloat(lv)
  if (m < 0) {
    return true
  } else {
    return false
  }
}

//升级插件
function updateAddin(app) {
  $addin.save({
    name: currentName(),
    data: app,
    icon: currentIcon(),
    handler: function(success) {
      if(success) {
        $device.taptic(2)
        $delay(0.15, function() {
          $device.taptic(2)
        })
        $ui.alert({
          title: "安装完成",
          actions: [{
              title: "OK",
              handler: function() {
                $app.openExtension($addin.current.name)
              }
            }
          ]
        })
      }   
    }
  })
}

//检查版本
function checkupVersion() {
  if($app.env == $env.today && !getCache("showUi", true)) {
    $ui.loading("检查更新")
  }
  $http.download({
    url: addinURL,
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      let str = resp.data.string
      let lv = getVFS(str)
      if($app.env == $env.today && !getCache("showUi", true)) {
        $ui.loading(false)
      }
      if (needUpdate(appVersion, lv)) {
        sureToUpdate(str, resp.data, lv)
      }
    }
  })
}

//获取版本号
function getVFS(str) {
  let vIndex = str.indexOf("@Version ")
  let start = vIndex + 9
  let end = str.indexOf("\n", start)
  let lv = str.substring(start, end)
  return lv
}

//获取更新说明
function getUpDes(str) {
  let bIndex = str.indexOf("@brief")
  let eIndex = str.indexOf("@/brief")
  let des = str.substring(bIndex + 6, eIndex)
  let fixDes = des.replace(/\*/g, "")
  return fixDes
}

//当前插件名
function currentName() {
  let name = $addin.current.name
  let end = name.length - 3
  return name.substring(0, end)
}

//当前插件图标
function currentIcon() {
  return $addin.current.icon
}

//确定升级？
function sureToUpdate(str, app, version) {
  let des = getUpDes(str)
  $ui.alert({
    title: "发现新版本 V" + version,
    message: des + "\n是否更新？",
    actions: [{
        title: "否",
        handler: function() {

        }
      },
      {
        title: "是",
        handler: function() {
          updateAddin(app)
        }
      },
    ]
  })
}

//需要检查更新？
function needCheckup() {
  let nDate = new Date()
  let lastCT = $cache.get("lastCT")
  if (lastCT == undefined) {
    $cache.set("lastCT", nDate)
    return true
  } else {
    let tdoa = (nDate.getTime() - lastCT.getTime()) / (60 * 1000)
    let interval = 1440
    if ($app.env == $env.app) {
      interval = 30
    }
    myLog("离下次检测更新: " + (interval - tdoa) + "  分钟")
    if (tdoa > interval) {
      $cache.set("lastCT", nDate)
      return true
    } else {
      return false
    }
  }
}

//判断语言
function whichLan(text) {
  let englishChar = text.match(/[a-zA-Z]/g)
  let englishNumber = !englishChar?0:englishChar.length
  let chineseChar = text.match(/[\u4e00-\u9fff\uf900-\ufaff]/g)
  let chineseNumber = !chineseChar?0:chineseChar.length
  let tl = "en"
  if ((chineseNumber * 2) >= englishNumber) {
    tl = "zh-CN"
  } else {
    tl = "en"
  }
  return tl
}

//TTS
function speechText(text) {
  let newText = delSquCha(text)
  let lan = whichLan(newText)
  let rate = 0.5
  if (lan == "en") {
    lan = "en-US"
    rate = 0.4
  }
  $console.info(newText)
  $text.speech({
    text: newText,
    rate: rate,
    language: lan,
  })
}

//myLog
function myLog(text) {
  if ($app.env == $env.app) {
    $console.log(text)
  }
}

//myloading
function myLoading(text) {
  // $ui.loading(text)
  if($app.env == $env.today && !getCache("showUi", true)) {
    $ui.loading(text)
  } else {
    if(text !== false) {
      addLodingView($("card"), 40, text)
    } else {
      removeLoadingView()
    }
  }
}

//myAlert
function myAlert(text) {
  if ($app.env == $env.today && !getCache("showUi", true)) {
    $ui.alert(text)
  }
}

//myToast
function myToast(text, duration) {
  if ($app.env == $env.today && !getCache("showUi", true)) {
    $ui.toast(text, duration)
  }
}

//选择英文的一项
function chooseEn(t1, t2) {
  let lan = "en"
  let text = t2
  if (whichLan(t1) == "en") {
    text = t1
  }
  return text
}

//复制到剪贴板
function copy(text) {
  $clipboard.text = delSquCha(text)
  $text.tokenize({
    text: $clipboard.text,
    handler: function(results) {
    }
  })
  $delay(0.1, function() {
    myToast("已复制到剪切板", 1)
  })
}

//全局删除▫️符号及props
function delSquCha(text) {
  let newText = text
  let result = ""
  let index1 = newText.indexOf("▫️")
  if(index1 < 0) {
    return newText
  }
  do {
    index1 = newText.indexOf("▫️")
    let index2 = newText.indexOf("\n", index1)
    if(newText.indexOf("▫️", index1 + 2) < 0) {
      index2 = newText.length
    }
    result += newText.slice(index1 + 2, index2 + 1)
    newText = newText.substring(index2 + 1)
  }while(newText.indexOf("▫️") >= 0)
  return result
}

function requireRewardNumber() {
  $http.request({
    method: "GET",
    url: "https://pwqyveon.api.lncld.net/1.1/classes/Reward?count=1&limit=0",
    timeout: 5,
    header: {
        "Content-Type": "application/json",
        "X-LC-Id": appId,
        "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let results = resp.data.count
      if(results != undefined) {
        
      }
    }
  })
}

function requireReward() {
  $http.request({
    method: "GET",
    url: "https://pwqyveon.api.lncld.net/1.1/classes/Reward",
    timeout: 5,
    header: {
        "Content-Type": "application/json",
        "X-LC-Id": appId,
        "X-LC-Key": appKey,
    },
    handler: function(resp) {
      let data = resp.data.results
      let array = []
      if(data != undefined) {
        for(let i = 0; i < data.length; i++) {
          array.unshift({
            templateTitle: {
              text : data[i].name,
            },
            templateImage: {
              hidden: false,
            }
          })
        }
        $("rewardList").data = array
        $cache.set("rewardList", array)
      }
    }
  })
}

function requireInstallNumbers(){
  $http.request({
    method: "GET",
    url: "https://pwqyveon.api.lncld.net/1.1/installations?count=1&limit=0",
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

function uploadInstall() {
  let info = {
    addinVersion: appVersion.toFixed(1),
    iosVersion: $device.info.version,
    jsboxVersion: $app.info.version,
    deviceType: "ios",
    deviceToken: $objc("FCUUID").invoke("uuidForDevice").rawValue()
  }
  let info_pre = getCache("installInfo")
  function isDifferent(info, info_pre) {
    if(info == undefined || info_pre == undefined) {
      return true
    } else if(info.addinVersion != info_pre.addinVersion || info.iosVersion != info_pre.iosVersion || info.jsboxVersion != info_pre.jsboxVersion || info.deviceToken != info_pre.deviceToken) {
      return true
    } else {
      return false
    }
  }
  if(isDifferent(info, info_pre)) {
    $cache.set("installInfo", info)
    $http.request({
      method: "POST",
      url: "https://pwqyveon.api.lncld.net/1.1/installations",
      timeout: 5,
      showsProgress: false,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": appId,
        "X-LC-Key": appKey,
      },
      body: {
        addinVersion: appVersion.toFixed(1),
        iosVersion: $device.info.version,
        jsboxVersion: $app.info.version,
        deviceType: "ios",
        deviceToken: $objc("FCUUID").invoke("uuidForDevice").rawValue()
      },
      handler: function(resp) {
      }
    })
  }
}

function sendFeedBack(text, contact) {
  $http.request({
    method: "POST",
    url: "https://pwqyveon.api.lncld.net/1.1/feedback",
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
      $ui.alert({
        title: "发送成功",
        message: "感谢您的反馈！开发者会认真考虑！",
        actions: [{
            title: "OK",
            handler: function() {
              $ui.pop()
            }
          }
        ]
      })
    }
  })
}

function requireLoadingHtml() {
  if(getCache("loadingHtml") === undefined) {
    $http.download({
      url: "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/en-ch-translater/loading.html",
      showsProgress: false,
      handler: function(resp) {
        if(resp.data.string) {
          $cache.set("loadingHtml", resp.data.string)
        }
      }
    })
  }
}

function loadingView(id, size, title) {
  return {
    type: "blur",
    props: {
      id: id,
      alpha: 0,
      style: 1,
      smoothRadius: 10,
    },
    layout: $layout.fill,
    views: [{
      type: "web",
      props: {
        bounces: 0,
        transparent: 1,
        scrollEnabled: 0,
        html: getCache("loadingHtml", "")
      },
      layout: (make, view) => {
        make.center.equalTo(view.super)
        make.size.equalTo($size(size, size))
      }
    }, {
      type: "label",
      props: {
        id: "tips",
        text: title ? title : "LOADING..."
      },
      layout: function (make, view) {
        make.centerX.equalTo(view.super)
        make.centerY.equalTo(view.super).offset(40)
      }
    }]
  }
}

function addLodingView(views, size, title) {
  $("loadingView") ? 0 : views.add(loadingView("loadingView", size, title));
  $ui.animate({
    duration: 0.4,
    animation: function () {
      $("loadingView") ? $("loadingView").alpha = 1 : 0;
    },
    completion: function () {

    }
  })
}

function removeLoadingView() {
  $ui.animate({
    duration: 0.4,
    animation: function () {
      $("loadingView") ? $("loadingView").alpha = 0 : 0;
    },
    completion: function () {
      $("loadingView") ? $("loadingView").remove() : 0;
    }
  })
}

function checkBlackList() {
  let nowTime = new Date().getTime()
  let lastCheckTime = getCache("lastCheckBlackTime")
  let needCheckBlackList = true
  if(lastCheckTime !== undefined && getCache("haveBanned") !== undefined) {
    if((nowTime - lastCheckTime) / (60 * 1000) < 60) {
      needCheckBlackList = false
    }
  }
  if(needCheckBlackList) {
    $cache.remove("haveBanned")
    $cache.set("lastCheckBlackTime", nowTime)
    let url = "https://wcphv9sr.api.lncld.net/1.1/classes/list?where={\"deviceToken\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
    $http.request({
      method: "GET",
      url: encodeURI(url),
      timeout: 5,
      showsProgress: false,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": "Ah185wdqs1gPX3nYHbMnB7g4-gzGzoHsz",
        "X-LC-Key": "HmbtutG47Fibi9vRwezIY2E7",
      },
      handler: function(resp) {
        let data = resp.data.results
        if(data.length > 0) {
          $cache.set("haveBanned", true)
          showBannedAlert()
        } else {
          $cache.set("haveBanned", false)
        }
      }
    })
  }
}

function showBannedAlert() {
  $ui.alert({
    title: "Warning",
    message: "You have been banned!",
    actions: [
      {
        title: "OK",
        handler: function() {
          $app.close()
        }
      },
    ]
  })
}
