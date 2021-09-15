package com.example.jsbtest

import android.annotation.SuppressLint
import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import com.google.gson.Gson
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

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

    @SuppressLint("SetJavascriptEnabled", "JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webview = findViewById<WebView>(R.id.webView)

        webview.apply {
          settings.javaScriptEnabled = true
          addJavascriptInterface(WebviewInterface(), "JSBridgeApi")
          loadUrl("http://192.168.3.4:5000/")
        }

    }
}
