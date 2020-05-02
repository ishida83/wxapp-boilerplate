//index.js
//获取应用实例
const app = getApp();
const Constant = require('../../utils/constant.js');
const Config = __DEV__ ? require('../../configs/development') : require('../../configs/production');

function _next() {
	var that = this;
	if (this.data.progress >= 100) {
		this.setData({
			// disabled: true
		});
		return true;
	}
	this.setData({
		progress: ++this.data.progress
	});
	setTimeout(function () {
		_next.call(that);
	}, 20);
}

Page({
	data: {
		motto: 'Hello World',
		showLine: true,
		userInfo: {},
		file: '',
		errmsg: '',
		width: 0,
		height: 0,
		progress: 0,
		faces: [],
		windowWidth: 0,
		windowHeight: 0,
		disabled: false,
		shareImgSrc: '',
		matchFile: '',
		matchFileName: '',
		prob: 0,
		showQr: false,
		access: ''
	},
	//事件处理函数
	bindViewTap: function () {
		wx.navigateTo({
			url: '../logs/logs'
		});
	},
	visitIG: function (event) {
		wx.navigateToMiniProgram({
			appId: 'wx34a09c3d525e41ae',
			path: 'pages/index3/index3?who=' + event.currentTarget.dataset.name,
			extraData: {
				who: event.currentTarget.dataset.name
			},
			envVersion: 'release',
			success(res) {
				// 打开成功
				console.log(res);
			}
		});
	},
	switchChange: function (e) {
		this.setData({
			showLine: e.detail.value
		});
	},
	chooseImage: function (e) {
		var that = this;
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (resp) {
				wx.getImageInfo({
					src: __WECHAT__ ? resp.tempFilePaths[0] : resp.apFilePaths[0],
					success: function (res) {
						console.log(res.width)
						console.log(res.height)
						that.setData({
							width: res.width,
							height: res.height,
							// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
							file: __WECHAT__ ? resp.tempFilePaths[0] : resp.apFilePaths[0]
						})

						that.upload(__WECHAT__ ? resp.tempFilePaths[0] : resp.apFilePaths[0]);
					}
				})
			}
		})
	},
	upload: function (file) {
		// if (this.data.disabled) {
		//     return;
		// }
		const that = this;

		this.setData({
			progress: 0
			// disabled: false
		});

		if (file) {
			this.setData({
				progress: 0,
				errmsg: ''
			});
			wx.showLoading({
				title: '识别中...'
			});
			wx.showNavigationBarLoading();

			wx.uploadFile({
				url: `${Config.api.host}${Constant.IMG_SECURITY_CHECK}&access_token=${this.data.access}`,
				filePath: file,
				header: {
					'content-type': 'multipart/form-data'
				},
				name: 'media',
				success: function (checkres) {
					const checkResult = JSON.parse(checkres.data);
					console.info(checkResult);
					if (checkResult.errcode === 0) {
						const uploadTask = wx.uploadFile({
							url: `${Config.api.host}/lookup`, //仅为示例，非真实的接口地址
							filePath: file,
							name: 'image',
							formData: {
								'user': 'test'
							},
							success: function (res) {
								const data = res.data;
								console.log(data);

								try {
									let tmp = JSON.parse(data).distances;
									if (tmp && tmp.length <= 0) {
										that.setData({
											faces: [],
											file: '',
											matchFile: '',
											prob: 0,
											matchFileName: '',
											errmsg: '没有找到相似明星喔゜(´・ω・｀*)！'
										});
										wx.hideLoading();
										wx.hideNavigationBarLoading();
										return;
									}

									tmp = tmp.map((item) => ({ name: item.name, prob: Number(item.prob * 100).toFixed(2), url: item.extra.extra.url, faceLoc: item.extra.extra.face_location, width: item.extra.extra.width, height: item.extra.extra.height }));

									for (let idx = 0; idx < tmp.length && idx < 5; idx++) {

										let tmpItem = tmp[idx],
											{ url, width, height } = tmpItem,
											context = wx.createCanvasContext(`cv${idx}`),
											[top, right, bottom, left] = tmpItem.faceLoc;

										if (tmpItem) {
											tmpItem.width = width > (that.data.windowWidth - 30) ? (that.data.windowWidth - 30) : width;
											tmpItem.height = tmpItem.width / width * height;
											context.setStrokeStyle('#00ff00');
											context.setLineWidth(2);
											context.rect(
												left / width * tmpItem.width,
												top / width * tmpItem.width,
												(right - left) / width * tmpItem.width,
												(bottom - top) / width * tmpItem.width
											);
											context.stroke();
											context.draw();
										}
									}
									that.setData({
										faces: tmp ? tmp.slice(0, 5) : [], //.sort((i,j)=>i.prob>j.prob?-1:1)
										matchFile: (tmp || [])[0].url,
										matchFileName: (tmp || [])[0].name,
										prob: JSON.parse(data).distances[0].prob,
										matchFileWidth: JSON.parse(data).distances[0].extra.extra.width,
										matchFileHeight: JSON.parse(data).distances[0].extra.extra.height
									});
									wx.hideLoading();
									wx.hideNavigationBarLoading();

								} catch (e) {
									wx.showToast('找不到图片中的颜呢(｡・ˇ_ˇ・｡)');
									that.setData({
										faces: [],
										file: '',
										matchFile: '',
										matchFileName: '',
										prob: 0,
										errmsg: '找不到图片中的颜呢(｡・ˇ_ˇ・｡)'
									});
									wx.hideLoading();
									wx.hideNavigationBarLoading();
								} finally {
								}
							}.bind(this),
							fail: function (err) {
								wx.showToast('服务器维护中 (๑꒪⍘꒪๑)请稍后再来！');
								this.setData({
									faces: [],
									file: '',
									matchFile: '',
									matchFileName: '',
									prob: 0,
									errmsg: '服务器维护中 (๑꒪⍘꒪๑)请稍后再来！'
								});
								wx.hideLoading();
								wx.hideNavigationBarLoading();
							},
							complete: function () {
								// wx.hideLoading();
							}
						});

						__WECHAT__ && uploadTask.onProgressUpdate((res) => {
							console.log('上传进度', res.progress)
							console.log('已经上传的数据长度', res.totalBytesSent)
							console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
							if (res.progress >= 100) {
								that.setData({
									progress: res.progress
									// disabled: false
								});
							} else {
								that.setData({
									progress: res.progress
								});
							}
						});
					} else {
						if (checkResult.errcode === 87014) {
							wx.hideLoading();
							wx.showModal({
								content: '存在敏感内容，请更换图片',
								showCancel: false,
								confirmText: '明白了'
							});
						} else {
							wx.hideLoading();
							wx.showModal({
								content: '其他错误，稍后再试',
								showCancel: false,
								confirmText: '明白了'
							});
						}
					}
				}
			});
		}
	},
	share() {
		//绘制canvas图片
		const that = this;
		const ctx = wx.createCanvasContext('myCanvas');
		// const bgPath = '../../images/bg4.jpg'; // this.data.file; // '../../images/bg.jpg';
		// let portraitPath = that.data.portrait_temp
		const hostNickname = '你的照片'; // app.globalData.userInfo.nickName;
		const versusPath = '../../images/vs.png';

		let qrPath = that.data.qrcodeTemp;
		const { windowHeight, windowWidth } = that.data;
		that.setData({
			scale: 1.6,
			disabled: true
		});
		//绘制背景图片
		// ctx.drawImage(bgPath, 0, 0, windowWidth, that.data.scale * windowWidth);

		// ctx.drawImage('../../images/16-48-05-97-20747.png', 20, 20, 0.1 * windowWidth,0.1 * windowWidth);


		const dy = 120;
		const dWidth = 0.5 * windowWidth;
		let dHeight = that.data.height / that.data.width * dWidth < that.data.matchFileHeight / that.data.matchFileWidth * dWidth ? that.data.matchFileHeight / that.data.matchFileWidth * dWidth : that.data.height / that.data.width * dWidth;

		if (dHeight > 1.6 * dWidth) {
			dHeight = 1.6 * dWidth;
		}

		const sx = 0;
		const sy = 0;
		const sWidthMatch = that.data.matchFileWidth;
		const sWidth = that.data.width;
		const sHeightMatch = dHeight / dWidth * that.data.matchFileWidth;
		const sHeight = dHeight / dWidth * that.data.width;


		wx.showLoading({
			title: '分享中'
		});

		// Fill the path
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, windowWidth, windowHeight);

		ctx.drawImage(this.data.file, sx, sy, sWidth, sHeight, 0, dy, dWidth, dHeight);
		wx.getImageInfo({
			src: `${Constant.PROXY_IMAGE}${this.data.matchFile}`,
			success: function (res) {
				ctx.drawImage(res.path, sx, sy, sWidthMatch, sHeightMatch, 0.5 * windowWidth, dy, dWidth, dHeight);

				ctx.drawImage(versusPath, windowWidth / 2 - 0.08 * windowWidth, dy + dHeight / 2 - 0.08 * windowWidth, 0.16 * windowWidth, 0.16 * windowWidth);

				ctx.setFillStyle('#666666');
				ctx.setFontSize(0.04 * windowWidth);
				ctx.setTextAlign('center');
				ctx.fillText(hostNickname, 100, dy + dHeight + 20);

				ctx.setFillStyle('#666666');
				ctx.setFontSize(0.04 * windowWidth);
				ctx.setTextAlign('center');
				ctx.fillText(that.data.matchFileName, 0.5 * windowWidth + 100, dy + dHeight + 20);


				//绘制头像
				ctx.save();
				ctx.beginPath();
				ctx.arc(windowWidth / 2, 0.32 * windowWidth, 0.15 * windowWidth, 0, 2 * Math.PI);
				ctx.clip();
				// ctx.drawImage(portraitPath, 0.7 * windowWidth / 2, 0.17 * windowWidth, 0.3 * windowWidth, 0.3 * windowWidth)
				ctx.restore();
				//绘制第一段文本
				ctx.setFillStyle('#666666');
				ctx.setFontSize(0.037 * windowWidth);
				ctx.setTextAlign('center');
				ctx.fillText('星颜', windowWidth / 2, 0.1 * windowWidth);
				//绘制第二段文本
				ctx.setFillStyle('#333333');
				ctx.setFontSize(0.047 * windowWidth);
				ctx.setTextAlign('center');
				ctx.fillText('我是明星脸 看看最像谁', windowWidth / 2, 0.18 * windowWidth);

				ctx.fillText(`相似度：${Number(that.data.prob * 100).toFixed(2)}%`, windowWidth / 2, dy + dHeight + 60);

				//绘制二维码
				if (that.data.showQr) {
					ctx.drawImage(qrPath, windowWidth / 2 - 0.1 * windowWidth, windowHeight - 0.2 * windowWidth - 10, 0.2 * windowWidth, 0.2 * windowWidth);
				}
				//绘制第三段文本
				ctx.setFillStyle('#666666');
				ctx.setFontSize(0.037 * windowWidth);
				ctx.setTextAlign('center');
				ctx.fillText(Config.api.host, windowWidth / 2, 0.25 * windowWidth);
				// ctx.fillText('中国共产主义青年团湘西土家族苗族自治州委员会 禁毒宣传活动', windowWidth / 2, dy+ dHeight+190);
				ctx.draw();

				setTimeout(function () {
					wx.canvasToTempFilePath({
						// x: 0,
						// y: 0,
						// width: that.data.windowWidth,
						// height: that.data.windowWidth * that.data.scale,
						// destWidth: that.data.windowWidth * 4,
						// destHeight: that.data.windowWidth * 4 * that.data.scale,
						canvasId: 'myCanvas',
						success: function (res) {
							console.log('朋友圈分享图生成成功:' + res.tempFilePath);
							// wx.previewImage({
							//     current: res.tempFilePath, // 当前显示图片的http链接
							//     urls: [res.tempFilePath] // 需要预览的图片http链接列表
							// });
							wx.hideLoading();
							wx.hideNavigationBarLoading();
							that.setData({
								shareImgSrc: res.tempFilePath,
								disabled: false
							});
							that.save();
						},
						fail: function (err) {
							console.log('失败');
							console.log(err);
							wx.showToast('服务器维护中 请稍后再来！');
							that.setData({
								faces: [],
								prob: 0,
								file: '',
								matchFile: '',
								matchFileName: '',
								errmsg: '服务器维护中 请稍后再来！'
							});
							wx.hideLoading();
							wx.hideNavigationBarLoading();
						}
					});
				}, 2500);
			},
			fail: function (err) {
				console.log('失败');
				console.log(err);
				wx.showToast('服务器维护中 请稍后再来！');
				that.setData({
					faces: [],
					file: '',
					matchFile: '',
					matchFileName: '',
					prob: 0,
					errmsg: '服务器维护中 请稍后再来！'
				});
				wx.hideLoading();
				wx.hideNavigationBarLoading();
			}
		});

	},
	save: function () {
		const that = this;
		wx.saveImageToPhotosAlbum({
			filePath: that.data.shareImgSrc,
			success(res) {
				wx.showModal({
					title: '存图成功',
					content: '图片成功保存到相册了，可以转发朋友圈咯~',
					showCancel: false,
					confirmText: '好哒',
					confirmColor: '#72B9C3',
					success: function (res) {
						if (res.confirm) {
							console.log('用户点击确定');
							// that.setData({faces:[]});
						}
					}
				});
			}
		});
	},
	onLoad: function () {
		// console.log('onLoad');
		//调用应用实例的方法获取全局数据
		// app.wechat.getUserInfo().then(res => {
		//     this.setData({ userInfo: res.userInfo });
		// });
		const that = this;
		if (__WECHAT__) {
			wx.showShareMenu({
				withShareTicket: true
			});
		}
		app.api.get(Constant.RECOMMENDATION, { 'utm_source': 'weapp', 'utm_medium': 'face' }).then((res) => {
			if (res.statusCode === 404 ||
				res == null ||
				res.data == null ||
				res.data.length <= 0) {

				console.error('god bless you...');
				return;
			}

			if (typeof res.data === 'string') {
				res.data = res.data.trim().replace(/\n|\\n|\r|\s/g, '');
				res.data = JSON.parse(res.data);
			}
			that.setData({
				showQr: res.data.showQr
			});
		});
		app.api.get(Constant.ACCESS_TOKEN_URL, { 'utm_source': 'weapp', 'utm_medium': 'face' }).then((res) => {
			this.setData({
				access: res.data.access_token
			});
			wx.getImageInfo({
				src: Config.api.host + Constant.QRCODE_URL.replace('{qrcode}', res.data.access_token),
				success: (res) => {
					that.setData({
						qrcodeTemp: res.path
					});
				},
				faile: () => {
					that.setData({
						qrcodeTemp: '../../images/gh_af8c734ca5ee_258.jpg'
					});
				},
				complete: () => {
					if (!this.data.qrcodeTemp) {
						this.setData({
							qrcodeTemp: '../../images/gh_af8c734ca5ee_258.jpg'
						});
					}
				}
			});
		});
		try {
			var res = wx.getSystemInfoSync()
			// console.log(res.model)
			// console.log(res.pixelRatio)
			console.log(res.windowWidth)
			console.log(res.windowHeight)
			// console.log(res.language)
			// console.log(res.version)
			// console.log(res.platform)
			this.setData({
				windowHeight: res.windowHeight,
				windowWidth: res.windowWidth
			});
		} catch (e) {
			// Do something when catch error
		}
	}
});
