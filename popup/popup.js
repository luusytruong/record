let arr = [];
let settings = [];

function generateKey(input) {
  return input
    .replace(/\*?[A-D]\.\s*/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[.,;:{}[\]()?""]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .trim();
}

//process input to json
function processOnlyCorrect(input) {
  try {
    let sAnswers = [];
    let qContent = "";
    let next = false;

    const lines = input.trim().split("\n");
    lines.forEach((line) => {
      if (line.trim() !== "") {
        console.log(line);
        if (line.includes("Question")) {
          next = true;
        } else if (next === true) {
          qContent = line;
          next = false;
          console.log(qContent);
        } else if (/\*\s*[A-D]\./.test(line)) {
          // } else if (line.includes("*")) {
          sAnswers.push(generateKey(qContent + line));
        }
      }
    });
    if (sAnswers.length) {
      const jsonArr = JSON.stringify(sAnswers);
      console.log(sAnswers);
      if (saveToStorage("json", sAnswers)) {
        toast("Successful", "Questions have been uploaded");
        return;
      } else {
        toast("Error", "Non-JSON or Questions");
      }
    }
  } catch (e) {
    toast("Error", e);
  }
}

//func save data to storage
function saveToStorage(key, data) {
  return new Promise((resolve, reject) => {
    try {
      if (chrome && chrome.storage) {
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
      if (chrome && chrome.storage) {
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
    let copyText = await navigator.clipboard.readText();
    try {
      if (copyText !== "") {
        copyText = JSON.parse(copyText);
        if (Array.isArray(copyText)) {
          if (await saveToStorage("json", copyText)) {
            toast("Successful", "JSON have been uploaded");
            console.log(copyText);
          } else {
            toast("Error", "JSON not uploaded");
          }
        } else {
          toast("Error", "Non-JSON data");
        }
      } else {
        toast("Warning", "Clipboard empty");
      }
    } catch (e) {
      console.log("%cError: " + e.message, "color: red;");
      // toast("Error", e.message);
      processOnlyCorrect(copyText);
    } finally {
      chrome.storage.local.get(null, (data) => {
        console.log(data);
      });
    }
  });
}

//btn show setting
const bS = document.getElementById("btn-setting");
if (bS) {
  bS.addEventListener("click", async () => {
    settings = await getFromStorage("settings");
    if (settings) {
      document.getElementById("toggle").checked = settings.toggle;
      document.getElementById("mark").checked = settings.mark;
      document.getElementById("auto-select").checked = settings.auto;
    }
    const settingForm = document.getElementById("setting");
    settingForm.classList.add("active");
  });
}

//btn setting cancel and save setting data
const settingForm = document.getElementById("setting");
const iCheckboxs = document.querySelectorAll("label.option input");
if (settingForm && iCheckboxs.length) {
  iCheckboxs.forEach((elem) => {
    elem.addEventListener("change", async () => {
      const values = Array.from(iCheckboxs).map((elem) => elem.checked);
      const objSetting = {
        toggle: values[0],
        mark: values[1],
        auto: values[2],
      };
      const save = saveToStorage("settings", objSetting);
      if (save) {
        toast("Successful", "Settings saved");
      } else {
        toast("Error", "Settings not saved");
      }
    });
  });
  //close form
  settingForm.addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.add("animate");
      setTimeout(() => {
        this.className = "";
      }, 500);
    }
  });
}

//btn expand
const bE = document.getElementById("btn-expand");
if (bE) {
  bE.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
    // const url = chrome.runtime.getURL("popup/popup.html");
    // chrome.windows.create({
    //   url: url,
    //   type: "popup",
    //   state: "maximized",
    // });
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
    await saveToStorage("questions", arr);
    document.getElementById("question-container").innerHTML = "";
    document.querySelector(".form").classList.add("animate");
    setTimeout(() => {
      document.querySelector(".form").classList.remove("active");
      document.querySelector(".form").classList.remove("animate");
    }, 600);
  });
}

//func load question and show
function display(arr) {
  if (arr.length) {
    const qC = document.getElementById("question-container");
    qC.innerText = "";
    arr.forEach((html, i) => {
      if (html != null) {
        const q = document.createElement("div");
        q.className = "question";
        q.innerHTML = html;
        qC.appendChild(q);

        q.addEventListener("click", () => {
          q.classList.toggle("checked");
        });
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
      }, 2400);
    }, 8);
  } catch (e) {
    alert("Error: " + e);
  }
}

//func initialize
const loading = async (arr) => {
  if (!chrome || !chrome.storage) {
    toast("Error", "Chrome is not available");
    return;
  }
  arr = await getFromStorage("questions");
  if (arr) {
    display(arr);
  } else {
    toast("Warning", "No question data");
  }
};

//start
loading(arr);

const infoUrl = `https://raw.githubusercontent.com/luusytruong/record/main/manifest.json`;
function getInfo() {
  return new Promise((resolve, reject) => {
    fetch(infoUrl)
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch((e) => reject(e));
  });
}

async function start() {
  const info = await getInfo();
  console.log(info);
}
// start();
