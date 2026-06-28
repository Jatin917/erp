import os from 'os';

const isDev = process.env.NODE_ENV !== 'production'; // or use a custom flag
const isWindows = os.platform() === 'win32';
export const getExecutablePath = () => {
  if (isDev) {
    // Windows dev machine
    if (isWindows) {
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // or wherever your Chrome is
    } else {
      // macOS dev machine
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }
  } else {
    // Production - typically a Linux server
    return '/usr/bin/chromium-browser'; // or '/usr/bin/google-chrome' depending on your setup
  }
};

// utils/parseUrl.js
export const normalizePath = (path:string) => {
  if (!path) return "";
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
};


