const lba = ["A.", "B.", "C.", "D."];
let selectID = null;
let selectIDs = new Set();
let arr = [];
let nav = null;
let btnNext = null;
let btnStatus = null;
let labelStatus = null;
let imgData = [];
let settings = {};
const styleW = `color: #FCD53F; font-size: 24px;`;
const styleS = `color: #00D26A; font-size: 24px;`;
const styleE = `color: #F8312F; font-size: 24px;`;

//func remove all format
function cleanString(input) {
  return input
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
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
            isCorrect = selectIDs.has(i);
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
        <p class="question-content">${qText.innerText
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")}</p>
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
        console.log(dataSet);
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
          console.log(answerText);
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
    btnNext = nav.querySelector("button:last-child");
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        setTimeout(() => {
          select();
        }, 100);
      });
      console.log("%c🟢 add event btn successful", styleS);
      animate(btnStatus);
      select();
      intervalEventA();
    }
    const btnNextSkill = nav.querySelector("button:last-child > span");
    if (btnNextSkill) {
      btnNextSkill.addEventListener("click", () => {
        setTimeout(() => {
          select();
        }, 100);
      });
    }
  } catch (e) {
    alert("add event btn status function: " + e);
  }
}

//func interval
function intervalBtnNext() {
  console.clear();
  const navClass = ".ictu-page-test__test-panel>div:last-child";
  console.log("%c🟡 wait add event btn ...", styleW);
  const intervalId = setInterval(() => {
    nav = document.querySelector(navClass);
    if (nav) {
      clearInterval(intervalId);
      addEventElems();
    }
  }, 1000);
}

function intervalEventA() {
  console.log("%c🟡 wait add event logo ...", styleW);
  const intervalId = setInterval(() => {
    const a = document.querySelector(".m-header a");
    if (a) {
      console.log("%c🟢 add event logo successful", styleS);
      clearInterval(intervalId);
      intervalBtnNext();
    }
  }, 1000);
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

const infoUrl = `https://raw.githubusercontent.com/luusytruong/record/main/version.json`;
const infoUrl2 = "http://127.0.0.1:5500/version.json";
function getNewInfo() {
  return new Promise((resolve, reject) => {
    fetch(infoUrl)
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch((e) => reject(e));
  });
}

const version = "1.1.8";
async function checkUpdate() {
  try {
    intervalBtnNext();
    const info = await getNewInfo();
    if (info.update && info.version) {
      if (info.version !== version) {
        alert(
          `Extension có phiên bản mới ${info.version}, cập nhật và reload 🥰`
        );
      }
    }
  } catch (e) {
    intervalBtnNext();
    console.error(e);
    alert("Có lỗi khi kiểm tra phiên bản, thử lại sau!");
  }
}

async function start() {
  if (chrome) {
    settings = await getFromStorage("settings");
    if (settings && typeof settings === "object") {
      settings.toggle ? checkUpdate() : null;
    }
  }
}

if (window.location.href.includes("lms.ictu.edu.vn")) {
  start();
  btnStatus = document.querySelector(".app-version__connect-status");
  labelStatus = document.querySelector(".app-version");
  labelStatus.addEventListener("click", select);
  const pToast = document.querySelector("p-toast");
  if (pToast) {
    pToast.remove();
  }
}
const checkData = new Set();
const clickData = [];
document.addEventListener("click", (e) => {
  const tagElem = e.target.tagName ? e.target.tagName : null;
  const idElem = e.target.id ? e.target.id : null;
  const classElem = e.target.className ? e.target.className : null;
  const textElem = e.target.innerText ? e.target.innerText : null;
  const keyElem = cleanString(tagElem + idElem + classElem + textElem);
  if (checkData.has(keyElem)) return;
  const elemObj = {
    tag: tagElem,
    id: idElem,
    class: classElem,
    text: textElem,
    html: e.target.innerHTML,
  };
  checkData.add(keyElem);
  clickData.push(elemObj);
  // console.log(clickData);
});
