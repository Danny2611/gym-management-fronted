import { BrowserRouter } from "react-router-dom";
import { AuthProviderWithRouter } from "~/contexts/AuthContext";
import Routes from "./routes/index";
import { useRegisterSW } from "virtual:pwa-register/react";
import { PWAPushNotification } from "./components/pwa/push-notification";
import { useEffect, useState } from "react";

// PWA Update Banner Component
const PWAUpdateBanner: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        right: "20px",
        background: "#1f2937",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ flex: 1 }}>
        {offlineReady ? (
          <span>Ứng dụng đã sẵn sàng để sử dụng offline!</span>
        ) : (
          <span>Có bản cập nhật mới. Nhấn "Cập nhật" để làm mới.</span>
        )}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cập nhật
          </button>
        )}
        <button
          onClick={close}
          style={{
            background: "transparent",
            color: "white",
            border: "1px solid #6b7280",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

// PWA Install Prompt Component
const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "#10b981",
        color: "white",
        padding: "12px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
      onClick={handleInstallClick}
    >
      <span>📱</span>
      <span>Cài đặt FitLife App</span>
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Check if app is running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    if (isStandalone) {
      console.log("App is running in standalone mode (PWA)");
      document.body.classList.add("standalone-mode");
    }

    // Handle network status
    const handleOnline = () => {
      console.log("App is online");
      // You can show a toast notification here
    };

    const handleOffline = () => {
      console.log("App is offline");
      // You can show an offline banner here
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProviderWithRouter>
          <PWAPushNotification>
            <Routes />
            <PWAUpdateBanner />
            <PWAInstallPrompt />
          </PWAPushNotification>
        </AuthProviderWithRouter>
      </BrowserRouter>
    </div>
  );
};

export default App;
