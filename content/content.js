const lba = ["A.", "B.", "C.", "D."];
let selectID = null;
let selectIDs = new Set();
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
  elem.classList.add("animation-by-syluu");
  setTimeout(() => {
    elem.classList.remove("animation-by-syluu");
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
    // console.log(imgData);
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
    // console.log(data);
    return data;
  } catch (e) {
    // console.log("upload function: " + e);
    return {
      link: "../images/error_img.png",
    };
  }
}

//func create question html
async function getQuestion(qID, qText, qImg, objOptions) {
  try {
    async function op() {
      const dataOj = objOptions.data;
      // console.log("\n\n");
      return Promise.all(
        dataOj.map(async (option, i) => {
          let isCorrect = null;
          if (selectID !== null) {
            isCorrect = i === selectID;
          } else {
            isCorrect = selectIDs.includes(i);
          }
          let optionImg;
          if (objOptions.key !== "text") {
            optionImg = await upload(option.src);
          }
          // console.log(
          //   `%c${lba[i]} ${option.innerText}`,
          //   `color: ${isCorrect ? "#00EE00" : ""};`
          // );
          const optionHtml =
            objOptions.key === "text"
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
    if (qImg) {
      const data = await upload(qImg.src);
      imgHtml = `<img class="question-image"src="${data.link}">`;
    }
    let optionsHtml = await op();
    return cleanHtml(`
        <div class="question-head">
        <p class="question-label">Question ${qID}</p>
        <p class="question-content">${qText.innerText}</p>
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
    const qID = parseInt(
      document
        .querySelector(".present-single-question__head legend")
        .innerText.replaceAll("Câu ", "")
        .replaceAll(":", "")
    );
    const qText = document.querySelector(".present-single-question__head p");
    const qImg = document.querySelector(".present-single-question__head img");
    let options = Array.from(
      document.querySelectorAll(".present-single-question__body label")
    );
    let objOptions = null;
    if (qText) {
      for (const option of options) {
        if (option.innerText !== "") {
          objOptions = { key: "text", data: options };
          arr[qID - 1] = await getQuestion(qID, qText, qImg, objOptions);
          break;
        } else {
          options = Array.from(
            document.querySelectorAll(".present-single-question__body img")
          );
          if (options.length) {
            objOptions = { key: "img", data: options };
            arr[qID - 1] = await getQuestion(qID, qText, qImg, objOptions);
          } else {
            alert("Không phải chữ và ảnh");
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
      }
    }
    selectID = null;
    selectIDs.clear();
    const ops = document.querySelectorAll(
      ".present-single-question__body label"
    );

    if (ops.length > 0) {
      const checkElems = document.querySelectorAll(
        '.present-single-question__body input[type="checkbox"]'
      );
      ops.forEach((ans, i) => {
        if ((dataSet && settings.mark) || settings.auto) {
          const answerText = cleanString(qContent + ans.innerText);
          if (dataSet.has(answerText)) {
            settings.mark ? ans.classList.add("hight-light-text") : null;
            settings.auto ? ans.click() : null;
          }
        }
        if (checkElems[i]) {
          checkElems[i].addEventListener("change", function () {
            this.checked ? selectIDs.add(i) : selectIDs.delete(i);
            load();
          });
        } else {
          ans.addEventListener("click", () => {
            selectID = i;
            selectID !== null ? load() : null;
          });
        }
      });
    }
  } catch (e) {
    alert("select function: " + e.message);
  }
}

//func add event btn
function addEventElems() {
  try {
    btnStatus = document.querySelector(".app-version__connect-status");
    labelStatus = document.querySelector(".app-version");
    labelStatus.addEventListener("click", select);
    nav.querySelector("button:last-child").addEventListener("click", () => {
      setTimeout(() => {
        select();
      }, 100);
    });
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
      nav = document.querySelector("app-weekly>div>div>div:last-child");
      if (nav) {
        console.log("%c🟢 add event btn styleSful", styleS);
        clearInterval(intervalId);
        intervalEventA();
        addEventElems();
      }
    }, interval);
  }
  function intervalEventA() {
    console.log("%c🟡 wait add event logo ...", styleW);
    const intervalId = setInterval(() => {
      const a = document.querySelector(".m-header a");
      if (a) {
        console.log("%c🟢 add event logo styleSful", styleS);
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

const version = "1.1.0";
async function checkVersion() {
  const newInfo = await getNewInfo();
  if (version === newInfo.version) {
    interval();
  } else {
    alert(`Phiên bản mới ${newInfo.version} hãy "git pull"`);
  }
}

async function start() {
  if (chrome) {
    settings = await getFromStorage("settings");
    if (settings && typeof settings === "object") {
      settings.toggle ? checkVersion() : null;
    }
  }
}

start();
if (window.location.href.includes("lms.ictu.edu.vn")) {
  const pToast = document.querySelector("p-toast");
  if (pToast) {
    pToast.remove();
  }
}
