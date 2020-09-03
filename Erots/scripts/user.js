let utils = require('scripts/utils')
let error = require('scripts/error')

function logUp(json, handler) {
  if(!json.username || !json.password || !json.email || !json.nickname) {
    return 0
  }
  $http.request({
    method: "POST",
    url: utils.domain + "/users",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      username: json.username,
      password: json.password,
      email: json.email,
      nickname: json.nickname,
      deviceId: $objc("FCUUID").invoke("uuidForDevice").rawValue(),
    },
    handler: async function(resp) {
      let data = resp.data
      if(data.error) {
        $ui.alert({
          title: "错误",
          message: await error.getMessage(data.code, data.error),
          actions: [{
            title: "好的",
            handler: function() {
              
            }
          }]
        })
      }
      handler(!data.error)
    }
  })
}

function login(json, handler) {
  if(!json.username || !json.password) {
    return 0
  }
  $http.request({
    method: "POST",
    url: utils.domain + "/login",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      username: json.username,
      password: json.password,
    },
    handler: async function(resp) {
      let data = resp.data
      if(data.error) {
        let actions = [{
          title: "好的",
          handler: function() {
            
          }
        }]
        if(data.code === 216) {
          actions = [{
            title: "重新发送验证邮件",
            handler: function() {
              let emailJson = {
                email: json.username,
              }
              requestEmailVerify(emailJson, function(data){
                $ui.alert({
                  title: "提示",
                  message: "一封验证邮件已经发送至您的邮箱！",
                  actions: [{
                    title: "好的",
                    handler: function() {
                      
                    }
                  }]
                })
              })
            }
          },{
            title: "好的",
            handler: function() {
              
            }
          },]
        }
        $ui.alert({
          title: "错误",
          message: await error.getMessage(data.code, data.error),
          actions: actions,
        })
      } else {
        handler(data)
      }
    }
  })
}

function passwordReset(json, handler) {
  if(!json.email) {
    return 0
  }
  $http.request({
    method: "POST",
    url: utils.domain + "/requestPasswordReset",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      email: json.email,
    },
    handler: async function(resp) {
      let data = resp.data
      if(data.error) {
        $ui.alert({
          title: "错误",
          message: await error.getMessage(data.code, data.error),
          actions: [{
            title: "好的",
            handler: function() {
              
            }
          }]
        })
      } else {
        handler(data)
      }
    }
  })
}

function requestEmailVerify(json, handler) {
  if(!json.email) {
    return 0
  }
  $http.request({
    method: "POST",
    url: utils.domain + "/requestEmailVerify",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      email: json.email,
    },
    handler: async function(resp) {
      let data = resp.data
      if(data.error) {
        $ui.alert({
          title: "错误",
          message: await error.getMessage(data.code, data.error),
          actions: [{
            title: "好的",
            handler: function() {
              
            }
          }]
        })
      } else {
        handler(data)
      }
    }
  })
}

async function setPraise(praiseUrl) {
  let resp = await $http.request({
    method: "PUT",
    url: utils.domain + "/users/" + getLoginUser().objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
      "X-LC-Session": getLoginUser().sessionToken,
    },
    body: {
      praise: praiseUrl,
    },
  })
  $console.info(resp);
  return resp.data
}

async function requireUser() {
  let resp = await $http.request({
    method: "GET",
    url: utils.domain + "/users/" + getLoginUser().objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
  })
  $console.info(resp);
  saveUser(resp.data)
  return resp.data
}

function saveUser(data) {
  $cache.set("loginUser", data)
}

function getLoginUser() {
  return utils.getCache("loginUser")
}

function haveLogined() {
  if(utils.getCache("loginUser")) {
    return true
  } else {
    return false
  }
}

function logout() {
  $cache.remove("loginUser")
  $addin.restart()
}

module.exports = {
  logUp: logUp,
  login: login,
  passwordReset: passwordReset,
  saveUser: saveUser,
  getLoginUser: getLoginUser,
  haveLogined: haveLogined,
  requestEmailVerify: requestEmailVerify,
  logout: logout,
  setPraise: setPraise,
  requireUser: requireUser,
}