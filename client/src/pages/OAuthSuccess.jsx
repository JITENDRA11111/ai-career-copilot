import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import LoadingAnimation from "../components/LoadingAnimation";

const EXCHANGE_API = `${import.meta.env.VITE_API_URL}/auth/exchange-code`;

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      navigate("/login");
      return;
    }

    const exchangeOAuthCode = async () => {
      try {
        const response = await axios.post(EXCHANGE_API, { code });
        if (response.data.success) {
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("OAuth Exchange Error:", err);
        navigate("/login");
      }
    };

    exchangeOAuthCode();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 font-sans p-6">
      <div className="max-w-xs text-center space-y-4">
        <LoadingAnimation />
        <h3 className="text-lg font-bold text-slate-100 mt-4">Completing Sign-In</h3>
        <p className="text-xs text-slate-400">Authenticating with Google and establishing secure session...</p>
      </div>
    </div>
  );
}
