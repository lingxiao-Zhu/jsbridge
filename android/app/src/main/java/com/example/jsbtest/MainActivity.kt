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

    inner class WebviewInterface {
      @JavascriptInterface
      fun showToast(msg: String){
        Log.d("aaa", msg)
        val msgObj = Gson().fromJson(msg, JSONObject::class.java)
        Log.d("aaa", msgObj.toString())
        val content = msgObj.getJSONObject("params").getString("content");
        Toast.makeText(this@MainActivity,content, Toast.LENGTH_SHORT).show()
      }
    }

    @SuppressLint("SetJavascriptEnabled", "JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val webview = findViewById<WebView>(R.id.webView)

        webview.apply {
          settings.javaScriptEnabled = true
          addJavascriptInterface(WebviewInterface(), "JSBridgeApi")
        }

        webview.loadUrl("http://192.168.3.4:5000/")

    }
}
