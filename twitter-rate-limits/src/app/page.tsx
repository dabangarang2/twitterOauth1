"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [tokens, setTokens] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.has("oauth_token")) {
      setTokens({
        oauth_token: searchParams.get("oauth_token"),
        oauth_token_secret: searchParams.get("oauth_token_secret"),
        user_id: searchParams.get("user_id"),
        screen_name: searchParams.get("screen_name"),
      });
    }
  }, [searchParams]);

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/twitter");
      const data = await response.json();
      console.log({ data });
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Error starting auth flow:", error);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Twitter OAuth 1.0a Example</h1>

      {!tokens ? (
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600"
        >
          Login with Twitter
        </button>
      ) : (
        <div className="bg-black-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">
            Authentication Successful!
          </h3>
          <div className="space-y-2">
            <p>
              <strong>Access Token:</strong> {tokens.oauth_token}
            </p>
            <p>
              <strong>Access Token Secret:</strong> {tokens.oauth_token_secret}
            </p>
            <p>
              <strong>User ID:</strong> {tokens.user_id}
            </p>
            <p>
              <strong>Screen Name:</strong> {tokens.screen_name}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
