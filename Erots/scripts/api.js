let utils = require('scripts/utils')

async function uploadSM(data, fileName) {
  let resp = await $http.upload({
    url: "https://sm.ms/api/upload",
    timeout: 5,
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
    url: "https://kscf2nxm.api.lncld.net/1.1/classes/App",
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
    url: "https://kscf2nxm.api.lncld.net/1.1/classes/App/" + objectId,
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
    timeout: 5,
    files: [{
      "name": "file",
      "data": file,
    }],
  });
  $console.info(resp);
  if(resp.data && resp.data.data) {
    return resp.data.data.url
  } else {
    return undefined
  }
}


module.exports = {
  uploadSM: uploadSM,
  uploadApp: uploadApp,
  putApp: putApp,
  shimo_uploadFile: shimo_uploadFile,
}

