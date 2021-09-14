class JSBridge {
  constructor() {
    this.callbackMap = {};
    this.callbackId = 0;
  }

  call(event, params, callback) {
    const msg = {
      event,
      params,
      callbackId: this.registerCallback(callback),
    };
    // 注入 API
    // 优点：通信时间短，调用方便
    // 缺点：安卓低版本存在巨大的安全隐患，4.2以下不支持
    if (window.JSBridgeApi) {
      window.JSBridgeApi[event](params);
      // schema 方式
      // 优点：兼容性好，安卓和 IOS 的各个版本都能支持此功能
      // 缺点：调用时延比较高 200 - 400ms，在安卓上表现明显；URL scheme 长度有限，内容过多可能会丢失字符
    } else {
    }
  }

  registerCallback(callback) {
    this.callbackMap[this.callbackId++] = callback;
  }
}

window.JSBridge = new JSBridge();
