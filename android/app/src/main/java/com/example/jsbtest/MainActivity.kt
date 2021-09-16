package com.example.jsbtest

import android.annotation.SuppressLint
import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import com.google.gson.Gson
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private val DISPATCH_SCHEMA = "nativeapp://dispatch_message/"
    private val SET_RESULT_SCHEMA = "nativeapp://set_result_message/"

    lateinit var webview: WebView

    data class Params(val content: String)

    data class Msg(val event: String, val params: Params,val  callbackId: String)

    inner class WebviewInterface {
      @JavascriptInterface
      fun showToast(msg: String){
        val msgObj = Gson().fromJson(msg, Msg::class.java)
        val content = msgObj.params.content;
        Toast.makeText(this@MainActivity,content, Toast.LENGTH_SHORT).show()
        webview.post {
          webview.loadUrl("javascript:window.JSBridge.handleFromNative('${msgObj.callbackId}', 'done')")
        }
      }
    }

    private val webViewClient = object : WebViewClient(){
      override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
        Log.d("tag", url + '1')
        // 接收到jsb请求
        if(url!!.contains(DISPATCH_SCHEMA)){
          webview.loadUrl("javascript:window.JSBridge.fetchMsgQueue()")
          return false;
        }
        // 加载jsb信息
        if(url.contains(SET_RESULT_SCHEMA)){
          Log.d("tag111", url)
          return false
        }
        return false
//        return super.shouldOverrideUrlLoading(view, url)
      }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
      setContentView(R.layout.activity_main)

      webview = findViewById<WebView>(R.id.webView)

      webview.webViewClient = webViewClient

      webview.apply {
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        loadUrl("http://192.168.3.4:5000/")
      }
    }

//    @SuppressLint("SetJavascriptEnabled", "JavascriptInterface")
//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        setContentView(R.layout.activity_main)
//
//        webview = findViewById<WebView>(R.id.webView)
//
//        webview.apply {
//          settings.javaScriptEnabled = true
//          addJavascriptInterface(WebviewInterface(), "JSBridgeApi")
//          loadUrl("http://192.168.3.4:5000/")
//        }
//    }
}
