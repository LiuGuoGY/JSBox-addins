let utils = require('scripts/utils')
let groups = require('scripts/groups')
let request = require('scripts/request')
let widget = require("scripts/widget")
let ui = require('scripts/ui')

const query = $context.query;

function shortNumber(num) {
  if (num > 100000000) {
    return Math.floor(num / 100000000) + "亿"
  }
  if (num > 10000) {
    return Math.floor(num / 10000) + "万"
  }
  return num + ""
}

function showView() {
  $ui.render({
    props: {
      id: "main",
      title: "热搜",
      navButtons: [
        {
          icon: "002", // Or you can use icon name
          handler: function () {
            setupSetting()
          }
        }
      ]
    },
    views: [{
      type: "spinner",
      props: {
        id: "spinner",
        loading: true
      },
      layout: function (make, view) {
        make.center.equalTo(view.super)
      }
    }]
  })
}

function setupWebView(title, url) {
  $ui.push({
    props: {
      title: title,
      navButtons: [
        {
          symbol: "ellipsis",
          menu: {
            pullDown: true,
            asPrimary: true,
            items: [
              {
                title: "复制链接",
                symbol: "link",
                handler: sender => {
                  $clipboard.text = $("webView").url;
                  ui.showToastView($("webView"), $color(utils.mColor.green), "复制成功！");
                }
              },
              {
                title: "分享到",
                symbol: "arrowshape.turn.up.right",
                inline: true,
                items: [
                  {
                    title: "分享链接",
                    symbol: "square.and.arrow.up",
                    handler: sender => {
                      $share.sheet($("webView").url);
                    }
                  },
                  {
                    title: "分享截图",
                    symbol: "crop",
                    handler: sender => {
                      $share.sheet($("webView").snapshot);
                    },
                  }
                ]
              },
              {
                title: "用其他应用打开",
                symbol: "doc.text.magnifyingglass",
                items: [
                  {
                    title: "Safari",
                    symbol: "safari",
                    handler: sender => {
                      $app.openURL(url);
                    }
                  },
                  {
                    title: "微博",
                    handler: sender => {
                      $app.openURL("sinaweibo://searchall?q=" + encodeURIComponent("#" + title + "#"));
                    }
                  },
                  {
                    title: "微博国际版",
                    handler: sender => {
                      $app.openURL("weibointernational://searchall?q=" + encodeURIComponent("#" + title + "#"));
                    }
                  },
                  {
                    title: "墨客",
                    handler: sender => {
                      $app.openURL("moke:///search/statuses?query=" + encodeURIComponent("#" + title + "#"));
                    }
                  }
                ]
              },
            ]
          }
        }
      ]
    },
    views: [{
      type: "web",
      props: {
        id: "webView",
        url: url,
        transparent: true,
        allowsLinkPreview: false,
        script: function () {
          let systemGray = "#8e8e93"; //light: #8e8e93
          let systemGray2 = "#636366"; //light: #aeaeb2
          let systemGray3 = "#48484a"; //light: #c7c7cc
          let systemGray4 = "#3a3a3c"; //light: #d1d1d6
          let systemGray5 = "#2c2c2e"; //light: #e5e5ea
          let systemGray6 = "#1c1c1e"; //light: #f2f2f7

          let colorLabel = "#f0f0f0";            //light: #000000
          let colorSecondaryLabel = "#989899";    //light: #8a8a8e
          let colorTertiaryLabel = "#5a5a5e";     //light: #c4c4c6
          let colorQuaternaryLabel = "#404044";   //light: #dcdcdd

          let colorBlue = "#1E88E5";
          //暗色模式
          let domStyle = document.createElement('style');
          domStyle.innerText = `

          /*小程序广告*/
          .wrap[data-v-2ee6444e] {
            display: none;
          }

          /*禁止文字选中，模拟app体验*/
          * {
            moz-user-select: -moz-none; 
            -moz-user-select: none; 
            -o-user-select: none; 
            -khtml-user-select: none; 
            -webkit-user-select: none; 
            -ms-user-select: none; 
            user-select: none;
          }

          /*关闭发表评论*/
          .lite-page-editor {
            display: none;
          }

          /*关闭搜索栏*/
          .ntop-nav {
            display: none;
          }

          /*关闭底部导航*/
          .m-tab-bar {
            display: none;
          }

          /*禁止顶部标题点击*/
          .no-bg[data-v-390314fb] {
            pointer-events: none;
          }

          /*禁止导语点击*/
          .card7 article {
            pointer-events: none;
          }

          /*优化垃圾的菜单悬停卡顿*/
          .m-top-nav-wrapper[data-v-76f2e89e] {
            height: 3.3125rem;
          }
          
          @media (prefers-color-scheme: dark) {
            html {
              background: ${systemGray6};
            }
            .ntop-nav {
              background: #000;
            }
            .m-panel {
              border-color: ${systemGray5};
              background: #000;
            }
            .m-top-nav {
              background: #000;
            }
            .m-top-nav .nav-main::before {
              background: #000;
            }
            .nt-sbox[data-v-bf3ded56] {
              background: ${systemGray6};
            }
            .m-bar-panel {
              background: #0c0c0c;
              box-shadow: inset 0 1px 0 0 #000, 0 -2px 2px -1px rgb(0 0 0 / 15%);
            }
            .card9 .card.m-panel {
              background-color: ${systemGray6};
              border-color: #0f0f0f;
            }
            .m-line-gradient {
              background-color: ${systemGray5};
              -webkit-mask: -webkit-linear-gradient(top,transparent,#fff 30%,#fff 70%,transparent 100%);
            }

            .card9 .weibo-main .weibo-og {
              color: ${colorLabel};
            }
            .card9 .weibo-main a {
              color: ${colorBlue};
            }
            .nt-search input[data-v-bf3ded56] {
              color: #cccccc;
            }
            .no-bg .npg-wz h4.firsth[data-v-390314fb] {
              color: ${colorLabel};
            }
            .m-top-nav .nav-item li.m-cur span {
              color: ${colorLabel};
            }
            .m-top-nav .nav-item li {
              color: #6c6c6c;
            }
            footer.m-ctrl-box {
              border-color: ${systemGray5};
            }
            .m-top-nav {
              border-bottom: solid 1px ${systemGray6};
            }
            .iosx2 .m-top-nav {
              border-bottom: .5px solid ${systemGray6};
            }
            .iosx3 .m-top-nav {
              border-bottom: .36px solid ${systemGray6};
            }
            .card9 .card-title {
              border-color: ${systemGray5};
            }
            .card7 article {
              color: ${colorLabel};
            }
            .no-bg .npg-wz[data-v-390314fb] {
              color: #8E8E94;
            }
            .m-text-box h3 {
              color: ${colorLabel};
            }

            /*图片降低亮度*/
            img {
              filter: brightness(0.8);
            }

            /*话题页下方更多*/
            .m-pop.m-pop-s ul {
              background: #000;
            }
            .m-pop.m-pop-s ul,.m-pop.m-pop-s:after {
              background: #000;
            }
            .m-pop.m-pop-s li+li {
              border-top: 1px solid ${systemGray5} !important;
            }
            .m-tab-bar .m-ctrl-box .m-diy-btn .toolbar_menu_list li h4 {
              color: ${colorLabel};
            }
            .m-pop.m-pop-s {
              border: 1px solid ${systemGray6} !important;
              -webkit-filter: drop-shadow(0 1px 1px rgba(255, 255, 255, .2));
            }

            /* 点击 */
            .m-active {
              background-color: ${systemGray5} !important;
            }

            /* 微博正文标题栏 */
            .lite-topbar {
              border-color: ${systemGray5};
              background-color: ${systemGray6};
            }
            .lite-page-top .nav-main {
              color: ${colorLabel};
            }
            .lite-page-top .m-font {
              color: ${colorLabel};
            }

            /* 微博正文 */
            .f-weibo.card9 {
              border-bottom: 1px solid ${systemGray5};
            }
            .iosx2 .f-weibo.card9 {
              border-bottom: 1px solid ${systemGray5};
            }
            .iosx3 .f-weibo.card9 {
              border-bottom: 1px solid ${systemGray5};
            }

            /* 转发评论赞 */
            .lite-page-tab {
              background: #000;
              box-shadow: 0 1px 0 0 ${systemGray5};
            }
            .lite-page-tab .cur {
              color: ${colorSecondaryLabel};
            }
            .lite-page-tab {
              color: ${colorTertiaryLabel};
            }

            /* 评论列表 */
            .comment-content {
              background-color: #000 !important;
            }
            .lite-msg, .lite-page-list {
              background: #000;
            }
            .lite-msg .m-text-box h4, .lite-page-list .m-text-box h4 {
              color: ${colorLabel};
            }
            .lite-line {
              border-color: ${systemGray5};
            }
            .m-tips-tp {
              color: ${systemGray};
              background: #000;
            }
            a {
              color: ${colorBlue};
            }

            /* 发表评论 */
            .lite-page-editor {
              background: #000;
            }

            /* 正文更多 */
            .m-wpbtn-lbox {
              background: ${systemGray4};
            }
            .m-wpbtn-list {
              background-color: #000;
            }
            .m-wpbtn-list li a {
              color: ${colorLabel};
            }
            .m-wpbtn-list li {
              border-bottom: 1px solid ${systemGray5};
            }

            /* 编辑记录 */
            .m-top-bar .nav-main {
              color: ${colorLabel};
            }
          }
          `
          document.head.appendChild(domStyle);

          //屏蔽微博登录
          var script = document.createElement('script');
          script.src = "https://unpkg.com/ajax-hook@2.0.9/dist/ajaxhook.min.js";
          document.getElementsByTagName('head')[0].appendChild(script);

          var timer = setInterval(function () {
            if (ah) {
              clearInterval(timer);
              ah.proxy({
                //请求发起前进入
                onRequest: (config, handler) => {
                  console.log(config.url)
                  handler.next(config);
                },
                //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
                onError: (err, handler) => {
                  // console.log(err.type)
                  handler.next(err)
                },
                //请求成功后进入
                onResponse: (response, handler) => {
                  console.log(response.response)
                  var resp = JSON.parse(response.response);
                  if (resp.ok == -100) {
                    $notify("login", { "key": "value" })
                    resp.ok = 1;
                    resp.data = {
                      status: {
                        comment_manage_info: {
                          comment_permission_type: -1,
                          approval_comment_type: 0,
                          comment_sort_type: 0
                        }
                      },
                      data: [],
                      total_number: 0,
                      max_id: 0,
                      max: 89,
                      max_id_type: 0,
                    };
                    resp.url = "";
                    response.response = JSON.stringify(resp);
                  }
                  handler.next(response);
                }
              })
            }
          }, 1000)
        }
      },
      layout: function (make, view) {
        make.center.equalTo(view.super)
        make.top.left.right.bottom.inset(0)
      },
      events: {
        decideNavigation: function (sender, action) {
          // $console.info("decideNavigation", action.requestURL);
          // if (action.requestURL.indexOf("m.weibo.cn/login") >= 0) {
          //   return false
          // }
          return true
        },
        didReceiveServerRedirect: function (sender, navigation) {
          // $console.info("didReceiveServerRedirect", navigation);
        },
        didSendRequest: function (request) {
          // $console.info("didSendRequest", request);
          // if(request.url.match(/login\?/)) {
          //   $ui.alert("请先登录微博");
          // }
        },
        login: function (object) {
          ui.showToastView($("webView"), $color("#F1C40F"), "已拦截登录请求！");
        }
      }
    }]
  })
}

async function show() {
  showView();
  if (query && query.title && query.url) {
    setupWebView(query.title, query.url);
    console.log(query.url)
  }
  //测试
  //setupWebView("", "https://m.weibo.cn/search?containerid=231522type%3D1%26q%3D%23%E6%97%A5%E6%9C%AC%E7%96%91%E4%BC%BC%E5%87%BA%E7%8E%B0%E9%A6%96%E4%BE%8B%E5%84%BF%E7%AB%A5%E4%B8%8D%E6%98%8E%E5%8E%9F%E5%9B%A0%E6%80%A5%E6%80%A7%E8%82%9D%E7%82%8E%E7%97%85%E4%BE%8B%23");
  
  let weiboHotData = await request.getWeiboHot();
  let listData = solveWeiboHotData(weiboHotData.data);
  $("main").add({
    type: "list",
    props: {
      id: "list",
      rowHeight: 35,
      separatorInset: $insets(0, 40, 0, 10),
      header: {
        type: "view",
        props: {
          height: 140,
        },
        layout: function (make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo(view.super)
        },
        views: [{
          type: "image",
          props: {
            src: "assets/cover.jpeg",
          },
          layout: function (make, view) {
            make.centerX.equalTo(view.super)
            make.height.equalTo(130)
            make.width.equalTo(view.super)
            make.top.inset(0)
          }
        }]
      },
      footer: {
        type: "view",
        props: {
          height: 80,
        },
      },
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
          layout: function (make, view) {
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(20, 20))
            make.left.inset(10)
          }
        }, {
          type: "label",
          props: {
            id: "hot",
            text: "",
            font: $font(10),
            align: $align.center,
          },
          layout: function (make, view) {
            make.centerY.equalTo(view.super)
            make.right.inset(10)
            make.height.equalTo(view.super)
            make.width.equalTo(40)
          }
        }, {
          type: "label",
          props: {
            id: "text",
            text: "",
            font: $font(15),
            align: $align.left,
            lines: 0,
          },
          layout: function (make, view) {
            make.centerY.equalTo(view.super)
            make.left.equalTo(view.prev.prev.right).inset(10)
            make.right.equalTo(view.prev.left).inset(10)
            make.height.equalTo(view.super)
          }
        }]
      },
      data: listData,
    },
    layout: $layout.fill,
    events: {
      didSelect: function (sender, indexPath, data) {
        setupWebView(data.text.text, data.text.info);
      },
      pulled: async function (sender) {
        await updateWeiboHotData();
        $("list").endRefreshing();
      }
    },
  })
  $("spinner").stop();
}

function solveWeiboHotData(data) {
  let len = data.length;
  let listData = []
  for (let i = 0; i < len; i++) {
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
        text: data[i].title,
        info: "https://s.weibo.com/weibo?q=" + encodeURIComponent(data[i].scheme.match(/search\?keyword=(.*)/)[1]), // + "&Refer=index"
      },
      hot: {
        text: shortNumber(data[i].number),
      }
    })
  }
  return listData;
}

async function updateWeiboHotData() {
  let hotData = await request.getWeiboHot();
  if ($("list")) {
    $("list").data = solveWeiboHotData(hotData.data);
  }
}

function setupSetting() {
  const image = $image("assets/公众号.png");
  $ui.push({
    props: {
      id: "settingView",
      title: "设置",
      navButtons: []
    },
    views: [{
      type: "list",
      props: {
        id: "list",
        footer: {
          type: "view",
          props: {
            height: 80,
          },
          views: [{
            type: "image",
            props: {
              src: (utils.getThemeMode() == "light") ? "assets/wx_footer_signoff@2x.png" : "assets/wx_footer_signoff_dark@2x.png",
              contentMode: $contentMode.scaleAspectFit,
            },
            layout: function (make, view) {
              make.center.equalTo(view.super)
              make.width.equalTo(70)
              make.height.equalTo(18)
            },
            events: {
              tapped: function (sender) {
                $quicklook.open({
                  type: "jpg",
                  data: $file.read("assets/公众号.jpg"),
                })
              }
            }
          }, {
            type: "label",
            props: {
              text: "本脚本由",
              textColor: $color("gray"),
              align: $align.center,
              font: $font(13)
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.super)
              make.right.equalTo(view.prev.left).inset(10)
            }
          }, {
            type: "label",
            props: {
              text: "强力驱动",
              textColor: $color("gray"),
              align: $align.center,
              font: $font(13)
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.super)
              make.left.equalTo(view.prev.prev.right).inset(3)
            }
          }],
        },
        data: groups.init({
          groups: [{
            title: "小组件",
            items: [{
              type: "arrow",
              title: "桌面小组件",
              symbol: "rectangle.grid.2x2.fill",
              iconColor: utils.systemColor("pink"),
              handler: () => {
                widget.show()
              }
            }]
          },]
        })
      },
      layout: function (make, view) {
        make.center.equalTo(view.super)
        make.height.equalTo(view.super)
        make.width.equalTo(view.super)
      },
    }]
  })
}

module.exports = {
  show: show
}