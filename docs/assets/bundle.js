!
function() {
    "use strict";
    !
    function(e, n) {
        "object" === ("undefined" == typeof exports ? "undefined" : (void 0)(exports)) && "object" === ("undefined" == typeof module ? "undefined" : (void 0)(module)) ? module.exports = n(): "function" == typeof define && define.amd ? define([], n) : "object" === ("undefined" == typeof exports ? "undefined" : (void 0)(exports)) ? exports["@marcom/useragent-detect"] = n() : e["@marcom/useragent-detect"] = n()
    }("undefined" != typeof self ? self : void 0,
        function() {
            return function(e) {
                function n(t) {
                    if (o[t]) return o[t].exports;
                    var r = o[t] = {
                        i: t,
                        l: !1,
                        exports: {}
                    };
                    return e[t].call(r.exports, r, r.exports, n),
                        r.l = !0,
                        r.exports
                }
                var o = {};
                return n.m = e,
                    n.c = o,
                    n.d = function(e, o, t) {
                        n.o(e, o) || Object.defineProperty(e, o, {
                            configurable: !1,
                            enumerable: !0,
                            get: t
                        })
                    },
                    n.n = function(e) {
                        var o = e && e.__esModule ?
                            function() {
                                return e.
                                default
                            } :
                            function() {
                                return e
                            };
                        return n.d(o, "a", o),
                            o
                    },
                    n.o = function(e, n) {
                        return Object.prototype.hasOwnProperty.call(e, n)
                    },
                    n.p = "",
                    n(n.s = 0)
            }([function(e, n, o) {
                    var t = {
                        ua: window.navigator.userAgent,
                        platform: window.navigator.platform,
                        vendor: window.navigator.vendor
                    };
                    e.exports = o(1)(t)
                },
                function(e, n, o) {
                    function t(e) {
                        return new RegExp(e + "[a-zA-Z\\s/:]+([0-9_.]+)", "i")
                    }

                    function r(e, n) {
                        if ("function" == typeof e.parseVersion) return e.parseVersion(n);
                        var o = e.version || e.userAgent;
                        "string" == typeof o && (o = [o]);
                        for (var r, i = o.length,
                                s = 0; s < i; s++)
                            if ((r = n.match(t(o[s]))) && r.length > 1) return r[1].replace(/_/g, ".");
                        return !1
                    }

                    function i(e, n, o) {
                        for (var t, i, s = e.length,
                                a = 0; a < s; a++)
                            if ("function" == typeof e[a].test ? !0 === e[a].test(o) && (t = e[a].name) : o.ua.indexOf(e[a].userAgent) > -1 && (t = e[a].name), t) {
                                if (n[t] = !0, "string" == typeof(i = r(e[a], o.ua))) {
                                    var u = i.split(".");
                                    n.version.string = i,
                                        u && u.length > 0 && (n.version.major = parseInt(u[0] || 0), n.version.minor = parseInt(u[1] || 0), n.version.patch = parseInt(u[2] || 0))
                                } else "edge" === t && (n.version.string = "12.0.0", n.version.major = "12", n.version.minor = "0", n.version.patch = "0");
                                return "function" == typeof e[a].parseDocumentMode && (n.version.documentMode = e[a].parseDocumentMode()),
                                    n
                            }
                        return n
                    }

                    function s(e) {
                        var n = {};
                        return n.browser = i(u.browser, a.browser, e),
                            n.os = i(u.os, a.os, e),
                            n
                    }
                    var a = o(2),
                        u = o(3);
                    e.exports = s
                },
                function(e, n, o) {
                    e.exports = {
                        browser: {
                            safari: !1,
                            chrome: !1,
                            firefox: !1,
                            ie: !1,
                            opera: !1,
                            android: !1,
                            edge: !1,
                            version: {
                                string: "",
                                major: 0,
                                minor: 0,
                                patch: 0,
                                documentMode: !1
                            }
                        },
                        os: {
                            osx: !1,
                            ios: !1,
                            android: !1,
                            windows: !1,
                            linux: !1,
                            fireos: !1,
                            chromeos: !1,
                            version: {
                                string: "",
                                major: 0,
                                minor: 0,
                                patch: 0
                            }
                        }
                    }
                },
                function(e, n, o) {
                    e.exports = {
                        browser: [{
                                name: "edge",
                                userAgent: "Edge",
                                version: ["rv", "Edge"],
                                test: function(e) {
                                    return e.ua.indexOf("Edge") > -1 || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" === e.ua
                                }
                            },
                            {
                                name: "chrome",
                                userAgent: "Chrome"
                            },
                            {
                                name: "firefox",
                                test: function(e) {
                                    return e.ua.indexOf("Firefox") > -1 && -1 === e.ua.indexOf("Opera")
                                },
                                version: "Firefox"
                            },
                            {
                                name: "android",
                                userAgent: "Android"
                            },
                            {
                                name: "safari",
                                test: function(e) {
                                    return e.ua.indexOf("Safari") > -1 && e.vendor.indexOf("Apple") > -1
                                },
                                version: "Version"
                            },
                            {
                                name: "ie",
                                test: function(e) {
                                    return e.ua.indexOf("IE") > -1 || e.ua.indexOf("Trident") > -1
                                },
                                version: ["MSIE", "rv"],
                                parseDocumentMode: function() {
                                    var e = !1;
                                    return document.documentMode && (e = parseInt(document.documentMode, 10)),
                                        e
                                }
                            },
                            {
                                name: "opera",
                                userAgent: "Opera",
                                version: ["Version", "Opera"]
                            }
                        ],
                        os: [{
                                name: "windows",
                                test: function(e) {
                                    return e.ua.indexOf("Windows") > -1
                                },
                                version: "Windows NT"
                            },
                            {
                                name: "osx",
                                userAgent: "Mac",
                                test: function(e) {
                                    return e.ua.indexOf("Macintosh") > -1
                                }
                            },
                            {
                                name: "ios",
                                test: function(e) {
                                    return e.ua.indexOf("iPhone") > -1 || e.ua.indexOf("iPad") > -1
                                },
                                version: ["iPhone OS", "CPU OS"]
                            },
                            {
                                name: "linux",
                                userAgent: "Linux",
                                test: function(e) {
                                    return (e.ua.indexOf("Linux") > -1 || e.platform.indexOf("Linux") > -1) && -1 === e.ua.indexOf("Android")
                                }
                            },
                            {
                                name: "fireos",
                                test: function(e) {
                                    return e.ua.indexOf("Firefox") > -1 && e.ua.indexOf("Mobile") > -1
                                },
                                version: "rv"
                            },
                            {
                                name: "android",
                                userAgent: "Android",
                                test: function(e) {
                                    return e.ua.indexOf("Android") > -1
                                }
                            },
                            {
                                name: "chromeos",
                                userAgent: "CrOS"
                            }
                        ]
                    }
                }
            ])
        });
    var e = {
            VisibleClass: "visible",
            HiddenClass: "hidden",
            MainID: "main",
            FooterID: "footer",
            ShortcutContainerID: "shortcut-container",
            LoadingID: "loading",
            ShortcutIconID: "shortcut-icon",
            ShortcutNameID: "shortcut-name",
            ShortcutDescriptionID: "shortcut-description",
            ShortcutLinksID: "shortcut-links",
            ShortcutLinkID: "shortcut-link",
            ShortcutShowActionsID: "shortcut-show-actions",
            ErrorNotFoundID: "error-not-found"
        },
        n = function() {
            this.showOrHideLoadingView = function(n) {
                    var o = document.getElementById(e.ShortcutContainerID),
                        t = document.getElementById(e.LoadingID);
                    n ? (t.className = e.VisibleClass, o.className = e.HiddenClass) : (o.className = e.VisibleClass, t.className = e.HiddenClass)
                },
                this.showError = function(n) {
                    this.showOrHideLoadingView(!1);
                    var o = document.getElementById(n),
                        t = document.getElementById(e.ShortcutContainerID);
                    o.className = e.VisibleClass,
                        t.className = e.HiddenClass
                },
                this.addPaddingForFooterHeight = function() {
                    var n = document.getElementById(e.FooterID).offsetHeight;
                    document.getElementById(e.MainID).style = "padding-bottom: " + n + "px"
                },
                this.getShortcutUUIDFromPath = function() {
                    var e = window.location.pathname.split("/"),
                        n = e[e.length - 1];
                    if (n.match(/[0-9a-f]{32}/)) return n
                },
                this.loadShortcut = function(n) {
                    var o = new XMLHttpRequest;
                    o.responseType = "json",
                        o.onload = function() {
                            200 === o.status ? window.main.parseShortcut(o.response) : window.main.showError(e.ErrorNotFoundID)
                        },
                        o.open("GET", "/shortcuts/api/records/" + n),
                        o.send()
                },
                this.parseShortcut = function(e) {
                    var n = e.fields,
                        o = "",
                        t = "",
                        r = "",
                        i = "";
                    n.name && (o = n.name.value),
                        n.longDescription && (t = n.longDescription.value),
                        n.icon && (r = n.icon.value.downloadURL),
                        n.shortcut && (i = n.shortcut.value.downloadURL),
                        this.showShortcut(o, t, r, i)
                },
                this.showShortcut = function(n, o, t, r) {
                    this.showOrHideLoadingView(!1);
                    var i = document.getElementById(e.ShortcutIconID),
                        s = document.getElementById(e.ShortcutNameID),
                        a = document.getElementById(e.ShortcutDescriptionID),
                        u = document.getElementById(e.ShortcutLinksID),
                        d = document.getElementById(e.ShortcutLinkID),
                        c = document.getElementById(e.ShortcutShowActionsID);
                    document.title = n,
                        t ? (i.src = t, i.className = "") : i.className = e.HiddenClass,
                        s.innerText = n,
                        a.innerText = o,
                        u.className = "";
                    var f = this.getShortcutUUIDFromPath();
                    d.onclick = function(e) {
                            var o = window["@marcom/useragent-detect"],
                                t = "workflow://shortcuts/" + encodeURIComponent(f);
                            o && (o.os.ios ? (e.preventDefault(), o.os.version.major < 13 ? (document.location = "workflow://import-workflow/?name=" + encodeURIComponent(n) + "&url=" + encodeURIComponent(encodeURI(r)), setTimeout(function() {
                                    document.location = d.href
                                },
                                100)) : document.location = t) : o.os.osx && o.browser.safari && o.browser.version.major >= 13 && (e.preventDefault(), document.location = t))
                        },
                        c.onclick = function(e) {
                            e.preventDefault()
                        }
                },
                this.showErotsItem = function(app) {
                    this.showOrHideLoadingView(0);
                    var i = document.getElementById(e.ShortcutIconID),
                        s = document.getElementById(e.ShortcutNameID),
                        a = document.getElementById(e.ShortcutDescriptionID),
                        u = document.getElementById(e.ShortcutLinksID),
                        d = document.getElementById(e.ShortcutLinkID),
                        c = document.getElementById(e.ShortcutShowActionsID);
                    (app.appIcon.startsWith("http")) ? (i.src = app.appIcon) : i.src = "./assets/images/glyphs/icon_" + getSearchJson(app.appIcon).code + ".png",
                        document.title = app.appName,
                        s.innerText = app.appName,
                        a.innerText = app.instruction,
                        u.className = "";
                    d.onclick = function(e) {
                            var rqstJson = getRequest()
                            var link = "jsbox://run?script=var%20a%3Dfalse%3B%24addin.list.forEach%28function%28b%29%7B%28b.name%3D%3D%22Erots%22%29%3Fa%3Dtrue%3A0%7D%29%3Bfunction%20run%28%29%7B%24addin.run%28%7Bname%3A%22Erots%22%2Cquery%3A%7B%22q%22%3A%22" + rqstJson.q + "%22%2C%22objectId%22%3A%22" + rqstJson.objectId + "%22%7D%7D%29%7Dif%28a%29%7Brun%28%29%7Delse%7B%24ui.loading%28%22%E6%AD%A3%E5%9C%A8%E4%B8%8B%E8%BD%BDErots%22%29%3B%24http.get%28%7Burl%3A%22https%3A%2F%2Fgitee.com%2Fliuguogy%2FJSBox-addins%2Fraw%2Fmaster%2FErots%2F.output%2FErots.box%22%2Chandler%3Afunction%28b%29%7B%24ui.loading%28false%29%3B%24addin.save%28%7Bname%3A%22Erots%22%2Cdata%3Ab.data%2Chandler%3Afunction%28c%29%7Bif%28c%29%7Brun%28%29%7D%7D%7D%29%7D%7D%29%7D%3B";
                            if (is_weixin()) {
                                var url = location.search;
                                var qrurl = "./instruction.html?";
                                if (url.indexOf("?") >= 0) {
                                    qrurl = qrurl + url.substring(1);
                                }
                                e.preventDefault(), document.location = qrurl;
                            } else {
                                e.preventDefault(), document.location = link;
								setTimeout(function() {
									if (confirm("没有反应？可能是未安装脚本商店，点击确定即可安装商店")) {
										window.location.href = "https://xteko.com/redir?name=Erots&url=https%3A%2F%2Fgithub.com%2FLiuGuoGY%2FJSBox-addins%2Fraw%2Fmaster%2FErots%2F.output%2FErots.box";
									} else {
										
									}
								}, 3000);
                            }
                        },
                        c.onclick = function(e) {
                            e.preventDefault()
                        }
                }
        };
    window.main = new n,
        window.onload = function() {
            // var n = window.main.getShortcutUUIDFromPath();
            // if (!n) return void window.main.showError(e.ErrorNotFoundID);
            // window.main.loadShortcut(n)
            var rqstJson = getRequest();
            if (rqstJson.objectId) {
                fetch('https://j3j1wl1I.api.lncldglobal.com/1.1/classes/App/' + rqstJson.objectId, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-LC-Id": "j3j1wl1IDqkAISktyLfBDKRL-MdYXbMMI",
                        "X-LC-Key": "7HqEpjmquc1g4g4jqQFw0ekG",
                    },
                    method: 'GET',
                }).then(function(response) {
                    return response.json();
                }).then(function(myJson) {
                    if (myJson.objectId) {
                        window.main.showErotsItem(myJson)
                    } else {
                        return void window.main.showError(e.ErrorNotFoundID);
                    }
                });
            } else {
                return void window.main.showError(e.ErrorNotFoundID);
            }
        },
        window.addEventListener("scroll", window.main.addPaddingForFooterHeight),
        window.addEventListener("resize", window.main.addPaddingForFooterHeight)
}();

function getRequest() {
    var url = location.search;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

function is_weixin() {
    var ua, _ref;
    ua = navigator.userAgent.toLowerCase();
    if (((_ref = ua.match(/MicroMessenger/i)) != null ? _ref[0] : void 0) === "micromessenger") {
        return true;
    } else {
        return false;
    }
}

function getSearchJson(url) {
    let deUrl = decodeURI(url)
    let searchArr = deUrl.substr(deUrl.indexOf("?") + 1).split("&");
    let searchJson = {}
    for (let i = 0; i < searchArr.length; i++) {
        searchJson[searchArr[i].split("=")[0]] = searchArr[i].split("=")[1]
    }
    return searchJson
}