let ui = require('scripts/ui')
let utils = require('scripts/utils')
let user = require('scripts/user')

function setupLogUpView() {
  $ui.push({
    props: {
      id: "logUpView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.bgcolor,
    },
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
    views: [ui.genPageHeader("主页", "注册"),
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          radius: 3,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(40)
          make.left.right.inset(30)
        },
        views: [{
          type: "label",
          props: {
            text: "邮箱",
            align: $align.center,
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.width.equalTo(70)
            make.left.inset(0)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.left.equalTo(view.prev.right)
            make.width.equalTo(1 / $device.info.screen.scale)
            make.top.bottom.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var height = view.frame.height
              ctx.strokeColor = $color("darkGray")
              ctx.setLineWidth(1)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(0, height)
              ctx.strokePath()
            }
          }
        },{
          type: "input",
          props: {
            id: "emailInput",
            text: "",
            type: $kbType.email,
            bgcolor: $color("white"),
            font: $font(15),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right)
            make.right.inset(0)
          },
          events: {
            didBeginEditing: function(sender) {
              $("emailInputError").text = ""
            },
            didEndEditing: function(sender) {
              checkLogUpAll()
            }
          }
        },{
          type: "label",
          props: {
            id: "emailInputError",
            text: "",
            align: $align.center,
            textColor: $color(utils.mColor.red),
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.right.inset(5)
          }
        },],
      },
      {
        type: "label",
        props: {
          text: "邮箱用于登录和忘记密码时重置密码",
          font: $font(11),
          align: $align.center,
          textColor: $color("lightGray"),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(3)
          make.left.inset(30)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          radius: 3,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(40)
          make.left.right.inset(30)
        },
        views: [{
          type: "label",
          props: {
            text: "昵称",
            align: $align.center,
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.width.equalTo(70)
            make.left.inset(0)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.left.equalTo(view.prev.right)
            make.width.equalTo(1 / $device.info.screen.scale)
            make.top.bottom.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var height = view.frame.height
              ctx.strokeColor = $color("darkGray")
              ctx.setLineWidth(1)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(0, height)
              ctx.strokePath()
            }
          }
        },{
          type: "input",
          props: {
            id: "nameInput",
            text: "",
            bgcolor: $color("white"),
            font: $font(15),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right)
            make.right.inset(0)
          },
          events: {
            didEndEditing: function(sender) {
              checkLogUpAll()
            }
          }
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          radius: 3,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(40)
          make.left.right.inset(30)
        },
        views: [{
          type: "label",
          props: {
            text: "密码",
            align: $align.center,
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.width.equalTo(70)
            make.left.inset(0)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.left.equalTo(view.prev.right)
            make.width.equalTo(1 / $device.info.screen.scale)
            make.top.bottom.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var height = view.frame.height
              ctx.strokeColor = $color("darkGray")
              ctx.setLineWidth(1)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(0, height)
              ctx.strokePath()
            }
          }
        },{
          type: "input",
          props: {
            id: "passwordInput",
            text: "",
            secure: true,
            bgcolor: $color("white"),
            font: $font(15),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right)
            make.right.inset(0)
          },
          events: {
            didBeginEditing: function(sender) {
              $("passwordInputError").text = ""
            },
            didEndEditing: function(sender) {
              checkLogUpAll()
            },
          },
        },{
          type: "label",
          props: {
            id: "passwordInputError",
            text: "",
            align: $align.center,
            textColor: $color(utils.mColor.red),
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.right.inset(5)
          }
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          radius: 3,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(40)
          make.left.right.inset(30)
        },
        views: [{
          type: "label",
          props: {
            text: "确认密码",
            align: $align.center,
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.width.equalTo(70)
            make.left.inset(0)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.left.equalTo(view.prev.right)
            make.width.equalTo(1 / $device.info.screen.scale)
            make.top.bottom.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var height = view.frame.height
              ctx.strokeColor = $color("darkGray")
              ctx.setLineWidth(1)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(0, height)
              ctx.strokePath()
            }
          }
        },{
          type: "input",
          props: {
            id: "passwordConfirmInput",
            text: "",
            secure: true,
            bgcolor: $color("white"),
            font: $font(15),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right)
            make.right.inset(0)
          },
          events: {
            didBeginEditing: function(sender) {
              $("passwordConfirmInputError").text = ""
            },
            didEndEditing: function(sender) {
              checkLogUpAll()
            }
          },
        },{
          type: "label",
          props: {
            id: "passwordConfirmInputError",
            text: "",
            align: $align.center,
            textColor: $color(utils.mColor.red),
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.right.inset(5)
          }
        },],
      },
      {
        type: "label",
        props: {
          text: "密码由 LeanCloud 托管，任何人都无法查看，也不会被记录",
          font: $font(11),
          align: $align.center,
          textColor: $color("lightGray"),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(3)
          make.left.inset(30)
        }
      },
      
      {
        type: "button",
        props: {
          id: "logUpButton",
          title: "注册 >",
          bgcolor: $color(utils.mColor.gray),
          titleColor: $color("white"),
          radius: 3,
        },
        layout: function(make, view) {
          make.width.equalTo(90)
          make.centerX.equalTo(view.super)
          make.height.equalTo(45)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
        events: {
          tapped: function(sender) {
            if(checkLogUpAll()) {
              let json = {
                username : $("emailInput").text,
                password : $("passwordInput").text,
                email : $("emailInput").text,
                nickname : $("nameInput").text,
              }
              user.logUp(json, function(isSuccessed) {
                if(isSuccessed) {
                  $ui.alert({
                    title: "注册成功",
                    message: "一封验证邮件已经发送至您的邮箱，请前往验证，验证成功后方可登陆",
                    actions: [{
                      title: "好的",
                      handler: function() {
                        $ui.pop()
                      }
                    }]
                  })
                }
              })
            }
          },
        }
      },]
  })
}

function setupLoginView() {
  $ui.push({
    props: {
      id: "loginView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.bgcolor,
    },
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
    views: [ui.genPageHeader("主页", "登录"),
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          radius: 3,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(40)
          make.left.right.inset(30)
        },
        views: [{
          type: "label",
          props: {
            text: "邮箱",
            align: $align.center,
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.width.equalTo(70)
            make.left.inset(0)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.left.equalTo(view.prev.right)
            make.width.equalTo(1 / $device.info.screen.scale)
            make.top.bottom.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var height = view.frame.height
              ctx.strokeColor = $color("darkGray")
              ctx.setLineWidth(1)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(0, height)
              ctx.strokePath()
            }
          }
        },{
          type: "input",
          props: {
            id: "emailInput",
            text: utils.getCache("loginHistory", ""),
            type: $kbType.email,
            bgcolor: $color("white"),
            font: $font(15),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right)
            make.right.inset(0)
          },
          events: {
            didBeginEditing: function(sender) {
              $("emailInputError").text = ""
            },
            didEndEditing: function(sender) {
              checkLoginAll()
            },
            returned: function(sender) {
              $("passwordInput").focus()
            }
          }
        },{
          type: "label",
          props: {
            id: "emailInputError",
            text: "",
            align: $align.center,
            textColor: $color(utils.mColor.red),
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.right.inset(5)
          }
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          radius: 3,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(40)
          make.left.right.inset(30)
        },
        views: [{
          type: "label",
          props: {
            text: "密码",
            align: $align.center,
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.width.equalTo(70)
            make.left.inset(0)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.left.equalTo(view.prev.right)
            make.width.equalTo(1 / $device.info.screen.scale)
            make.top.bottom.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var height = view.frame.height
              ctx.strokeColor = $color("darkGray")
              ctx.setLineWidth(1)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(0, height)
              ctx.strokePath()
            }
          }
        },{
          type: "input",
          props: {
            id: "passwordInput",
            text: "",
            secure: true,
            bgcolor: $color("white"),
            font: $font(15),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right)
            make.right.inset(0)
          },
          events: {
            didBeginEditing: function(sender) {
              $("passwordInputError").text = ""
            },
            didEndEditing: function(sender) {
              checkLoginAll()
            },
            changed: function(sender) {
              checkLoginAll()
            },
            returned: function(sender) {
              sender.blur()
            }
          },
        },{
          type: "label",
          props: {
            id: "passwordInputError",
            text: "",
            align: $align.center,
            textColor: $color(utils.mColor.red),
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.right.inset(5)
          }
        },],
      },
      {
        type: "button",
        props: {
          id: "loginButton",
          title: "登录 >",
          bgcolor: $color(utils.mColor.gray),
          titleColor: $color("white"),
          radius: 3,
        },
        layout: function(make, view) {
          make.width.equalTo(90)
          make.centerX.equalTo(view.super)
          make.height.equalTo(45)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
        events: {
          tapped: function(sender) {
            if(checkLoginAll()) {
              $cache.set("loginHistory", $("emailInput").text);
              let json = {
                username : $("emailInput").text,
                password : $("passwordInput").text,
              }
              user.login(json, function(data) {
                user.saveUser(data)
                $ui.alert({
                  title: "登录成功",
                  message: "尊敬的 " + data.nickname + " ，欢迎您！",
                  actions: [{
                    title: "好的",
                    handler: function() {
                      $addin.restart()
                    }
                  }]
                })
              })
            }
          },
        }
      },
      {
        type: "button",
        props: {
          id: "forgetPWButton",
          title: " 忘记密码?",
          bgcolor: $color("clear"),
          titleColor: $color(utils.mColor.lightBlue),
          font: $font(13),
        },
        layout: function(make, view) {
          make.width.equalTo(90)
          make.centerX.equalTo(view.super)
          make.height.equalTo(30)
          make.top.equalTo(view.prev.bottom).inset(25)
        },
        events: {
          tapped: function(sender) {
            setupPasswordResetView("登录", $("emailInput").text)
          }
        },
      }]
  })
}

function setupPasswordResetView(source, email) {
  $ui.push({
    props: {
      id: "passwordResetView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.bgcolor,
    },
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
    views: [ui.genPageHeader(source, "密码重置"),
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          radius: 3,
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(40)
          make.left.right.inset(30)
        },
        views: [{
          type: "label",
          props: {
            text: "邮箱",
            align: $align.center,
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.width.equalTo(70)
            make.left.inset(0)
          }
        },{
          type: "canvas",
          layout: function(make, view) {
            make.left.equalTo(view.prev.right)
            make.width.equalTo(1 / $device.info.screen.scale)
            make.top.bottom.inset(0)
          },
          events: {
            draw: function(view, ctx) {
              var height = view.frame.height
              ctx.strokeColor = $color("darkGray")
              ctx.setLineWidth(1)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(0, height)
              ctx.strokePath()
            }
          }
        },{
          type: "input",
          props: {
            id: "pr_emailInput",
            text: (email)?email:"",
            type: $kbType.email,
            bgcolor: $color("white"),
            font: $font(15),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right)
            make.right.inset(0)
          },
          events: {
            didBeginEditing: function(sender) {
              $("emailInputError").text = ""
            },
            didEndEditing: function(sender) {
              checkPasswordResetAll()
            },
            returned: function(sender) {
              $("emailInput").blur()
            }
          }
        },{
          type: "label",
          props: {
            id: "pr_emailInputError",
            text: "",
            align: $align.center,
            textColor: $color(utils.mColor.red),
            font: $font(14),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
            make.right.inset(5)
          }
        },],
      },
      {
        type: "button",
        props: {
          id: "resetButton",
          title: "重置密码 >",
          bgcolor: $color(utils.mColor.gray),
          titleColor: $color("white"),
          radius: 3,
        },
        layout: function(make, view) {
          make.width.equalTo(110)
          make.centerX.equalTo(view.super)
          make.height.equalTo(45)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
        events: {
          tapped: function(sender) {
            if(checkPasswordResetAll()) {
              let json = {
                email : $("pr_emailInput").text,
              }
              user.passwordReset(json, function(data) {
                $ui.alert({
                  title: "发送成功",
                  message: "一封密码重置邮件已经发送至您的邮箱",
                  actions: [{
                    title: "好的",
                    handler: function() {
                      $ui.pop()
                    }
                  }]
                })
              })
            }
          },
        }
      },]
  })
  checkPasswordResetAll()
}

function isEmail(str){
  var re=/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
  if (re.test(str) != true) {
    return false;
  }else{
    return true;
  }
}

function checkLogUpAll() {
  let name = $("nameInput").text
  let password = $("passwordInput").text
  let passwordConfirm = $("passwordConfirmInput").text
  let email = $("emailInput").text
  if(name != "" && password != "" && passwordConfirm != "" && email != "" && password === passwordConfirm && isEmail(email) && password.length >= 4) {
    $("passwordInputError").text = ""
    $("passwordConfirmInputError").text = ""
    $("emailInputError").text = ""
    $("logUpButton").bgcolor = $color(utils.mColor.lightBlue)
    return true
  }
  if(password != "" && password.length < 4) {
    $("passwordInputError").text = "密码长度不得小于4位"
  }
  if(password != "" && passwordConfirm != "" && password != passwordConfirm) {
    $("passwordConfirmInputError").text = "两次密码不一致"
  }
  if(email != "" && !isEmail(email)) {
    $("emailInputError").text = "请输入正确邮箱"
  }
  $("logUpButton").bgcolor = $color(utils.mColor.gray)
  return false
}

function checkLoginAll() {
  let password = $("passwordInput").text
  let email = $("emailInput").text
  if(password != "" && email != "" && isEmail(email) && password.length >= 4) {
    $("passwordInputError").text = ""
    $("emailInputError").text = ""
    $("loginButton").bgcolor = $color(utils.mColor.lightBlue)
    return true
  }
  if(password != "" && password.length < 4) {
    $("passwordInputError").text = "密码长度不得小于4位"
  }
  if(email != "" && !isEmail(email)) {
    $("emailInputError").text = "请输入正确邮箱"
  }
  $("loginButton").bgcolor = $color(utils.mColor.gray)
  return false
}

function checkPasswordResetAll() {
  let email = $("pr_emailInput").text
  if(email != "" && isEmail(email)) {
    $("pr_emailInputError").text = ""
    $("resetButton").bgcolor = $color(utils.mColor.lightBlue)
    return true
  }
  if(email != "" && !isEmail(email)) {
    $("pr_emailInputError").text = "请输入正确邮箱"
  }
  $("resetButton").bgcolor = $color(utils.mColor.gray)
  return false
}

module.exports = {
  setupLogUpView: setupLogUpView,
  setupLoginView: setupLoginView,
}