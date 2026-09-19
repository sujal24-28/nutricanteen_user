import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import {
  getApiBase,
  saveCustomHost,
  testHostConnection
} from '../../services/api';
import { Server, Wifi, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';

export const ServerSettingsModal = () => {
  const { isServerSettingsOpen, setIsServerSettingsOpen, syncBackendData, showToast } = useCanteen();
  const [serverUrl, setServerUrl] = useState(() => getApiBase());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: bool, message: string }

  if (!isServerSettingsOpen) return null;

  const handleTest = async (urlToTest) => {
    const target = urlToTest || serverUrl;
    setIsTesting(true);
    setTestResult(null);
    const ok = await testHostConnection(target);
    setIsTesting(false);
    if (ok) {
      setTestResult({ ok: true, message: 'Connected successfully! (200 OK)' });
    } else {
      setTestResult({
        ok: false,
        message: 'Could not reach server. Verify phone is on the same Wi-Fi network and backend is running on port 8000.'
      });
    }
  };

  const handleSave = async () => {
    const saved = saveCustomHost(serverUrl);
    showToast('Server Updated', `Now connecting to: ${saved}`);
    setIsServerSettingsOpen(false);
    await syncBackendData();
  };

  const setPreset = (url) => {
    setServerUrl(url);
    handleTest(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-leaf-100 dark:border-leaf-900 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-leaf-100 dark:bg-leaf-900/60 text-leaf-700 dark:text-leaf-300 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Backend Server Host</h3>
              <p className="text-[10px] text-gray-400">Wi-Fi LAN IP & Port Configuration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsServerSettingsOpen(false)}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              API Base Endpoint
            </label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => {
                setServerUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="http://192.168.0.121:8000/api"
              className="w-full bg-leaf-50/50 dark:bg-gray-800 border border-leaf-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-leaf-500"
            />
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="block text-[10px] text-gray-400 font-medium mb-1">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPreset('https://ips-feeding-resumes-degree.trycloudflare.com/api')}
                className="text-[10px] bg-gold-200 dark:bg-gold-900 text-gold-950 dark:text-gold-100 font-extrabold px-2.5 py-1 rounded-lg border border-gold-400 dark:border-gold-700 hover:bg-gold-300"
              >
                ⚡ Live Cloud Server (Works on 4G / All Wi-Fi)
              </button>
              <button
                type="button"
                onClick={() => setPreset('http://192.168.0.121:8000/api')}
                className="text-[10px] bg-leaf-50 dark:bg-leaf-950 text-leaf-800 dark:text-leaf-200 font-semibold px-2 py-1 rounded-lg border border-leaf-200 dark:border-leaf-800 hover:bg-leaf-100"
              >
                Local Wi-Fi: 192.168.0.121
              </button>
              <button
                type="button"
                onClick={() => setPreset('http://192.168.0.121:8000/api')}
                className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200"
              >
                Wi-Fi: 192.168.0.121
              </button>
            </div>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.ok
                  ? 'bg-leaf-50 dark:bg-leaf-950/50 text-leaf-800 dark:text-leaf-200 border-leaf-200 dark:border-leaf-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-leaf-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="text-[11px] leading-tight">{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleTest()}
              disabled={isTesting}
              className="py-2 px-3 rounded-xl border border-leaf-300 dark:border-leaf-700 text-leaf-800 dark:text-leaf-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-leaf-50 dark:hover:bg-leaf-950 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="py-2 px-3 rounded-xl bg-leaf-600 hover:bg-leaf-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
