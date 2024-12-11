//
let arr = [];
//
function saveToStorage() {
  chrome.storage.local.set({ questions: arr }, function () {
    console.log("Array saved to storage:", arr);
  });
}
//
function loadToStorage() {
  try {
    if (chrome !== undefined && chrome.storage) {
      chrome.storage.local.get(["questions"], function (result) {
        if (result.questions) {
          arr = result.questions;
          load();
        } else {
          toast("Warning", "Data not found");
        }
      });
    } else {
      toast("Error", "Chrome not exist");
    }
  } catch (e) {
    toast("Error", "Load to storage: " + e);
  }
}
//
let bC = document.getElementById("btn-clear");
//
if (bC) {
  bC.addEventListener("click", () => {
    document.querySelector(".form").classList.add("active");
  });
}
//
let bN = document.getElementById("btn-no");
//
if (bN) {
  bN.addEventListener("click", () => {
    document.querySelector(".form").classList.add("animate");
    setTimeout(() => {
      document.querySelector(".form").classList.remove("active");
      document.querySelector(".form").classList.remove("animate");
    }, 600);
  });
}
//
let bY = document.getElementById("btn-yes");
//
if (bY) {
  bY.addEventListener("click", () => {
    arr = [];
    saveToStorage();
    loadToStorage();
    document.querySelector(".form").classList.add("animate");
    toast("Successful", "All question have been deleted");
    setTimeout(() => {
      document.querySelector(".form").classList.remove("active");
      document.querySelector(".form").classList.remove("animate");
    }, 600);
  });
}
//
let bE = document.getElementById("btn-expand");
//
if (bE) {
  bE.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}
//
let bF = document.getElementById("btn-filter");
//
if (bF) {
  bF.addEventListener("click", () => {
    let url = "https://luusytruong.github.io/deduplicates/";
    window.open(url, "_blank");
  });
}
//
function load() {
  let qC = document.getElementById("question-container");
  qC.innerText = "";
  arr.forEach((html, i) => {
    if (html != null) {
      let q = document.createElement("div");
      q.className = "question";
      q.innerHTML = html;
      qC.appendChild(q);
    }
  });
  toast("Successful", "All question have been loaded");
}
//toast
let timeoutId;
function toast(status, content) {
  try {
    function timeout(option) {
      if (option === "call") {
        timeoutId = setTimeout(() => {
          toastElem.className = `${status.toLowerCase()} animate`;
        }, 4000);
      } else {
        clearTimeout(timeoutId);
      }
    }

    let icon = null;
    let toastElem = document.getElementById("toast");
    toastElem.className = ``;
    timeout();
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
      timeout("call");
    }, 1);
  } catch (e) {
    alert("Error: " + e);
  }
}
//
loadToStorage();
