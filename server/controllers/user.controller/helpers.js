import crypto from 'crypto';

export function userResponse(user) {
  return {
    email: user.email,
    username: user.username,
    preferences: user.preferences,
    apiKeys: user.apiKeys,
    verified: user.verified,
    id: user._id,
    totalSize: user.totalSize,
    github: user.github,
    google: user.google,
    cookieConsent: user.cookieConsent
  };
}

/**
 * Create a new verification token.
 * Note: can be done synchronously - https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
 * @return Promise<string>
 */
export async function generateToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        const token = buf.toString('hex');
        resolve(token);
      }
    });
  });
}
