package kr.brainwalk.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // 휴대폰 '글자 크기'를 크게 해 둔 경우 화면이 잘리지 않도록,
        // 글씨 크기는 앱 안의 설정(보통/크게/아주 크게)으로만 조절해요.
        try {
            WebSettings s = getBridge().getWebView().getSettings();
            s.setTextZoom(100);
        } catch (Exception e) {
            // 무시
        }
    }
}
