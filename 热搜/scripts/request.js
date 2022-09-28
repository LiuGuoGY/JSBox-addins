async function getWeiboHot_tenapi() {
  let resp = await $http.get({
    url: "https://tenapi.cn/resou/",
    timeout: 5,
  });
  if (resp.data && resp.data.data == 200) {
    return resp.data;
  } else {
    return null;
  }
}

async function getWeiboHot_official() {
  let resp = await $http.get({
    url: "https://weibointl.api.weibo.cn/portal.php?ct=feed&a=search_topic",
    timeout: 5,
  });
  if (resp.data && resp.data.retcode === 0) {
    return resp.data;
  } else {
    return null;
  }
}

module.exports = {
  getWeiboHot: getWeiboHot_official,
};