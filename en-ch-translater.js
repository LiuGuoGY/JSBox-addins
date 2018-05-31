/**
 * @Version 2.8
 * @author Liu Guo
 * @date 2018.5.31
 * @brief
 *   1. 新增键盘模式，作为键盘时，iOS 11选中文本即时翻译， iOS 11以下复制文本即时翻译
 *   2. 修复当英文中含有中文时翻译为原文的 Bug
 *   3. 增加中英混合时的权重处理，现在翻译方向更加精准
 * @/brief
 */

"use strict"

let appVersion = 2.8
let addinURL = "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/en-ch-translater.js"
let appId = "PwqyveoNdNCk7FqvwOx9CL0D-gzGzoHsz"
let appKey = "gRxHqQeeWrM6U1QAPrBi9R3i"
let query = $context.query

uploadInstall()
if ($app.env == $env.keyboard) {
  setupKeyBdView()
  detectContent()
} else {
  if ($app.env != $env.today || needShowUi()) {
    setupView()
  }
  if(query.action != null) {
    solveAction(query.action)
  }
  if (needCheckup()) {
    checkupVersion()
  }
  translate($clipboard.text)
}

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
        bgcolor: $rgba(100, 100, 100, 0.07),
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

function setupView() {
  $app.autoKeyboardEnabled = true
  $app.keyboardToolbarEnabled = true
  $ui.render({
    props: {
      title: "中英互译",
    },
    views: [{
      type: "view",
      props: {
        id: "backgroud",
        bgcolor: $color("white"),
      },
      layout: $layout.fill,
      events: {
        tapped: function(sender) {
          $("text").blur()
          $("result").blur()
        }
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
        make.height.equalTo(300)
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
          make.centerX.equalTo(view.center)
          make.top.equalTo($("title").bottom).inset(20)
          make.height.equalTo(85)
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
          }
        },
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
          borderColor: $rgba(255, 255, 255, 0.0),
          borderWidth: 1,
          bgcolor: $rgba(255, 255, 255, 0.0),
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
          borderColor: $rgba(255, 255, 255, 0.0),
          borderWidth: 1,
          bgcolor: $rgba(255, 255, 255, 0.0),
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
          borderColor: $rgba(255, 255, 255, 0.0),
          borderWidth: 1,
          bgcolor: $rgba(255, 255, 255, 0.0),
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
          bgcolor: $rgba(100, 100, 100, 0.07),
          alwaysBounceVertical: false,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.center)
          make.top.equalTo($("text").bottom).inset(10)
          make.height.equalTo(85)
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
      },
      {
        type: "button",
        props: {
          id: "textCopy2",
          borderColor: $rgba(255, 255, 255, 0.0),
          borderWidth: 1,
          bgcolor: $rgba(255, 255, 255, 0.0),
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
          borderColor: $rgba(255, 255, 255, 0.0),
          borderWidth: 1,
          bgcolor: $rgba(255, 255, 255, 0.0),
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
          id: "translate",
          title: "翻译",
          bgcolor: $color("white"),
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
            $("result").text = ""
            translate($("text").text)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "tools",
          borderColor: $color("white"),
          borderWidth: 1,
          bgcolor: $color("white"),
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

          }
        }
      },
      {
        type: "button",
        props: {
          id: "setting",
          borderColor: $color("white"),
          borderWidth: 1,
          bgcolor: $color("white"),
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
    }]
  })
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
          text: "通知中心显示界面",
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
          on: needShowUi(),
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
      text : "版本号",
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
  }]
  $ui.push({
    props: {
      title: "设置",
    },
    views: [{
      type: "list",
      props: {
        template: feedBackTemplate,
        data: [
          {
            title: "功能设置",
            rows: [tabShowUiItem]
          },
          {
            title: "其他",
            rows: array,
          },
          {
            title: "统计",
            rows: [tabShowInstalls]
          }
        ]
      },
      layout: $layout.fill,
      events: {
        didSelect: function(sender, indexPath, title) {
          let titleText = title.templateTitle.text
          if(title.url) {
            $ui.push({
              props: {
                title: titleText
              },
              views: [{
                type: "web",
                props: {
                  url: title.url,
                },
                layout: $layout.fill,
              }]
            })
          } else {
            // if(title.templateTitle.text == "反馈与建议") {
            //   setupFeedBack()
            // }
            switch(title.templateTitle.text) {
              case "反馈与建议": setupFeedBack()
                break
              case "版本号": checkupVersion()
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

//反馈页面
function setupFeedBack() {
  $ui.push({
    props: {
      title: "反馈与建议"
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "feedback",
      },
      layout: function(make, view) {
        make.left.right.inset(10)
        make.height.equalTo(300)
        make.center.equalTo(view.super)
      },
      events: {
        
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
          alwaysBounceVertical: false,
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
      },
      {
        type: "button",
        props: {
          id: "sendFeedback",
          title: "发送",
          bgcolor: $color("white"),
          borderColor: $rgba(90, 90, 90, 0.6),
          borderWidth: 1,
          titleColor: $rgba(90, 90, 90, 0.6),
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
      },]
    }]
  })
}

//通知中心是否展示UI界面
function needShowUi(){
  let temp= $cache.get("showUi")
  if(temp == undefined) {
    $cache.set("showUi", true)
    return true
  } else {
    return temp
  }
}

function shadow(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 15)
  layer.invoke("setShadowOffset", $size(3, 3))
  layer.invoke("setShadowColor", $color("gray").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.3)
  layer.invoke("setShadowRadius", 8)
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
    meanText += ";"
  }
  showResult(mess.key, meanText)
}

//展示翻译结果
function showResult(title, msg) {
  if(!needShowUi() && $app.env == $env.today) {
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
        $cache.remove("firstInstall")
        $device.taptic(2)
        $delay(0.2, function() {
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
  if($app.env == $env.today && !needShowUi()) {
    $ui.Loading("检查更新")
  }
  $http.download({
    url: addinURL,
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      let str = resp.data.string
      let lv = getVFS(str)
      if($app.env == $env.today && !needShowUi()) {
        myLoading(false)
      }
      if (needUpdate(appVersion, lv)) {
        sureToUpdate(str, resp.data)
      }
    }
  })
}

//获取版本号
function getVFS(str) {
  let vIndex = str.indexOf("@Version ")
  let start = vIndex + 9
  let end = start + 3
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
function sureToUpdate(str, app) {
  let des = getUpDes(str)
  $ui.alert({
    title: "发现新版本",
    message: des + "\n是否更新？",
    actions: [{
        title: "是",
        handler: function() {
          updateAddin(app)
        }
      },
      {
        title: "否",
        handler: function() {

        }
      }
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
  $ui.loading(text)
}

//myAlert
function myAlert(text) {
  if ($app.env == $env.today && !needShowUi()) {
    $ui.alert(text)
  }
}

//myToast
function myToast(text, duration) {
  if ($app.env == $env.today && !needShowUi()) {
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
  do {
    let index1 = newText.indexOf("▫️")
    let index2 = newText.indexOf("\n", index1)
    if(newText.indexOf("▫️", index1 + 2) < 0) {
      index2 = newText.length
    }
    result += newText.slice(index1 + 2, index2 + 1)
    newText = newText.substring(index2 + 1)
  }while(newText.indexOf("▫️") >= 0)
  return result
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
  if($cache.get("firstInstall") == undefined) {
    $cache.set("firstInstall", true)
    $http.request({
      method: "POST",
      url: "https://pwqyveon.api.lncld.net/1.1/installations",
      timeout: 5,
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
      content: text,
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
