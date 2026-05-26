const DEFAULT_CLIENT_URL = "http://localhost:5173";

const splitUrls = (value = "") =>
  value
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

export const getClientUrls = () =>
  splitUrls(
    process.env.FRONTEND_URLS ||
      process.env.FRONTEND_URL ||
      process.env.FRONTENT_URL ||
      DEFAULT_CLIENT_URL
  );

export const getClientOrigin = () => {
  const urls = getClientUrls();

  return urls.length === 1 ? urls[0] : urls;
};

export const getClientUrl = () => getClientUrls()[0] || DEFAULT_CLIENT_URL;
