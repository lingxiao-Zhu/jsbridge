const iframeCallSchema = "nativeapp://dispatch_message/";
const iframeFetchSchema = "nativeapp://fetch_message/";
/**
 * 发送方法调用消息的iframe id
 */
const DISPATCH_MESSAGE_IFRAME_ID = "__JSBridgeIframe__";

/**
 * 发送方法调用队列的iframe id
 */
const SET_RESULT_IFRAME_ID = "__JSBridgeIframe_SetResult__";

class JSBridge {
  constructor() {
    this.callbackMap = {};
    this.callbackId = 0;
    this.javascriptMessageQueue = [];
    this.dispatchMessageIFrame = null;
    this.setResultIFrame = null;
  }

  call(event, params, callback) {
    const msg = {
      event,
      params,
      callbackId: this.registerCallback(callback),
    };

    if (window.JSBridgeApi) {
      // 注入 API
      // 优点：通信时间短，调用方便
      // 缺点：安卓低版本存在巨大的安全隐患
      window.JSBridgeApi[event](JSON.stringify(msg));
    } else {
      // schema 方式
      // 优点：兼容性好，安卓和 IOS 的各个版本都能支持此功能
      // 缺点：调用时延比较高 200 - 400ms，在安卓上表现明显；URL scheme 长度有限，内容过多可能会丢失字符

      // 由于通过iframe的方式，连续发送会导致客户端接收的消息丢失，所以js端把每次的msg存在数组中，
      // 客户端收到调用的信号后手动来取
      this.javascriptMessageQueue.push(msg);
      if (!this.dispatchMessageIFrame) {
        this.tryCreateIFrames();
      }
      this.dispatchMessageIFrame.src = iframeCallSchema;
    }
  }

  tryCreateIFrames() {
    this.dispatchMessageIFrame = this.createIFrame(DISPATCH_MESSAGE_IFRAME_ID);
    this.setResultIFrame = this.createIFrame(SET_RESULT_IFRAME_ID);
  }

  /**
   * 处理客户端发送过来的消息
   * @param {*} callbackId
   * @param {*} value
   */
  handleFromNative(callbackId, value) {
    this.callbackMap[callbackId](value);
  }

  registerCallback(callback) {
    this.callbackMap[++this.callbackId] = callback;
    return this.callbackId;
  }

  /**
   * 拉取JavaScript消息队列
   * @returns
   */
  fetchMsgQueue() {
    if (this.setResultIFrame && this.javascriptMessageQueue.length > 0) {
      const json = JSON.stringify(this.javascriptMessageQueue);
      const base64 = btoa(unescape(encodeURIComponent(json)));
      this.setResultIFrame.src = `${this.scheme}${this.setResultPath}&${base64}`;
      // 清空javascript消息队列
      this.javascriptMessageQueue.splice(0, this.javascriptMessageQueue.length);
      /**
       * ios以及android 4.4以上版本客户端
       * 直接通过函数返回值获取消息队列内容
       */
      return json;
    }
  }
}

window.JSBridge = new JSBridge();
