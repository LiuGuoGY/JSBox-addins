let utils = require('scripts/utils')
// let qiniu = require('scripts/qiniu.min')

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

async function uploadApp(json) {
  let resp = await $http.request({
    method: "POST",
    url: "https://avoscloud.com/1.1/classes/App",
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
    url: "https://avoscloud.com/1.1/classes/App/" + objectId,
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

// function leanCloud_uploadFile(fileName, file) {
//   let resp = await $http.request({
//     method: "POST",
//     url: "https://avoscloud.com/1.1/files/" + fileName,
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

async function catbox_uploadFile(file) {
  let resp = await $http.upload({
    url: "https://catbox.moe/user/api.php",
    files: [{ "data": file, "name": "fileToUpload"}],
    form: {
      "reqtype": "fileupload",
      "userhash": "db9c58fa320620970aa444d4f",
    },
  });
  $console.info(resp);
  return resp.data
}

async function uploadComment(objectId, commentJson) {
  let resp = await $http.request({
    method: "PUT",
    url: "https://avoscloud.com/1.1/classes/App/" + objectId,
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

async function uploadDownloadTimes(objectId) {
  let resp = await $http.request({
    method: "PUT",
    url: "https://avoscloud.com/1.1/classes/App/" + objectId,
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

async function uploadPraise(objectId, praiseUrl) {
  let resp = await $http.request({
    method: "PUT",
    url: "https://avoscloud.com/1.1/classes/App/" + objectId,
    timeout: 5,
    header: {
      "Content-Type": "application/json",
      "X-LC-Id": utils.appId,
      "X-LC-Key": utils.appKey,
    },
    body: {
      praise: praiseUrl,
    },
  })
  $console.info(resp);
  return resp.data
}

module.exports = {
  uploadSM: uploadSM,
  uploadApp: uploadApp,
  putApp: putApp,
  shimo_uploadFile: shimo_uploadFile,
  uploadComment: uploadComment,
  uploadDownloadTimes: uploadDownloadTimes,
  uploadPraise: uploadPraise,
  catbox_uploadFile: catbox_uploadFile,
}

