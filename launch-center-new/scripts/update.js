function getCurVersion() {
  let version = $file.exists("app.json")
    ? JSON.parse($file.read("app.json").string).version
    : "0.0.0";
  return version;
}

function getLatestVersion(params) {
  $http.get({
    url:
      "https://raw.githubusercontent.com/lcolok/Catcher/master/version.lcolok",
    handler: res => {
      params.handler(res.data);
    }
  });
}

function updateScript(version) {
  let url =
    "https://github.com/lcolok/Catcher/blob/master/.output/Catcher.box?raw=true";
  const scriptName = $addin.current.name;
  let downloadBox = $http.download({
    url: url
  });
  Promise.all([downloadBox, needRestart()]).then(res => {
    let box = res[0].data;
    let restart = /true/.test(res[1].data);
    console.log(restart);
    $addin.save({
      name: scriptName,
      data: box,
      handler: success => {
        if (success) {
          // let donateList = $file.read("donate.md").string;
          // let names = donateList.split(/[\r\n]+/).filter(i => i!== '');
          // $ui.toast(`静默更新完成，感谢${names.length - 3}位老板`);
          $ui.toast($l10n("静默更新完成"));
          if (restart) {
            $delay(0.3, () => {
              $addin.run(scriptName);
            });
          }
        }
      }
    });
  });
}

function needUpdate(nv, ov) {
  let getVersionWeight = i => {
    return i
      .split(".")
      .map(i => i * 1)
      .reduce((s, i) => s * 100 + i);
  };
  return getVersionWeight(nv) > getVersionWeight(ov);
}

function checkUpdate() {
  // if(needCheckup()) {
  //   getLatestVersion(params)
  // }
  $console.info(getCurVersion())
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

module.exports = {
  checkUpdate: checkUpdate
}