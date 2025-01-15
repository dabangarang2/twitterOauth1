import { NextRequest, NextResponse } from "next/server";
import { oauth } from "@/app/constants";
import { decrypt } from "@/app/lib/encryption";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const oauth_token = searchParams.get("oauth_token");
  const oauth_verifier = searchParams.get("oauth_verifier");

  if (!oauth_token || !oauth_verifier) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Get the encrypted token secret from cookies
  const encryptedData = request.cookies.get("token_secret_data")?.value;
  const iv = request.cookies.get("token_secret_iv")?.value;

  if (!encryptedData || !iv) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  try {
    const oauth_token_secret = decrypt(encryptedData, iv);
    const request_data = {
      url: "https://api.twitter.com/oauth/access_token",
      method: "POST",
      data: {
        oauth_token,
        oauth_verifier,
      },
    };

    const token = {
      key: oauth_token,
      secret: oauth_token_secret,
    };

    const response = await fetch(request_data.url, {
      method: request_data.method,
      headers: oauth.toHeader(oauth.authorize(request_data, token)),
    });

    const responseText = await response.text();
    const parsedResponse = new URLSearchParams(responseText);

    // In a real app, you'd store these tokens securely
    const accessToken = {
      oauth_token: parsedResponse.get("oauth_token"),
      oauth_token_secret: parsedResponse.get("oauth_token_secret"),
      user_id: parsedResponse.get("user_id"),
      screen_name: parsedResponse.get("screen_name"),
    };

    // Verify credentials with the new access token
    const verify_request = {
      url: "https://api.twitter.com/1.1/account/verify_credentials.json",
      method: "GET",
    };

    const verify_token = {
      key: accessToken.oauth_token,
      secret: accessToken.oauth_token_secret,
    };

    const verify_response = await fetch(verify_request.url, {
      method: verify_request.method,
      headers: oauth.toHeader(oauth.authorize(verify_request, verify_token)),
    });

    if (!verify_response.ok) {
      throw new Error("Failed to verify credentials");
    }

    const user_data = await verify_response.json();
    console.log({ user_data });

    // Create response with redirect
    const response_obj = NextResponse.redirect(
      `https://danny3000.privy.dev/?${new URLSearchParams(accessToken)}`
    );

    // Clear the token secret cookies
    response_obj.cookies.delete("token_secret_data");
    response_obj.cookies.delete("token_secret_iv");

    return response_obj;
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      { error: "Failed to get access token" },
      { status: 500 }
    );
  }
}
