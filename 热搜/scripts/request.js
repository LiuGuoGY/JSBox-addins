async function getWeiboHot() {
    let resp = await $http.get({
      url: "https://tenapi.cn/resou/",
      timeout: 5,
    });
    if(resp.data && resp.data.data == 200) {
      return resp.data;
    } else {
      return null;
    }
  }

  module.exports = {
    getWeiboHot: getWeiboHot,
  };