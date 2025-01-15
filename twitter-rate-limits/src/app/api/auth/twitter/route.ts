import { NextResponse } from "next/server";

import { encrypt } from "@/app/lib/encryption";
import { CALLBACK_URL, oauth } from "@/app/constants";

export async function GET() {
  try {
    const request_data = {
      url: "https://api.twitter.com/oauth/request_token",
      method: "POST",
      data: { oauth_callback: CALLBACK_URL },
    };

    const response = await fetch(request_data.url, {
      method: request_data.method,
      headers: oauth.toHeader(oauth.authorize(request_data)),
    });

    const responseText = await response.text();
    console.log({ responseText });
    const parsedResponse = new URLSearchParams(responseText);
    const oauth_token = parsedResponse.get("oauth_token");
    const oauth_token_secret = parsedResponse.get("oauth_token_secret");

    if (!oauth_token || !oauth_token_secret) {
      throw new Error("Failed to get oauth tokens");
    }

    // Encrypt the token secret
    const { encryptedData, iv } = encrypt(oauth_token_secret);

    const response_obj = NextResponse.json({
      authUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`,
    });

    // Store the encrypted token secret in a cookie
    response_obj.cookies.set("token_secret_data", encryptedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    response_obj.cookies.set("token_secret_iv", iv, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    return response_obj;
  } catch (error) {
    console.error("Error getting request token:", error);
    return NextResponse.json(
      { error: "Failed to get request token" },
      { status: 500 }
    );
  }
}
