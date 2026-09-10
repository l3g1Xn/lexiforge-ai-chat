package app.lexiforge.alpha;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.Charset;

public class MainActivity extends Activity {
    private static final String TAG = "LexiForge";
    private static final String ASSET_FILE = "file:///android_asset/www/index.html";
    private static final int PAPER = 0xFFF3EDE0;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try { requestWindowFeature(Window.FEATURE_NO_TITLE); } catch (Throwable ignored) {}
        super.onCreate(savedInstanceState);
        paintSystemBars();
        final FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(PAPER);
        setContentView(root);
        root.post(() -> {
            try {
                bootWebView(root);
            } catch (Throwable t) {
                Log.e(TAG, "WebView bootstrap failed", t);
                showFatal(t);
            }
        });
    }

    private void paintSystemBars() {
        Window w = getWindow();
        if (w == null) return;
        if (Build.VERSION.SDK_INT >= 21) {
            w.setStatusBarColor(PAPER);
            w.setNavigationBarColor(PAPER);
        }
        if (Build.VERSION.SDK_INT >= 23) {
            View decor = w.getDecorView();
            int vis = decor.getSystemUiVisibility();
            vis |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            decor.setSystemUiVisibility(vis);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void bootWebView(FrameLayout root) {
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        try {
            settings.setAllowUniversalAccessFromFileURLs(false);
            settings.setAllowFileAccessFromFileURLs(true);
        } catch (Throwable ignored) {}
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setLoadsImagesAutomatically(true);
        settings.setBlockNetworkLoads(true);
        settings.setBlockNetworkImage(true);
        if (Build.VERSION.SDK_INT >= 21) {
            try { settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW); } catch (Throwable ignored) {}
        }
        settings.setGeolocationEnabled(false);
        settings.setSupportMultipleWindows(false);
        webView.setBackgroundColor(PAPER);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return true;
                String u = request.getUrl().toString();
                return !u.startsWith("file:///android_asset/");
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return url == null || !url.startsWith("file:///android_asset/");
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    new Handler(Looper.getMainLooper()).post(() -> loadInlineFallback());
                }
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                if (consoleMessage != null) {
                    Log.d(TAG, consoleMessage.message());
                }
                return true;
            }
        });
        loadFromAssets();
    }

    private void loadFromAssets() {
        if (webView == null) return;
        try {
            webView.loadUrl(ASSET_FILE);
        } catch (Throwable e) {
            loadInlineFallback();
        }
    }

    private void loadInlineFallback() {
        if (webView == null) return;
        try (InputStream in = getAssets().open("www/index.html");
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[4096];
            int n;
            while ((n = in.read(buf)) >= 0) bos.write(buf, 0, n);
            String html = new String(bos.toByteArray(), Charset.forName("UTF-8"));
            webView.loadDataWithBaseURL(
                    "file:///android_asset/www/",
                    html,
                    "text/html",
                    "utf-8",
                    null);
        } catch (Throwable e) {
            Log.e(TAG, "fallback failed", e);
        }
    }

    private void showFatal(Throwable t) {
        TextView tv = new TextView(this);
        tv.setTextColor(Color.BLACK);
        tv.setBackgroundColor(PAPER);
        tv.setPadding(48, 96, 48, 48);
        tv.setTextSize(18);
        tv.setGravity(Gravity.CENTER);
        tv.setText("LexiForge needs Android System WebView.\n\nEnable it, then open the app again.");
        setContentView(tv);
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                    "(function(){if(!document.getElementById('back')||document.getElementById('back').classList.contains('hidden'))return false;document.getElementById('back').click();return true;})()",
                    value -> {
                        if ("true".equals(value) || "\"true\"".equals(value)) return;
                        try { super.onBackPressed(); } catch (Throwable ignored) { finish(); }
                    });
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            try { webView.onResume(); } catch (Throwable ignored) {}
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            try { webView.onPause(); } catch (Throwable ignored) {}
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            try {
                webView.loadUrl("about:blank");
                webView.destroy();
            } catch (Throwable ignored) {}
            webView = null;
        }
        super.onDestroy();
    }
}
