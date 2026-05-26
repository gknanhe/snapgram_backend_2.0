const isProduction = () => process.env.NODE_ENV === "production";

export const getClearAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: isProduction() ? "none" : "lax",
  secure: isProduction(),
});

const getAuthCookieOptions = () => ({
  ...getClearAuthCookieOptions(),
  maxAge: 15 * 24 * 60 * 60 * 1000,
});

export default getAuthCookieOptions;
