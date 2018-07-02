//index.js
//获取应用实例
const app = getApp()
var hotapp = require('../../utils/hotapp.js')
const utils = require('../../utils/util.js')
Page({
  data: {
    motto: 'Hello World',
    active_id: 0,
    active_title: '',
    active_time:'',
    active_addr:'',
    active_joined: [],
    userInfo: {},
    hasJoined:false,
    hasLoad:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //去发布
  toPublish: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  getJoinUser: function(activeid){
    let vm = this;
    utils.http({
      url: '/active/getJoinUser?activeid=' + activeid,
      success: function (res) {
        let data = res.data;
        if (data.code == 200) {
          vm.setData({
            active_joined: data.content,
            hasLoad:true
          }) 
          if (vm.checkUserid()){
            vm.setData({
              hasJoined:true
            })
          }else{
            vm.setData({
              hasJoined:false
            })
          }
        } else {
          wx.showToast({
            title: data.msg,
            duration: 2000
          })
        }
      },
      complete:function(){
        wx.hideLoading()
      }
    })
  },
  onLoad: function () {
    let vm = this;
    wx.showLoading({
      mask: true,
    })
    utils.http({
      url:'/active/getLatestActive',
      success:function(res){
        let data = res.data;
        if(data.code==200){
          vm.setData({
            active_id: data.content[0].id,
            active_title: data.content[0].name,
            active_time: data.content[0].time,
            active_addr: data.content[0].address
          })
          vm.getJoinUser(data.content[0].id)
        }else{
          wx.showToast({
            title: '加载失败请刷新',
            duration: 2000
          })
        }
      }
    })
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo
          })
        }
      })
    }
  },
  //点击报名接口
  getUserInfo: function(e) {
    console.log(e)
    let vm = this;
    let userInfo = e.detail.userInfo
    app.globalData.userInfo = userInfo
    this.setData({
      userInfo: userInfo
    })
    if (vm.checkUserid()){
      vm.setData({
        hasJoined:true
      })
      return
    }
    wx.showLoading({
      mask: true,
    })
    let active_joined = this.data['active_joined']
    active_joined.push({ 'name': e.detail.userInfo.nickName, 'avatarUrl': e.detail.userInfo.avatarUrl})
    utils.http({
      url: '/active/addJoinUser',
      method:'post',
      postdata: { name:userInfo.nickName, province:userInfo.province,country:userInfo.country,activeid:vm.data['active_id'],avatarUrl:userInfo.avatarUrl,city:userInfo.city },
      success: function (res) {
        if(res.data.code==200){
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(()=>{
            wx.redirectTo({
              url: '../index/index'
            })
          },1500)
          // vm.setData({
          //   active_joined: active_joined,
          //   hasJoined: true
          // })
        }else{
          wx.showToast({
            title: '网络不稳请重试',
            icon:'none',
            duration: 2000
          })
        }
      }
    })
  },
  //取消报名
  cancelJoin: function(){
    let vm = this
    let {userid,index} = this.checkUserid()
    wx.showLoading({
      mask: true,
    })
    utils.http({
      url: '/active/cancelJoin',
      method:'post',
      postdata: {userid:userid},
      success: function (res) {
        if(res.data.code==200){
          wx.showToast({
            title: '取消成功',
            duration: 2000
          })
          // wx.redirectTo({
          //   url: '../index/index'
          // })
          let active_joined = vm.data['active_joined']
          active_joined.splice(index,1)
          vm.setData({
            active_joined: active_joined,
            hasJoined: false
          })
        }else{
          wx.showToast({
            title: '网络不稳请重试',
            icon:'none',
            duration: 2000
          })
        }
      }
    })
  },
  //查询userid
  checkUserid: function(){
    let vm = this;
    for( let [index,item] of new Map(vm.data['active_joined'].map((item,index) => [index,item]))) {
      if(item.name==vm.data.userInfo['nickName']){
        return {userid:item.id,index:index}
      }
    }
  }
})
