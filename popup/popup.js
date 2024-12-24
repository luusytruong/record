let arr = [];
let json = null;

//func save data to storage
function saveToStorage(key, data) {
  return new Promise((resolve, reject) => {
    try {
      if (chrome !== undefined && chrome.storage) {
        chrome.storage.local.set({ [key]: data }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError));
          } else {
            resolve(true);
          }
        });
      } else {
        reject(new Error("Chrome is not available"));
      }
    } catch (e) {
      reject(new Error(e.message));
    }
  });
}

//func load data from storage
function getFromStorage(key) {
  return new Promise((resolve, reject) => {
    try {
      if (chrome !== undefined && chrome.storage) {
        chrome.storage.local.get([key], (data) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError));
          } else {
            if (data[key] != undefined) {
              resolve(data[key]);
            } else {
              resolve(null);
            }
          }
        });
      } else {
        reject(new Error("Chrome storage is not available"));
      }
    } catch (e) {
      reject(new Error(e.message));
    }
  });
}

//btn upload show
const bU = document.getElementById("btn-upload");
if (bU) {
  bU.addEventListener("click", async () => {
    json = await getFromStorage("json");
    const inputField = document.getElementById("upload-text");
    if (inputField) {
      inputField.value = json;
      toast("Successful", "JSON have been loaded");
      document.getElementById("upload").classList.add("active");
    }
  });
}

//btn upload send
const bUS = document.getElementById("btn-send");
if (bUS) {
  bUS.addEventListener("click", async () => {
    const inputField = document.getElementById("upload-text");
    json = inputField.value;
    if (saveToStorage("json", json))
      toast("Successful", "JSON saved to storage");
  });
}

//btn upload cancel
const bUC = document.getElementById("btn-cancel-u");
if (bUC) {
  bUC.addEventListener("click", () => {
    const form = document.getElementById("upload");
    form.classList.add("animate");
    setTimeout(() => {
      form.className = "";
    }, 500);
  });
}

//btn show setting
const bS = document.getElementById("btn-setting");
if (bS) {
  bS.addEventListener("click", () => {
    const settingForm = document.getElementById("setting");
    settingForm.classList.add("active");
  });
}

//click handler input checkbox form setting
const bHL = document.getElementById("high-light");
let highLight;
let ok = false;
if (bHL) {
  bHL.addEventListener("change", async () => {
    if (bHL.checked) {
      if (saveToStorage("high_light", 1)) toast("Successful", "High light on");

      highLight = await getFromStorage("high_light");
      console.log("on" + highLight);
    } else {
      if (saveToStorage("high_light", 0)) toast("Successful", "High light off");
      saveToStorage("json", "");
      highLight = await getFromStorage("high_light");
      console.log("off" + highLight);
    }
    call();
  });
}

//btn setting cancel
const bSC = document.getElementById("btn-cancel");
if (bSC) {
  bSC.addEventListener("click", () => {
    const settingForm = document.getElementById("setting");
    settingForm.classList.add("animate");
    setTimeout(() => {
      settingForm.className = "";
    }, 500);
  });
}

//btn expand
const bE = document.getElementById("btn-expand");
if (bE) {
  bE.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}

//btn filter
const bF = document.getElementById("btn-filter");
if (bF) {
  bF.addEventListener("click", () => {
    const url = "https://luusytruong.github.io/deduplicates/";
    window.open(url, "_blank");
  });
}

//btn show clear form
const bC = document.getElementById("btn-clear");
if (bC) {
  bC.addEventListener("click", () => {
    document.querySelector(".form").classList.add("active");
  });
}

//btn no form clear
const bN = document.getElementById("btn-no");
if (bN) {
  bN.addEventListener("click", () => {
    document.querySelector(".form").classList.add("animate");
    setTimeout(() => {
      document.querySelector(".form").className = "form";
    }, 600);
  });
}

//btn yes form clear
const bY = document.getElementById("btn-yes");
if (bY) {
  bY.addEventListener("click", async () => {
    arr = [];
    saveToStorage("questions", arr);
    call("question");
    document.querySelector(".form").classList.add("animate");
    setTimeout(() => {
      document.querySelector(".form").classList.remove("active");
      document.querySelector(".form").classList.remove("animate");
    }, 600);
  });
}

//func load question and show
function load(arr) {
  if (arr !== null) {
    const qC = document.getElementById("question-container");
    qC.innerText = "";
    arr.forEach((html, i) => {
      if (html != null) {
        const q = document.createElement("div");
        q.className = "question";
        q.innerHTML = html;
        qC.appendChild(q);
      }
    });
  }
  toast("Successful", "All question have been loaded");
}

//toast
let timeoutId;
function toast(status, content) {
  try {
    let icon = null;
    let toastElem = document.getElementById("toast");
    toastElem.className = ``;
    clearTimeout(timeoutId);
    setTimeout(() => {
      if (status === "Successful") {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>`;
      } else if (status === "Error") {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>`;
      } else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>`;
      }
      toastElem.className = `${status.toLowerCase()}`;
      toastElem.querySelector(".toast-icon").innerHTML = icon;
      toastElem.querySelector(".toast-title").innerText = status;
      toastElem.querySelector(".toast-content").innerText = content;
      timeoutId = setTimeout(() => {
        toastElem.className = `${status.toLowerCase()} animate`;
      }, 1300);
    }, 8);
  } catch (e) {
    alert("Error: " + e);
  }
}

//func initialize
const call = async (option) => {
  if (option === "question") {
    arr = await getFromStorage("questions");
    load(arr);
  } else {
    highLight = await getFromStorage("high_light");
    if (highLight) {
      bU.classList.add("show");
      bHL.checked = true;
    } else {
      bU.className = "btn";
      bHL.checked = false;
    }
  }
};

//start
call("question");
call();
