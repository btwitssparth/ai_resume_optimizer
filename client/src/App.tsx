import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import { ToastProvider } from "./contexts/ToastContext";
import { AppProvider } from "./contexts/AppContext";
import Toast from "./components/ui/Toast";
import AppShell from "./components/AppShell";
import LoginPage from "./views/LoginPage";
import { useEffect } from "react";

function SessionGuard() {
  const { signOut } = useClerk();

  useEffect(() => {
    const handler = async () => {
      try {
        await signOut();
      } catch {}
    };

    window.addEventListener("ats:session-expired", handler);

    return () => {
      window.removeEventListener("ats:session-expired", handler);
    };
  }, [signOut]);

  return <AppShell />;
}

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <SignedIn>
          <SessionGuard />
        </SignedIn>

        <SignedOut>
          <LoginPage />
        </SignedOut>
      </AppProvider>

      <Toast />
    </ToastProvider>
  );
}

export default App;