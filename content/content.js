const css = `
* {
    user-select: text !important;
    -moz-user-select: text !important;
    -webkit-user-select: text !important;
}
body > p {
    display:none !important;
}
::selection {
    background-color: #1D4ED8;
    background-color: #2563EB;
    background-color: #3B82F6;
    background-color: #FF4500;
    background-color: #05C30C;
    background-color: #7A6BFF;
    color: #F5F5F5;
}
@keyframes animate {
    0% {
        background-color: #3B82F6;
        box-shadow: 0 0 3px 2px #3B82F6;
    }
    40% {
        background-color: #05C30C;
        box-shadow: 0 0 3px 2px #05C30C;
    }
    60% {
        background-color: #3B82F6;
        box-shadow: 0 0 3px 2px #3B82F6;
    }
    100% {
        background-color: #05C30C;
        box-shadow: 0 0 3px 2px #05C30C;
    }
}
.animate {
    animation: animate 0.4s ease !important;
}
.hight-light-text * {
    color: #343dff !important;
    background-color: transparent !important;
}
.ictu-page-test__test-panel__user-info>div>div:first-child {
    padding: 1px;
    border-radius: 50%;
}
.app-version{
    cursor: pointer;
    user-select: none !important;
}
`;
const lba = ["A.", "B.", "C.", "D."];
let selectID = null;
let selectIDs = [];
let arr = [];
let nav = null;
let btnStatus = null;
let labelStatus = null;
let imgData = [];
const styleW = `
  color: #FCD53F; 
  background-color: #464185; 
  padding: 4px 12px 4px 4px; 
  border-radius: 50px;
`;
const styleS = `
  color: #00D26A; 
  background-color: #464185; 
  padding: 4px 12px 4px 4px; 
  border-radius: 50px;
`;
const styleE = `
  color: #F8312F; 
  background-color: #464185; 
  padding: 4px 12px 4px 4px; 
  border-radius: 50px;
`;
let settings = {};

//func remove all format
function cleanString(input) {
  return input
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[.,;:{}[\]()?""]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .trim();
}

//func clean line break and multiply space
function cleanHtml(input) {
  return input
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

//func append css
function appendCSS(style) {
  const css = document.createElement("style");
  css.innerHTML = style;
  css.className = "syluu-style";
  document.head.appendChild(css);
}

//function animation
function animate(elem) {
  elem.classList.add("animate");
  setTimeout(() => {
    elem.classList.remove("animate");
  }, 400);
}

//func upload blob to server
async function upload(blobUrl) {
  try {
    const fileName = blobUrl.split("/").pop();
    const existingImg = imgData.find((img) => img.name === fileName);
    if (existingImg) return existingImg;

    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error("error fetch blob url");
    }
    const blob = await response.blob();
    const formData = new FormData();
    console.log(imgData);
    formData.append("file", blob);

    const uploadResponse = await fetch(
      "https://luusytruong.xyz/lms/api/temp.php",
      {
        method: "POST",
        body: formData,
      }
    );
    if (!uploadResponse.ok) {
      throw new Error("error fetch server");
    }
    const data = await uploadResponse.json();
    imgData.push({
      name: fileName,
      link: data.link,
    });
    console.log(data);
    return data;
  } catch (e) {
    console.log("upload function: " + e);
    return {
      link: "../images/error_img.png",
    };
  }
}

//func create question html
async function getQuestion(qi, q, img, objectOption) {
  try {
    async function op() {
      const dataOj = objectOption.data;
      console.log("==============================================");
      return Promise.all(
        dataOj.map(async (option, i) => {
          let isCorrect = null;
          if (selectID !== null) {
            isCorrect = i === selectID;
          } else {
            isCorrect = selectIDs.includes(i);
          }
          let optionImg;
          if (objectOption.key !== "text") {
            optionImg = await upload(option.src);
          }
          console.log(
            `%c${lba[i]} ${option.innerText}`,
            `color: ${isCorrect ? "#00EE00" : ""};`
          );
          const optionHtml =
            objectOption.key === "text"
              ? `
            <div class="${isCorrect ? "answer choose" : "answer"}">
            <p>${isCorrect ? "*" : ""}${
                  lba[i] +
                  " " +
                  option.innerText
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;")
                }</p>
            </div>
            `
              : `
            <div class="img ${isCorrect ? "answer choose" : "answer"}">
            <p>${isCorrect ? "*" : ""}${lba[i]}</p>
            <div class="img"><img src="${optionImg.link}"></div>
            </div>
            `;
          return optionHtml;
        })
      ).then((htmlArray) => htmlArray.join(""));
    }
    let imgHtml = "";
    if (img) {
      const data = await upload(img.src);
      imgHtml = `<img class="question-image"src="${data.link}">`;
    }
    let optionsHtml = await op();
    return cleanHtml(`
        <div class="question-head">
        <p class="question-label">Question ${qi}</p>
        <p class="question-content">${q.innerText}</p>
        ${imgHtml}
        </div>
        <div class="question-body">
        ${optionsHtml}
        </div>
    `);
  } catch (e) {
    alert("get question function: " + e);
  }
}

//func load question in html
async function load() {
  try {
    const questionNum = parseInt(
      document
        .querySelector(".present-single-question__head legend")
        .innerText.replaceAll("Câu ", "")
        .replaceAll(":", "")
    );
    const questionContent = document.querySelector(
      ".present-single-question__head p"
    );
    const questionImg = document.querySelector(
      ".present-single-question__head img"
    );
    let options = Array.from(
      document.querySelectorAll(".present-single-question__body label")
    );
    let objectOption = null;
    if (questionContent) {
      for (const option of options) {
        if (option.innerText !== "") {
          objectOption = { key: "text", data: options };
          arr[questionNum - 1] = await getQuestion(
            questionNum,
            questionContent,
            questionImg,
            objectOption
          );
          break;
        } else {
          options = Array.from(
            document.querySelectorAll(".present-single-question__body img")
          );
          if (options.length) {
            objectOption = { key: "img", data: options };
            arr[questionNum - 1] = await getQuestion(
              questionNum,
              questionContent,
              questionImg,
              objectOption
            );
          } else {
            alert("Không phải chữ hoặc ảnh");
          }
          break;
        }
      }
      saveToStorage("questions", arr);
      animate(btnStatus);
    } else {
      alert("câu này bị lỗi, dùng CTRL + S để lưu lại rồi gửi cho tao");
    }
  } catch (e) {
    alert("load to save function: " + e.message);
  }
}

//func select answer
let dataSet = null;
let qContent = "";
async function select() {
  try {
    console.log("%c🔴 debug select", styleE);
    settings = await getFromStorage("settings");
    if (settings.mark || settings.auto) {
      const dataJson = await getFromStorage("json");
      const qElem = document.querySelector(".present-single-question__head p");
      if (qElem && dataJson != null && dataJson.length > 0) {
        dataSet = new Set(dataJson);
        qContent = qElem.innerText;
        console.log(dataSet);
      } else {
        console.log(
          "%cquestion not found or data from storage empty",
          "color: red"
        );
      }
    }
    selectID = null;
    selectIDs = [];
    const ops = document.querySelectorAll(
      ".present-single-question__body label"
    );

    if (ops.length > 0) {
      const checkElems = document.querySelectorAll(
        '.present-single-question__body input[type="checkbox"]'
      );
      ops.forEach((ans, i) => {
        if (settings.mark || settings.auto) {
          const answerText = cleanString(qContent + ans.innerText);
          if (dataSet.has(answerText)) {
            settings.mark ? ans.classList.add("hight-light-text") : null;
            settings.auto ? ans.click() : null;
            console.log("correct: " + ans.innerText);
          } else {
            console.log("wrong: " + ans.innerText);
          }
        }
        if (checkElems[i]) {
          checkElems[i].addEventListener("change", function () {
            if (this.checked) {
              if (!selectIDs.includes(i)) {
                selectIDs.push(i);
              }
            } else {
              selectIDs = selectIDs.filter((index) => index !== i);
            }
            load();
          });
        } else {
          ans.addEventListener("click", () => {
            selectID = i;
            if (selectID !== null) {
              load();
            }
          });
        }
      });
    }
  } catch (e) {
    alert("select function: " + e.message);
  }
}

//func create btn
function addEventBtnStatus() {
  try {
    btnStatus = document.querySelector(".app-version__connect-status");
    labelStatus = document.querySelector(".app-version");
    //listener e click btn
    labelStatus.addEventListener("click", () => {
      select();
    });
    //listener e click btn
    nav.querySelector("button").addEventListener("click", () => {
      setTimeout(() => {
        select();
      }, 100);
    });
    //call
    animate(btnStatus);
    select();
  } catch (e) {
    alert("add event btn status function: " + e);
  }
}

//func save to storage local
function saveToStorage(name, data) {
  try {
    if (chrome && chrome.storage) {
      chrome.storage.local.set({ [name]: data });
    } else {
      alert("Error: Chrome not exist");
    }
  } catch (e) {
    alert("save function: " + e.message);
  }
}

//func load data in storage local
function getFromStorage(key) {
  return new Promise((resolve, reject) => {
    try {
      if (chrome && chrome.storage) {
        chrome.storage.local.get([key], function (result) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            if (result[key] !== undefined) {
              resolve(result[key]);
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

//func interval
function interval() {
  const interval = 1000;
  console.clear();
  function intervalBtnNext() {
    console.log("%c🟡 wait add event btn ...", styleW);
    const intervalId = setInterval(() => {
      nav = document.querySelector(".ictu-page-test__test-panel__single-nav");
      if (nav) {
        console.log("%c🟢 add event btn styleSful", styleS);
        //call
        clearInterval(intervalId);
        intervalEventA();
        addEventBtnStatus();
      }
    }, interval);
  }
  function intervalEventA() {
    console.log("%c🟡 wait add event logo ...", styleW);
    const intervalId = setInterval(() => {
      const a = document.querySelector(".m-header a");
      if (a) {
        console.log("%c🟢 add event logo styleSful", styleS);
        //call
        clearInterval(intervalId);
        intervalBtnNext();
      }
    }, interval);
  }
  intervalBtnNext();
}

function getNewInfo() {
  return new Promise((resolve, reject) => {
    fetch("https://luusytruong.xyz/lms/other/version.php")
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch((e) => reject(e));
  });
}

const version = "1.0.3";
//
async function checkVersion() {
  const newInfo = await getNewInfo();
  if (version === newInfo.version) {
    console.log("version duplicate");
    //start
    appendCSS(css);
    interval();
  } else {
    console.log("version no duplicate");
    alert(
      `Phiên bản mới ${newInfo.version} hãy "git pull", thoát ra và mở lại trình duyệt`
    );
  }
}

async function start() {
  if (chrome) {
    // chrome.storage.sync.clear(function () {
    //   console.log("Tất cả dữ liệu đã được xóa khỏi chrome.storage.sync");
    // });
    // chrome.storage.local.clear(function () {
    //   console.log("Tất cả dữ liệu đã được xóa khỏi chrome.storage.local");
    // });
    // chrome.storage.sync.get(null, function (data) {
    //   console.log(data);
    // });
    chrome.storage.local.get(null, function (data) {
      console.log(data);
    });
    const urlBrowser = window.location.href;
    if (urlBrowser.includes("lms.ictu.edu.vn")) {
      settings = await getFromStorage("settings");
      if (settings && typeof settings === "object") {
        settings.toggle ? checkVersion() : null;
      }
    }
  }
}
start();
