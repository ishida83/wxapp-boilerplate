//index.js
const Config = __DEV__ ? require('../../configs/development') : require('../../configs/production');

var app = getApp()
Page({
  data: {
    githubLink: Config.api.host,
    avatarLink: '../../images/logo.png',
    qrCodeLink: '../../images/qrcode.jpg'
  },
  previewImage: function () {
    wx.previewImage({
      current: '/images/qrcode.jpg', // 当前显示图片的http链接
      urls: [`${Config.api.host}/images/qrcode.png`] // 需要预览的图片http链接列表
    });
  },
  onLoad: function () {
    // console.log('onLoad')
    if(__WECHAT__) {
			wx.showShareMenu({
				withShareTicket: true
			});
		}
  }
})
