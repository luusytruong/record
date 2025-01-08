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

//func remove all format
function cleanString(input) {
  return input
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[.,;:{}[\]()?""]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase()
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
    return `
        <div class="question-head">
        <p class="question-label">Question ${qi}</p>
        <p class="question-content">${q.innerText}</p>
        ${imgHtml}
        </div>
        <div class="question-body">
        ${optionsHtml}
        </div>
    `;
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
    const options = Array.from(
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
        //check correct
        if (dataSet != null && dataSet.size > 0 && ans) {
          const answerText = cleanString(qContent + ans.innerText);
          if (dataSet.has(answerText)) {
            ans.classList.add("hight-light-text");
            ans.click();
            console.log("correct: " + answerText);
          } else {
            console.log("wrong: " + answerText);
          }
        } else {
          console.log("%ccorrect data empty", "color: red");
        }
        //
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
    if (chrome !== undefined && chrome.storage) {
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
      if (typeof chrome !== "undefined" && chrome.storage) {
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

const p = document.createElement("p");
const cssNotify = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

#important {
  background: #DD0000;
  color: #fff;
  font-size: 14px;
  font-family: Inter;
  position: fixed;
  height: 30px;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  z-index: 1000;
}

#notice-developer-tools-opened{
  display: none !important
}
`;

function getNewInfo() {
  return new Promise((resolve, reject) => {
    fetch("https://luusytruong.xyz/lms/other/version.php")
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch((e) => reject(e));
  });
}

function setItemWithExpiry(key, value, ttl) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
  console.log("save new version");
}

function getItemWithExpiry(key) {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    console.log("item str not exist");
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    console.log("expiry !!!!");
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

function mili(minute) {
  return 1000 * 60 * minute;
}

const version = "1.0.0";
//
async function checkVersion() {
  let newVersion = getItemWithExpiry("new_version");
  if (!newVersion) {
    console.log("version expiry");
    const newInfo = await getNewInfo();
    newVersion = newInfo.version;
    setItemWithExpiry("new_version", newVersion, mili(60));
  }
  if (version === newVersion) {
    console.log("version duplicate");
    //start
    appendCSS(css);
    interval();
  } else {
    console.log("version no duplicate");
    appendCSS(cssNotify);
    p.id = "important";
    p.innerText = `New version ${newVersion}, current version ${version}. Please "git pull", and reopen browser.`;
    document.body.appendChild(p);
  }
}

if (chrome) {
  const urlBrowser = window.location.href;
  if (urlBrowser.includes("lms.ictu.edu.vn")) {
    checkVersion();
  }
}
