let ui = require('scripts/ui')
let utils = require('scripts/utils')
let hsv = require('scripts/hsv')
let api = require('scripts/api')
let user = require('scripts/user')

function setupUploadView(updateApp) {
  let myApp = {}
  let previewsPrev = []
  if(updateApp) {
    $cache.remove("unfinishData");
    if($file.exists("assets/temp")) {
      $file.delete("assets/temp/")
    }
    myApp = updateApp
    myApp.file = ""
    myApp.buildVersion ++;
  } else {
    myApp = utils.getCache("unfinishData")
    if(!myApp) {
      myApp = {
        file: "",
        appName: "未定义",
        subtitle: "",
        appIcon: "erots://icon?code=008&color=FF0000&mode=0",
        appCate: "未分类",
        appVersion: "",
        buildVersion: 1,
        instruction: "",
        versionInst: "",
        previews: [],
      }
    }
    $cache.set("unfinishData", myApp)
  }
  setPreviewPre()

  let iconColor = utils.getSearchJson(myApp.appIcon).color
  if(!iconColor) {
    iconColor = "FF0000"
  }
  let actionText = "  开始上传  "

  function setPreviewPre() {
    if(myApp.previews) {
      previewsPrev = []
      for(let i = 0; i < myApp.previews.length; i++) {
        previewsPrev.push(myApp.previews[i])
      }
    }
  }
  function refreshPreview() {
    $("preView").views[0].views[0].remove()
    $("topPreView").views[0].views[0].remove()
    if(myApp.subtitle.length > 0) {
      $("preView").views[0].add(ui.genAppShowView(myApp.appIcon, myApp.appName, myApp.subtitle, (updateApp)?"更新":"下载", ()=>{}))
      $("topPreView").views[0].add(ui.genAppShowView(myApp.appIcon, myApp.appName, myApp.subtitle, (updateApp)?"更新":"下载", ()=>{}))
    } else {
      $("preView").views[0].add(ui.genAppShowView(myApp.appIcon, myApp.appName, myApp.appCate, (updateApp)?"更新":"下载", ()=>{}))
      $("topPreView").views[0].add(ui.genAppShowView(myApp.appIcon, myApp.appName, myApp.appCate, (updateApp)?"更新":"下载", ()=>{}))
    }
    if(myApp.previews.length >= 0 && previewsPrev.length !== myApp.previews.length) {
      if($("appPreviewPhotosScroll")) {
        $("appPreviewPhotosScroll").remove()
      }
      $("appPreviewPhotosScrollParent").add({
        type: "scroll",
        props: {
          id: "appPreviewPhotosScroll",
          contentSize: $size((0 + 1)*100, 260),
          alwaysBounceHorizontal: true,
          alwaysBounceVertical: false,
          userInteractionEnabled: true,
          showsHorizontalIndicator: false,
          showsVerticalIndicator: false,
        },
        layout: function(make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo(view.super)
        },
        views: ui.genAppPreviewPhotosView(myApp.previews, function(i) {
          $ui.menu({
            items: ["删除"],
            handler: function(title, idx) {
              if(idx == 0) {
                myApp.previews.splice(i, 1)
                refreshPreview()
              }
            }
          });
        }),
      })
      $("appPreviewPhotosScroll").resize()
      $("appPreviewPhotosScroll").contentSize = $size($("appPreviewPhotosScroll").contentSize.width + 20, 0)
      setPreviewPre()
    }
    if(!updateApp) {
      $cache.set("unfinishData", myApp)
    }
  }

  $ui.push({
    props: {
      id: "uploadItemView",
      navBarHidden: true,
      statusBarStyle: 0,
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
    views: [ui.genPageHeader("主页", "上传"),
    {
      type: "scroll",
      props: {
        id: "uploadScroll",
        bgcolor: $color("#F9F9F8"),
        showsVerticalIndicator: true,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.width.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.safeAreaBottom)
        } else {
          make.bottom.inset(0)
        }
      },
      events: {
        didScroll: function(sender) {
          let topView = $("topPreView")
          if(sender.contentOffset.y > 40 && topView.hidden == true) {
            topView.hidden = false
            $("preView").hidden = true
          } else if(sender.contentOffset.y <= 40 && topView.hidden == false) {
            topView.hidden = true
            $("preView").hidden = false
          }
          if(sender.contentOffset.y > 750 && topView.alpha > 0) {
            $ui.animate({
              duration: 0.4,
              animation: function() {
                topView.alpha = 0
              },
            })
          } else if(sender.contentOffset.y < 750 && topView.alpha == 0) {
            $ui.animate({
              duration: 0.4,
              animation: function() {
                topView.alpha = 1
              },
            })
          }
        }
      },
      views: [{
        type: "label",
        props: {
          id: "previewLabel",
          text: "预览",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          id: "preView",
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.left.right.inset(0)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(80)
          make.centerX.equalTo(view.super)
        },
        views: [{
          type: "view",
          layout: function(make, view) {
            make.left.right.inset(20)
            make.height.equalTo(view.super)
            make.center.equalTo(view.super)
          },
          views: [ui.genAppShowView(myApp.appIcon, myApp.appName, "", (updateApp)?"更新":"下载", ()=>{})]
        }],
      },
      {
        type: "label",
        props: {
          id: "descriptLabel",
          text: "参数",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "fileLabel",
            text: "文件",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(50)
          }
        },{
          type: "button",
          props: {
            id: "chooseFileButton",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            tapped: function(sender) {
              let addins = $addin.list
              let addinNames = []
              for(let i = 0; i < addins.length; i++) {
                addinNames.push(addins[i].name)
              }
              $ui.menu({
                items: addinNames,
                handler: function(title, idx) {
                  if(!$file.exists("assets/temp")) {
                    $file.mkdir("assets/temp")
                  }
                  if(title.indexOf(".js") >= 0) {
                    if(!updateApp) {
                      myApp.appName = title.substr(0, title.length - 3)
                      myApp.appIcon = setUrlPara(myApp.appIcon, utils.getNum(addins[idx].icon))
                    }
                    $("titleInput").text = myApp.appName
                    $("chooseFileButtonDetail").text = "已选择 " + title.substr(0, title.length - 3)
                    let path = "assets/temp/" + title
                    if($file.exists(path)) {
                      $file.delete(path)
                    }
                    $file.write({
                      data: addins[idx].data,
                      path: path,
                    })
                    myApp.file = path
                    refreshPreview()
                  } else {
                    if(!updateApp) {
                      myApp.appName = title
                    }
                    let path = "assets/temp/box"
                    if($file.exists(path)) {
                      $file.delete(path)
                    }
                    $file.mkdir(path)
                    $archiver.unzip({
                      file: addins[idx].data,
                      dest: path,
                      handler: function(success) {
                        if(success) {
                          myApp.file = path
                          let file = $file.read(path + "/assets/icon.png")
                          let iconPath = "assets/temp/temp.png"
                          $file.write({
                            data: cutIcon(file.image, true).png,
                            path: iconPath,
                          })
                          if(!updateApp) {
                            myApp.appIcon = iconPath
                          }
                          $("titleInput").text = myApp.appName
                          $("chooseFileButtonDetail").text = "已选择 " + title
                          refreshPreview()
                        }
                      }
                    });
                  }
                }
              })
            }
          },
          views: [{
            type: "image",
            props: {
              src: "assets/enter.png",
              bgcolor: $color("clear"),
            },
            layout: function(make, view) {
              make.right.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(8, 18))
            },
          },{
            type: "label",
            props: {
              id: "chooseFileButtonDetail",
              text: (!myApp.file)?"选择脚本":("已选择 " + myApp.appName),
              font: $font(15),
              align: $align.right,
              textColor: $color("lightGray"),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(view.super)
              make.left.inset(0)
              make.right.equalTo(view.prev.left).inset(10)
            }
          }]
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "titleLabel",
            text: "名称",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(40)
          }
        },{
          type: "input",
          props: {
            id: "titleInput",
            bgcolor: $color("white"),
            radius: 0,
            text: myApp.appName,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            changed: function(sender) {
              
            },
            returned: function(sender) {
              sender.blur()
            },
            didEndEditing: function(sender) {
              myApp.appName = sender.text
              refreshPreview()
            }
          }
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "cateLabel",
            text: "分类",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(50)
          }
        },{
          type: "button",
          props: {
            id: "chooseCateButton",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            tapped: function(sender) {
              $ui.menu({
                items: utils.appCates,
                handler: function(title, idx) {
                  myApp.appCate = title
                  $("chooseCateButtonDetail").text = "已选择 " + myApp.appCate
                  refreshPreview()
                }
              })
            }
          },
          views: [{
            type: "image",
            props: {
              src: "assets/enter.png",
              bgcolor: $color("clear"),
            },
            layout: function(make, view) {
              make.right.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(8, 18))
            },
          },{
            type: "label",
            props: {
              id: "chooseCateButtonDetail",
              text: (myApp.appCate == "未分类")?"选择分类":("已选择 " + myApp.appCate),
              font: $font(15),
              align: $align.right,
              textColor: $color("lightGray"),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(view.super)
              make.left.inset(0)
              make.right.equalTo(view.prev.left).inset(10)
            }
          }]
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "versionLabel",
            text: "版本号",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(60)
          }
        },{
          type: "input",
          props: {
            id: "versionInput",
            bgcolor: $color("white"),
            radius: 0,
            type: $kbType.decimal,
            text: myApp.appVersion,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            returned: function(sender) {
              sender.blur()
            },
            didEndEditing: function(sender) {
              myApp.appVersion = sender.text
              refreshPreview()
            }
          }
        },],
      },
      {
        type: "label",
        props: {
          id: "descriptLabel",
          text: "自定义图标",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "iconLabel",
            text: "图标",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(50)
          }
        },{
          type: "button",
          props: {
            id: "chooseIconButton",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            tapped: function(sender) {
              $ui.menu({
                items: ["内置图标库", "照片图库"],
                handler: function(title, idx) {
                  switch(idx) {
                    case 0: {
                      ui.selectIcon(function(text){
                        myApp.appIcon = setUrlPara(myApp.appIcon, text)
                        refreshPreview()
                      })
                    };break;
                    case 1: {
                      $photo.pick({
                        format: "data",
                        handler: function(resp) {
                          if(resp.data != undefined) {
                            let mimeType = resp.data.info.mimeType
                            let cutedIcon = cutIcon(resp.data.image)
                            if(!$file.exists("assets/temp")) {
                              $file.mkdir("assets/temp")
                            }
                            if (mimeType.indexOf("png") >= 0) {
                              let path = "assets/temp/temp.png"
                              $file.write({
                                data: cutedIcon.png,
                                path: path,
                              })
                              myApp.appIcon = path
                            } else {
                              let path = "assets/temp/temp.jpg"
                              $file.write({
                                data: cutedIcon.jpg(1.0),
                                path: path,
                              })
                              myApp.appIcon = path
                            }
                            refreshPreview()
                          }
                        }
                      })
                    };break;
                  }
                }
              })
            }
          },
          views: [{
            type: "image",
            props: {
              src: "assets/enter.png",
              bgcolor: $color("clear"),
            },
            layout: function(make, view) {
              make.right.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(8, 18))
            },
          },{
            type: "label",
            props: {
              text: "选择图标",
              font: $font(15),
              align: $align.right,
              textColor: $color("lightGray"),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(view.super)
              make.left.inset(0)
              make.right.equalTo(view.prev.left).inset(10)
            }
          }]
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "iconModeLabel",
            text: "样式",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(80)
          }
        },{
          type: "button",
          props: {
            id: "chooseModeButton",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            tapped: function(sender) {
              $ui.menu({
                items: ["白底彩标", "彩底白标"],
                handler: function(title, idx) {
                  if(myApp.appIcon.startsWith("erots")) {
                    switch(idx) {
                      case 0: {
                        myApp.appIcon = setUrlPara(myApp.appIcon, undefined, undefined, "0") 
                      };break;
                      case 1: {
                        myApp.appIcon = setUrlPara(myApp.appIcon, undefined, undefined, "1") 
                      };break;
                    }
                    refreshPreview()
                  }
                }
              })
            }
          },
          views: [{
            type: "image",
            props: {
              src: "assets/enter.png",
              bgcolor: $color("clear"),
            },
            layout: function(make, view) {
              make.right.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(8, 18))
            },
          },{
            type: "label",
            props: {
              text: "选择样式",
              font: $font(15),
              align: $align.right,
              textColor: $color("lightGray"),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(view.super)
              make.left.inset(0)
              make.right.equalTo(view.prev.left).inset(10)
            }
          }]
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(200)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "hex_v",
            text: "#" + iconColor,
            font: $font("bold", 18)
          },
          layout: function(make, view) {
            make.top.equalTo(view.super).inset(10)
            make.centerX.equalTo(view.super)
          },
        },{
          type: "view",
          props: {
            bgcolor: $color("white"),
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.height.equalTo(140)
            make.width.equalTo(view.super)
          },
          views: [hsv.genHSVView(iconColor, function(hex) {
            if(myApp.appIcon.startsWith("erots")) {
              myApp.appIcon = setUrlPara(myApp.appIcon, undefined, hex)
              refreshPreview()
            }
          })],
        },{
          type: "label",
          props: {
            text: "调色工具由 Palette ©Zigma 提供",
            font: $font(11),
            align: $align.center,
            textColor: $color("lightGray"),
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super)
            make.bottom.inset(10)
          }
        }],
      },
      {
        type: "label",
        props: {
          id: "descriptLabel",
          text: "附加（可选）",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "subtitleLabel",
            text: "副标题",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(60)
          }
        },{
          type: "input",
          props: {
            id: "subtitleInput",
            bgcolor: $color("white"),
            radius: 0,
            text: myApp.subtitle,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            returned: function(sender) {
              sender.blur()
            },
            didEndEditing: function(sender) {
              myApp.subtitle = sender.text
              refreshPreview()
            }
          }
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(330)
          make.left.right.inset(0)
        },
        views: [{
          type: "view",
          props: {
            bgcolor: $color("white"),
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super)
            make.top.inset(0)
            make.height.equalTo(50)
            make.left.right.inset(0)
          },
          views: [{
            type: "label",
            props: {
              text: "预览图",
              align: $align.left,
              font: $font(16),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(20)
              make.left.inset(15)
              make.width.equalTo(100)
            }
          },{
            type: "button",
            props: {
              bgcolor: $color("clear"),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(32)
              make.left.equalTo(view.prev.right)
              make.right.inset(15)
            },
            events: {
              tapped: async function(sender) {
                let resp = await $photo.pick({
                  mediaTypes: [$mediaType.image],
                  format: 'data',
                })
                if(resp.status) {
                  let path = "assets/temp/previews/"
                  if(!$file.exists(path)) {
                    $file.mkdir(path)
                  }
                  if(resp.metadata.UIImagePickerControllerMediaType.indexOf("movie") >= 0) {
      
                  } else {
                    let data = undefined
                    if(resp.data.info.mimeType.indexOf("png") >= 0) {
                      data = resp.data.image.png
                    } else if(resp.data.info.mimeType.indexOf("jpeg") >= 0){
                      data = resp.data.image.jpg(1.0)
                    } else if(resp.data.info.mimeType.length == 0) {
                      ui.showToastView($("uploadItemView"), utils.mColor.red, "不支持拍摄的照片");
                      return 0;
                    }
                    let filePath = path + resp.data.fileName
                    $file.write({
                      data: data,
                      path: filePath,
                    })
                    myApp.previews.push(filePath)
                    refreshPreview()
                  }
                }
              }
            },
            views: [{
              type: "image",
              props: {
                src: "assets/enter.png",
                bgcolor: $color("clear"),
              },
              layout: function(make, view) {
                make.right.inset(0)
                make.centerY.equalTo(view.super)
                make.size.equalTo($size(8, 18))
              },
            },{
              type: "label",
              props: {
                text: "添加图片",
                font: $font(15),
                align: $align.right,
                textColor: $color("lightGray"),
              },
              layout: function(make, view) {
                make.centerY.equalTo(view.super)
                make.height.equalTo(view.super)
                make.left.inset(0)
                make.right.equalTo(view.prev.left).inset(10)
              }
            }]
          },],
        },{
          type: "view",
          props: {
            id: "appPreviewPhotosScrollParent",
            bgcolor: $color("white"),
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super)
            make.top.equalTo(view.prev.bottom)
            make.bottom.inset(20)
            make.width.equalTo(view.super)
          },
          views: [{
            type: "scroll",
            props: {
              id: "appPreviewPhotosScroll",
              contentSize: $size((0 + 1)*100, 260),
              alwaysBounceHorizontal: true,
              alwaysBounceVertical: false,
              userInteractionEnabled: true,
              showsHorizontalIndicator: false,
              showsVerticalIndicator: false,
            },
            layout: function(make, view) {
              make.center.equalTo(view.super)
              make.size.equalTo(view.super)
            },
            views: ui.genAppPreviewPhotosView(myApp.previews, function(i) {
              $ui.menu({
                items: ["删除"],
                handler: function(title, idx) {
                  if(idx == 0) {
                    myApp.previews.splice(i, 1)
                    refreshPreview()
                  }
                }
              });
            }),
          },]
        },{
          type: "label",
          props: {
            text: "长按删除图片",
            align: $align.center,
            font: $font(11),
            textColor: $color("lightGray"),
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super)
            make.top.equalTo(view.prev.bottom)
            make.bottom.inset(5)
            make.width.equalTo(view.super)
          }
        }],
      },
      {
        type: "label",
        props: {
          id: "descriptLabel",
          text: "介绍",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(200)
          make.left.right.inset(0)
        },
        views: [{
          type: "text",
          props: {
            id: "descriptInput",
            text: myApp.instruction,
            bgcolor: $color("white"),
            radius: 0,
            font: $font(15),
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.top.bottom.inset(15)
            make.left.right.inset(15)
          },
          events: {
            didEndEditing: function(sender) {
              myApp.instruction = sender.text
              refreshPreview()
            }
          }
        },],
      },
      {
        type: "label",
        props: {
          id: "updateDesLabel",
          text: "新功能",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(200)
          make.left.right.inset(0)
        },
        views: [{
          type: "text",
          props: {
            id: "updateDesInput",
            text: myApp.versionInst,
            bgcolor: $color("white"),
            radius: 0,
            font: $font(15),
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.top.bottom.inset(15)
            make.left.right.inset(15)
          },
          events: {
            didEndEditing: function(sender) {
              myApp.versionInst = sender.text
              refreshPreview()
            }
          }
        },],
      },
      {
        type: "button",
        props: {
          id: "cloudButton",
          title: actionText,
          bgcolor: $color(utils.mColor.lightBlue),
          titleColor: $color("white"),
          circular: true,
          info: {isfinish: false}
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
          make.height.equalTo(45)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
        events: {
          tapped: async function(sender) {
            if(myApp.appName == "未定义" || myApp.appName == "" || myApp.file == "" || myApp.appCate == "未分类" || myApp.appCate == "" || myApp.appVersion == "" || myApp.instruction == "" || myApp.versionInst == "") {
              if(myApp.appName == "未定义" || myApp.appName == "") {
                ui.showToastView($("uploadItemView"), utils.mColor.red, "请填写应用名称");
              } else if(myApp.file == "") {
                ui.showToastView($("uploadItemView"), utils.mColor.red, "请选择应用文件");
              } else if(myApp.appCate == "未分类" || myApp.appCate == "") {
                ui.showToastView($("uploadItemView"), utils.mColor.red, "请选择分类");
              } else if(myApp.appVersion == "") {
                ui.showToastView($("uploadItemView"), utils.mColor.red, "请填写版本号");
              } else if(myApp.instruction == "") {
                ui.showToastView($("uploadItemView"), utils.mColor.red, "请填写应用介绍");
              } else if(myApp.versionInst == "") {
                ui.showToastView($("uploadItemView"), utils.mColor.red, "请填写新功能介绍");
              }
              return 0;
            }

            if($("uploadItemView")) {
              ui.addProgressView($("uploadItemView"))
            }

            let objectJson = (myApp.objectId)?{objectId: myApp.objectId}:await api.uploadApp(myApp);
            $console.info(objectJson);

            //修改脚本文件
            if(myApp.file.endsWith(".js")) {
              let file = $file.read(myApp.file)
              let position = file.string.indexOf("/**erots")
              let str = file.string
              if(position >= 0) {
                str = file.string.replace(/\/\*\*erots(.|\n)*?\*\/\n/, "")
                $console.info(str);
              }
              let newStr = "/**erots\nid: " + objectJson.objectId + "\nbuild: " + myApp.buildVersion + "\n*/\n" + str
              $file.write({
                data: $data({string: newStr}),
                path: myApp.file,
              })
            } else {
              let json = {
                id: objectJson.objectId,
                build: myApp.buildVersion,
              }
              let str = JSON.stringify(json, null, 2);
              let path = myApp.file + "/erots.json";
              if($file.exists(path)) {
                $file.delete(path);
              }
              $file.write({
                data: $data({string: str}),
                path: path,
              })
              path = "assets/temp/" + myApp.appName + ".box"
              let success = await $archiver.zip({
                directory: myApp.file,
                dest: path,
              })
              if(success) {
                myApp.file = path;
              } else {
                return 0
              }
            }

            if($("myProgress")) {
              $("myProgress").locations = [0.0, 0.1, 0.1]
            }
            if($("myProgressText")) {
              $("myProgressText").text = "上传应用文件..."
            }
            
            //上传脚本文件
            let file = $file.read(myApp.file);
            let fileUrl = await api.shimo_uploadFile(file);
            myApp.file = fileUrl;

            if($("myProgress")) {
              $("myProgress").locations = [0.0, 0.4, 0.4]
            }
            if($("myProgressText")) {
              $("myProgressText").text = "上传图标中..."
            }
            
            //上传图标
            if(!myApp.appIcon.startsWith("erots://") && !myApp.appIcon.startsWith("http")) {
              if(myApp.appIcon.endsWith("png")) {
                myApp.appIcon = await api.uploadSM($file.read(myApp.appIcon).image.png, "1.png")
              } else {
                myApp.appIcon = await api.uploadSM($file.read(myApp.appIcon).image.jpg(1.0), "1.jpg")
              }
            }

            if($("myProgress")) {
              $("myProgress").locations = [0.0, 0.5, 0.5]
            }


            //上传预览图片
            if(myApp.previews.length > 0) {
              let arrays = []
              for(let i = 0; i < myApp.previews.length; i++) {
                if(!myApp.previews[i].startsWith("http")) {
                  if($("myProgressText")) {
                    let p = i + 1
                    $("myProgressText").text = "上传预览图片...("+ p + "/" + myApp.previews.length + ")"
                  }
                  
                  if(myApp.previews[i].endsWith("png")) {
                    $console.info($file.read(myApp.previews[i]).image);
                    let url = await api.uploadSM($file.read(myApp.previews[i]).image.png, "1.png")
                    if(url) {
                      arrays.push(url);
                    }
                  } else {
                    let url = await api.uploadSM($file.read(myApp.previews[i]).image.jpg(1.0), "1.jpg")
                    if(url) {
                      arrays.push(url);
                    }
                  }
                } else {
                  arrays.push(myApp.previews[i])
                }
              }
              myApp.previews = arrays;
              $console.info(myApp.previews);
            }
            if($("myProgress")) {
              $("myProgress").locations = [0.0, 0.8, 0.8]
            }

            //加入作者信息
            let author = user.getLoginUser()
            myApp.author = author.nickname
            myApp.authorAccount = author.username

            //删除json中多余信息
            if(myApp.createdAt) {
              delete myApp.createdAt
              delete myApp.updatedAt
              delete myApp.ACL
              delete myApp.haveInstalled
              delete myApp.needUpdate
            }

            await api.putApp(objectJson.objectId, myApp)

            if($("myProgress")) {
              $("myProgress").locations = [0.0, 1, 1]
            }
            if($("myProgressText")) {
              $("myProgressText").text = "发布成功"
            }

            //清空所有缓存
            $cache.remove("unfinishData")
            if($file.exists("assets/temp")) {
              $file.delete("assets/temp/")
            }

            ui.showToastView($("uploadItemView"), utils.mColor.green, "发布成功");
            $app.notify({
              name: "refresh",
              object: {}
            });
            $delay(1, function() {
              $ui.pop();
            });
          }
        }
      },]
    },
    {
      type: "view",
      props: {
        id: "topPreView",
        bgcolor: $color("white"),
        hidden: true,
      },
      layout: function(make, view) {
        make.left.right.inset(0)
        make.top.equalTo(view.prev.prev.bottom)
        make.height.equalTo(80)
        make.centerX.equalTo(view.super)
      },
      views: [{
        type: "view",
        layout: function(make, view) {
          make.left.right.inset(20)
          make.height.equalTo(view.super)
          make.center.equalTo(view.super)
        },
        views: [ui.genAppShowView(myApp.appIcon, myApp.appName, "", (updateApp)?"更新":"下载", ()=>{})]
      },],
    },]
  })
  $("uploadScroll").resize()
  $("uploadScroll").contentSize = $size(0, $("uploadScroll").contentSize.height + 100)
  
  $("appPreviewPhotosScroll").resize()
  $("appPreviewPhotosScroll").contentSize = $size($("appPreviewPhotosScroll").contentSize.width + 20, 0)
  refreshPreview()
}

function cutIcon(image, small) {
  let canvasSize = 120
  let size = (small)?(canvasSize * 7 / 12):canvasSize
  let offset = (small)?(canvasSize * 5 / 24):0
  let canvas = $ui.create({
    type: "view",
    props: {
      bgcolor: $color("clear"),
      frame: $rect(0, 0, canvasSize, canvasSize)
    }
  });
  
  canvas.add({
    type: "image",
    props: {
      image: image,
      bgcolor: $color("clear"),
      frame: $rect(offset, offset, size, size)
    }
  })
  let snapshot = canvas.snapshot
  return snapshot
}

function setUrlPara(url, code, color, mode) {
  let json = utils.getSearchJson(url)
  if(code) {
    json.code = code
  }
  if(color) {
    json.color = color
  }
  if(mode) {
    json.mode = mode
  }
  if(!json.code) {
    json.code = "008"
  }
  if(!json.color) {
    json.color = "FF0000"
  }
  if(!json.mode) {
    json.mode = "0"
  }
  let newUrl = ("erots://icon?code=" + json.code + "&color=" + json.color + "&mode=" + json.mode)
  return newUrl
}

module.exports = {
  setupUploadView: setupUploadView,
}