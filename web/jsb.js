const iframeCallSchema = "nativeapp://dispatch_message/";
const iframeSetResultSchema = "nativeapp://set_result_message/";
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

  createIFrame(id) {
    let iframe = document.getElementById(id);
    if (!iframe || iframe.tagName !== "IFRAME") {
      iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.id = id;
      document.documentElement.appendChild(iframe);
    }
    return iframe;
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
      /**
       * android 4.4以下版本客户端通过result iframe获取消息队列内容
       *
       * 为什么base64编码前需要执行`unescape(encodeURIComponent(json))`？
       * 详情参考：https://developer.mozilla.org/zh-CN/docs/Web/API/WindowBase64/btoa#Unicode_%E5%AD%97%E7%AC%A6%E4%B8%B2
       */
      const json = JSON.stringify(this.javascriptMessageQueue);
      const base64 = btoa(unescape(encodeURIComponent(json)));
      this.setResultIFrame.src = `${iframeSetResultSchema}&${base64}`;
      // 清空javascript消息队列
      this.javascriptMessageQueue.splice(0, this.javascriptMessageQueue.length);
      // 不能有返回值，不然客户端的 loadUrl 直接返回文本展示在客户端
    }
  }
}

window.JSBridge = new JSBridge();
