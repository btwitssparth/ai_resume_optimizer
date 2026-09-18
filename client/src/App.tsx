import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import { ToastProvider } from "./contexts/ToastContext";
import { AppProvider } from "./contexts/AppContext";
import Toast from "./components/ui/Toast";
import AppShell from "./components/AppShell";
import LoginPage from "./views/LoginPage";
import { useEffect, useState } from "react";

function SessionGuard() {
  const { signOut } = useClerk();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = async () => {
      setMessage("Your session has expired. Please sign in again.");
      try { await signOut(); } catch {}
    };
    window.addEventListener("ats:session-expired", handler);
    return () => window.removeEventListener("ats:session-expired", handler);
  }, [signOut]);

  return message ? <LoginPage /> : <SessionGuard />;
}

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        
        <SignedIn>
          <AppShell />
        </SignedIn>

        <SignedOut>
          <LoginPage />
        </SignedOut>

      </AppProvider>
      
      {/* Toast notifications render globally */}
      <Toast />
    </ToastProvider>
  );
}

export default App;