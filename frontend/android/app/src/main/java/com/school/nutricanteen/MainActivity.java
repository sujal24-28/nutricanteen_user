package com.school.nutricanteen;

import android.os.Bundle;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private long lastBackPressTime = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(true);
        }

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().evaluateJavascript(
                        "(function() { try { return window.__handleHardwareBack ? window.__handleHardwareBack() : false; } catch (e) { return false; } })()",
                        value -> {
                            boolean handled = "true".equalsIgnoreCase(value) || "\"true\"".equalsIgnoreCase(value);
                            if (!handled) {
                                runOnUiThread(() -> {
                                    long now = System.currentTimeMillis();
                                    if (now - lastBackPressTime < 2000) {
                                        finish();
                                    } else {
                                        lastBackPressTime = now;
                                        Toast.makeText(MainActivity.this, "Press back again to exit Mapstreak", Toast.LENGTH_SHORT).show();
                                    }
                                });
                            }
                        }
                    );
                } else {
                    finish();
                }
            }
        });
    }
}
