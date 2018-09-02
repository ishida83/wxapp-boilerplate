//url相关
const BASE_URL = 'http://gank.io/api';
const GET_JAPAN_GIRL = '/api/timeline/instagram';
const GET_JAPAN_GIRL_SPECIFIC = '/api/mongo-star-timeline/{who}?source=instagram';
const PROXY_IMAGE = 'https://m.s1ar.cc/images/';
const ACCESS_TOKEN_URL = '/account/wechat-accesstoken/wx90310691e16c6d46/042758e035d26081ec216f413848890c';
const QRCODE_URL = '/account/wechat-qrcode/{qrcode}';
const RECOMMENDATION = '/api/recommendation?utm_source=weapp';
// const GET_URL = BASE_URL.concat('/history/content/100/1');
// const GET_MEIZHI_URL = BASE_URL.concat('/data/%E7%A6%8F%E5%88%A9/10/');
// const OPEN_URL= 'https://api.weixin.qq.com/sns/jscode2session?appid=wx2b1772edcf098165&secret=a54792d9c11f3aa1c9488fbfdd11ba2f&js_code={JSCODE}&grant_type=authorization_code';

//error相关
// const ERROR_DATA_IS_NULL = '获取数据为空，请重试';

//各个page的URL
// const PAGE_MAIN = '/pages/main/main';
// const PAGE_SPECIFIC = '/pages/specific/specific';
// const PAGE_POST = '/pages/post/post';

module.exports = {
    BASE_URL: BASE_URL,
    GET_JAPAN_GIRL: GET_JAPAN_GIRL,
    PROXY_IMAGE: PROXY_IMAGE,
    GET_JAPAN_GIRL_SPECIFIC: GET_JAPAN_GIRL_SPECIFIC,
    ACCESS_TOKEN_URL,
    QRCODE_URL,
    RECOMMENDATION
    // GET_URL: GET_URL,
    // ERROR_DATA_IS_NULL: ERROR_DATA_IS_NULL,
    // PAGE_MAIN: PAGE_MAIN,
    // PAGE_SPECIFIC: PAGE_SPECIFIC,
    // PAGE_POST: PAGE_POST,
    // GET_MEIZHI_URL: GET_MEIZHI_URL,
    // OPEN_URL:OPEN_URL,
}
