export const getStorage = (key) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
};

export const setStorage = (key, data) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
};
