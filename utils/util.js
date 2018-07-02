var hotapp = require('./hotapp.js')

const http = (options) => {
  let defalutOption = {
    url:'/',
    method:'get',
    postdata:{},
    success:null,
    fail:null,
    complete:null
  }
  let option = Object.assign(defalutOption,options)
  hotapp.request({
    useProxy: true,
    url: 'http://www.itzoujie.com' +option.url, //仅为示例，并非真实的接口地址
    data: option.postdata,
    method: option.method,
    success: function (res) {
      // console.log(res.data)
      if(option.success){
        option.success(res)        
      }
    },
    fail: function (err) {
      if(option.fail){
        option.fail(err)
      }else{
        wx.showToast({
          title: url+'接口请求失败',
          icon: 'error',
          duration: 2000
        })
      }
    },
    complete: function () {
      if(option.complete){
        option.complete()
      }else{
        console.log('请求完成')
      }
    }
  })
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  http: http
}
