let utils = require('scripts/utils')
let Encrypt = require('scripts/encrypt')

function sync() {
  let dataDir = "drive://launch-center/data.json"
  if(!$file.exists("drive://launch-center/")) {
    $file.mkdir("drive://launch-center/")
  }
  if(utils.getCache("localItems", []).length > 0) {
    $file.write({
      data: $data({string: getAllDataString()}),
      path: dataDir
    })
  } else {
    if($file.exists(dataDir)) {
      setAllData($file.read(dataDir).string)
    }
  }
}

function upload() {
  if(utils.getCache("localItems", []).length > 0) {
    let dataDir = "drive://launch-center/data.text"
    if(!$file.exists("drive://launch-center/")) {
      $file.mkdir("drive://launch-center/")
    }
    $file.write({
      data: $data({string: Encrypt.encrypt(getAllDataString())}),
      path: dataDir
    })
  }
}

function download() {
  if(utils.getCache("localItems", []).length <= 0) {
    let dataDir = "drive://launch-center/data.text"
    if(!$file.exists("drive://launch-center/")) {
      $file.mkdir("drive://launch-center/")
    }
    if($file.exists(dataDir)) {
      setAllData(Encrypt.decrypt($file.read(dataDir).string))
    }
  }
}

function getAllDataString() {
  let data = {
    columns: utils.getCache("columns"),
    showMode: utils.getCache("showMode"),
    openBroswer: utils.getCache("openBroswer"),
    backgroundTranparent: utils.getCache("backgroundTranparent"),
    pullToClose: utils.getCache("pullToClose"),
    staticHeight: utils.getCache("staticHeight"),
    localItems: utils.getCache("localItems", []),
  }
  return JSON.stringify(data)
}

function setAllData(dataString) {
  let data = JSON.parse(dataString)
  $cache.set("columns", data.columns)
  $cache.set("showMode", data.showMode)
  $cache.set("openBroswer", data.openBroswer)
  $cache.set("backgroundTranparent", data.backgroundTranparent)
  $cache.set("pullToClose", data.pullToClose)
  $cache.set("staticHeight", data.staticHeight)
  $cache.set("localItems", data.localItems)
}

module.exports = {
  sync: sync,
  upload: upload,
  download: download,
}