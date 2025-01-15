import OAuth from "oauth-1.0a";
import crypto from "crypto";

// Replace with your Twitter API credentials
export const TWITTER_API_KEY = " ";
export const TWITTER_API_SECRET = " ";
export const CALLBACK_URL = "https://danny3000.privy.dev/api/auth/callback";

// Initialize OAuth 1.0a
export const oauth = new OAuth({
  consumer: {
    key: TWITTER_API_KEY,
    secret: TWITTER_API_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});
