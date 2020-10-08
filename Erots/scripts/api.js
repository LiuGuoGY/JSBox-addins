let utils = require('scripts/utils')

const bombAppId = "51353b0736965d8a9c38869b93fdb038";
const bombAppKey = "3161f0aa9e52d81f816556e63f255758";

async function uploadSM(data, fileName) {
  let resp = await $http.upload({
    url: "https://sm.ms/api/upload",
    timeout: 30,
    files: [{ "data": data, "name": "smfile", "filename": fileName}],
  })
  $console.info(resp);
  if(resp.data && resp.data != "") {
    return resp.data.data.url
  } else {
    return undefined
  }
}

async function uploadSMV2(data, fileName) {
  let resp = await $http.request({
    method: "POST",
    url: "https://sm.ms/api/v2/upload",
    timeout: 30,
    header: {
      "Authorization": "KzrXPyIkYtRTSvC0rLig6nWeNYv2zS7x"
    },
    body: {
      smfile: data
    }
  })
  // await $http.upload({
  //   url: "https://sm.ms/api/v2/upload",
  //   timeout: 30,
  //   header: {
  //     "Authorization": "KzrXPyIkYtRTSvC0rLig6nWeNYv2zS7x"
  //   },
  //   files: [{ "data": data, "name": "smfile", "filename": fileName}],
  // })
  $console.info(resp);
  if(resp.data && resp.data != "") {
    return resp.data.data.url
  } else {
    return undefined
  }
}

async function uploadApp(json) {
  let resp = await $http.request({
    method: "POST",
    url: utils.domain + "/classes/App",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: json,
  })
  $console.info(resp);
  return resp.data
}

async function putApp(objectId, json) {
  let resp = await $http.request({
    method: "PUT",
    url: utils.domain + "/classes/App/" + objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: json,
  })
  $console.info(resp);
  return resp.data
}

async function shimo_uploadFile(file) {
  let resp = await $http.post({
    url: "https://shimo.im/api/upload/token",
    header: {
      'Cookie': "shimo-ws-route=ccadb53ce102da876e1e53f935b283f8; Path=/ws/; HttpOnly",
    },
  })
  $console.info(resp);
  let token = resp.data.data.accessToken;
  resp = await $http.upload({
    url: "https://uploader.shimo.im/upload2",
    form: {
      "server": "qiniu",
      "type": "attachments",
      "accessToken": token,
    },
    showsProgress: false,
    timeout: 60,
    files: [{
      "name": "file",
      "data": file,
    }],
  });
  $console.info(resp);
  if(resp.data && resp.data.data) {
    return resp.data.data.url
  } else {
    $console.info(resp.error);
    return undefined
  }
}

async function shimo_uploadFileNew(file, fileName) {
  let resp = await shimo_getToken(fileName);
  let key = resp.data[0].key;
  let token = resp.data[0].token;

  // file.info.mimeType = "application/octet-stream";
  $console.info(key);
  $console.info(token);
  $console.info(file);
  
  resp = await $http.upload({
    url: "https://upload.qiniup.com/",
    timeout: 60,
    // header: {
    //   "Accept": "*/*", 
    //   "Accept-Encoding": "gzip, deflate, br", 
    //   "Accept-Language": "zh-cn" ,
    //   "Connection": "keep-alive" ,
    //   // "Content-Length": "226360" ,
    //   "Content-Type": "multipart/form-data" ,
    //   "Host": "upload.qiniup.com" ,
    //   "Origin": "https://shimo.im",
    //   "Referer": "https://shimo.im/docs/Fx5b2A0Q0hke9yIT" ,
    //   "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.1 Safari/605.1.15",
    // },
    form: {
      "key": key,
      "token": token,
      "fname": fileName,
    },
    files: [
      {
        "data": file,
        "name": "file",
        "filename": fileName,
        "content-type": "application/octet-stream"
      }
    ],
  })
  $console.info(resp);
  if(resp.data && resp.data.data) {
    return resp.data.data.url
  } else {
    $console.info(resp.error);
    return undefined
  }
}

async function shimo_getToken(fileName) {
  let resp = await $http.post({
    url: "https://api.shimo.im/action/create_upload_forms",
    header: {
      "Accept": "application/vnd.shimo.v2+json",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn" ,
      "Authorization": "Bearer 3b2cb340990b27402cacbcbf2e28a2909f4ff67360e9fc1ef81db38b96d23cc96bbd797ee66baabbcdf48e0289f8fa43d175641e5977b98af4cea63c252b079c",
      "Connection": "keep-alive" ,
      "Content-Length": "16" ,
      "Content-Type": "application/json" ,
      "Cookie": "deviceId=42e5d10c-9e6c-42df-bc7a-fa13eb935406; deviceIdGenerateTime=1570855924712" ,
      "Host": "api.shimo.im" ,
      "User-Agent": "ShimoDocsRN/2.26.4.7953 (shimo-iphone-app) iOS/13.1.2",
    },
    body: [fileName]
  })
  $console.info(resp);
  return resp;
}

// function leanCloud_uploadFile(fileName, file) {
//   let resp = await $http.request({
//     method: "POST",
//     url: utils.domain + "/files/" + fileName,
//     timeout: 5,
//     header: {
//       "Content-Type": "application/json",
//       "X-LC-Id": utils.appId,
//       "X-LC-Key": utils.appKey,
//     },
//     body: {
//       comment: {
//         __op: "AddUnique",
//         objects: [commentJson],
//       }
//     },
//   })
//   $console.info(resp);
//   return resp.data
// }

async function TinyPng_uploadPic(pic) {
  let apiKeys = ["qp8G6bzstArEa3sLgYa90TImDLmJ511r", "N2Ceias4LsCo0DzW2OaYPvTWMifcJZ6t"]
  let resp = await $http.post({
    url: "https://api.tinify.com/shrink",
    header: {
      Authorization: "Basic " + $text.base64Encode("api:" + randomValue(apiKeys)),
    },
    body: pic,
  })
  $console.info(resp);
  let response = resp.response;
  if(!response) {
    return undefined;
  }
  if (response.statusCode === 201 || response.statusCode === 200) {
    let compressedImageUrl = response.headers["Location"]
    let resp_ = await $http.download({
      url: compressedImageUrl,
    })
    if (resp_.data) {
      let imageData = resp_.data
      return imageData
    }
  }
  return undefined;
}

async function catbox_uploadFile(file, view) {
  let resp = await $http.upload({
    url: "https://catbox.moe/user/api.php",
    files: [{ "data": file, "name": "fileToUpload"}],
    form: {
      "reqtype": "fileupload",
      "userhash": "db9c58fa320620970aa444d4f",
    },
    progress: function(percentage) {
      view.text = "上传应用文件... (" + percentage + "%)"
    },
  });
  $console.info(resp);
  return resp.data
}

async function bomb_uploadFile(file, fileName, filePath, view) {
  let isJsFile = filePath.endsWith(".js");
  let suffix = isJsFile?".js":".zip";
  let contentType = isJsFile?"text/plain":"application/x-zip-compressed"
  let bodyContent = file
  let resp = await $http.post({
    url: "https://api.bmob.cn/2/files/" + $text.URLEncode(fileName) + suffix,
    header: {
      "X-Bmob-Application-Id": bombAppId,
      "X-Bmob-REST-API-Key": bombAppKey,
      "Content-Type": contentType,
    },
    body: bodyContent,
  })
  $console.info(resp);
  if(resp.error)
    $console.info(resp.error);
  return resp.data.url;
}

async function uploadComment(objectId, commentJson) {
  let resp = await $http.request({
    method: "PUT",
    url: utils.domain + "/classes/App/" + objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      comment: {
        __op: "AddUnique",
        objects: [commentJson],
      }
    },
  })
  $console.info(resp);
  return resp.data
}

async function uploadFaultReport(reportJson) {
  let resp = await $http.request({
    method: "POST",
    url: utils.domain + "/classes/FaultReport",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      userId: reportJson.userId,
      username: reportJson.username,
      appId: reportJson.appId,
      appName: reportJson.appName,
      detail: reportJson.detail,
    },
  })
  $console.info(resp);
  return resp.data
}

async function uploadReply(objectId, newComment) {
  let resp = await $http.request({
    method: "GET",
    url: utils.domain + "/classes/App/" + objectId + "?include=comment",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
  })
  let comments = resp.data.comment
  for(let i = 0; i < comments.length; i++) {
    if(comments[i].time && newComment.time && comments[i].time == newComment.time) {
      comments[i].reply = newComment.reply
      comments[i].replyTime = newComment.replyTime
      break;
    }
  }
  resp = await $http.request({
    method: "PUT",
    url: utils.domain + "/classes/App/" + objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      comment: comments,
    },
  })
  $console.info(resp);
  return resp.data
}

async function uploadDownloadTimes(objectId) {
  let resp = await $http.request({
    method: "PUT",
    url: utils.domain + "/classes/App/" + objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      downloadTimes: {
        __op: "Increment",
        amount: parseInt($text.base64Decode("MQ==")),
      }
    },
  })
  $console.info(resp);
  return resp.data
}

async function uploadPraise(objectIds, praiseUrl) {
  let requests = []
  for(let i = 0; i < objectIds.length; i++) {
    requests.push({
      "method": "PUT",
      "path": "/1.1/classes/App/" + objectIds[i],
      "body": {
        "praise": praiseUrl,
      }
    })
  }
  let resp = await $http.request({
    method: "POST",
    url: utils.domain + "/batch",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      requests: requests,
    },
  })
  // let resp = await $http.request({
  //   method: "PUT",
  //   url: utils.domain + "/classes/App/" + objectId,
  //   timeout: 5,
  //   header: {
  //     "Content-Type": "application/json",
  //     "X-LC-Id": utils.appId,
  //     "X-LC-Key": utils.appKey,
  //   },
  //   body: {
  //     praise: praiseUrl,
  //   },
  // })
  $console.info(resp);
  return resp.data
}

async function uploadOnStore(objectId, onStore) {
  let resp = await $http.request({
    method: "PUT",
    url: utils.domain + "/classes/App/" + objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      onStore: onStore,
    },
  })
  $console.info(resp);
  return resp.data
}

async function getErotsSetting() {
  let resp = await $http.request({
    method: "GET",
    url: utils.domain + "/classes/Setting/5e4b9ae7f94e0f00083f98a6?keys=-updatedAt,-objectId,-createdAt",
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
  })
  if(resp.data) {
    $cache.set("Settings", resp.data);
  }
  return resp.data
}

module.exports = {
  uploadSM: uploadSM,
  uploadSMV2: uploadSMV2,
  uploadApp: uploadApp,
  putApp: putApp,
  shimo_uploadFile: shimo_uploadFile,
  uploadComment: uploadComment,
  uploadDownloadTimes: uploadDownloadTimes,
  uploadPraise: uploadPraise,
  catbox_uploadFile: catbox_uploadFile,
  uploadFile: bomb_uploadFile,
  uploadOnStore: uploadOnStore,
  uploadReply: uploadReply,
  shimo_getToken: shimo_getToken,
  shimo_uploadFileNew: shimo_uploadFileNew,
  TinyPng_uploadPic: TinyPng_uploadPic,
  uploadFaultReport: uploadFaultReport,
  getErotsSetting: getErotsSetting,
}

