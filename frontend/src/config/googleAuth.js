const configuredGoogleClientId = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
).trim();

// Avoid sending the sample value in .env.example to Google as if it were a
// usable credential. The client ID is public, but it must still be real.
const isPlaceholder = configuredGoogleClientId.startsWith(
  "your_google_oauth_client_id",
);

const googleClientId = isPlaceholder ? "" : configuredGoogleClientId;
const isGoogleAuthConfigured = Boolean(googleClientId);

export { googleClientId, isGoogleAuthConfigured };
