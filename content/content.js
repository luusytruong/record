//declare
let css = `
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
.highlight {
    color: #021431;
    font-weight: 500 !important;
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
let lba = ["A.", "B.", "C.", "D."];
let ci = null;
let cis = [];
let arr = [];
let nav = null;
let parentAvt = null;
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

//func append css
function appendCSS(style) {
  let css = document.createElement("style");
  css.innerHTML = style;
  css.id = "syluu-style";
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
      let dataOj = objectOption.data;
      return Promise.all(
        dataOj.map(async (option, i) => {
          let isCorrect = null;
          if (ci !== null) {
            isCorrect = i === ci;
          } else {
            isCorrect = cis.includes(i);
          }
          let optionImg;
          if (objectOption.key !== "text") {
            optionImg = await upload(option.src);
          }
          console.log(
            "%c" + (isCorrect ? "correct: " : "wrong: "),
            `color: ${isCorrect ? "#00FF00" : "#FF0000"}; font-weight: bold;`,
            option.innerText
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
        <br>
        </div>
    `;
  } catch (e) {
    alert("get question function: " + e);
  }
}

//func load question in html
async function load() {
  try {
    let qi = parseInt(
      document
        .querySelector(".present-single-question__head legend")
        .innerText.replaceAll("Câu ", "")
        .replaceAll(":", "")
    );
    let q = document.querySelector(".present-single-question__head p");
    let img = document.querySelector(
      ".present-single-question__head p + figure img"
    );
    let ops = Array.from(
      document.querySelectorAll(
        ".present-single-question__body label>div p:first-child"
      )
    );
    let objectOption = null;
    if (q) {
      if (ops.length) {
        objectOption = { key: "text", data: ops };
        arr[qi - 1] = await getQuestion(qi, q, img, objectOption);
      } else {
        ops = Array.from(
          document.querySelectorAll(
            "mat-radio-group .question-type-radio__answer-content img"
          )
        );
        if (ops.length) {
          objectOption = { key: "img", data: ops };
          arr[qi - 1] = await getQuestion(qi, q, img, objectOption);
        } else {
          alert("Không phải chữ hoặc ảnh");
        }
      }
      saveToStorage("questions", arr);
      animate(btnStatus);
    } else {
      alert("câu này bị lỗi, dùng CTRL + S để lưu lại rồi gửi cho tao");
    }
  } catch (e) {
    alert("load to save function: " + e);
  }
}

//func select answer
let dataJson = null;
async function select() {
  try {
    console.log("%c🔴 debug select", styleE);
    ci = null;
    cis = [];
    let correctA = null;
    let q = document.querySelector(".present-single-question__head p");
    console.log(q.innerText.trim());
    if (q) {
      dataJson = await getFromStorage("json");
      if (dataJson != null) {
        dataJson = JSON.parse(dataJson);
        console.log(dataJson);
        dataJson.forEach((question) => {
          if (q.innerText.trim() === question.content) {
            correctA = question.correctAnswer;
          }
        });
      } else {
        console.log("json rong");
      }
    }
    let ops = document.querySelectorAll(".present-single-question__body label");
    if (ops.length >= 0) {
      let checkElems = document.querySelectorAll(
        '.present-single-question__body input[type="checkbox"]'
      );
      ops.forEach(async (ans, i) => {
        //check correct
        if (correctA != null) {
          let answer = ans.querySelector("p");
          if (answer && answer.innerText.trim() === correctA) {
            answer.classList.add("highlight");
            answer.innerText += "";
          }
        } //
        if (checkElems[i]) {
          checkElems[i].addEventListener("change", function () {
            if (this.checked) {
              if (!cis.includes(i)) {
                cis.push(i);
              }
            } else {
              cis = cis.filter((index) => index !== i);
            }
            load();
          });
        } else {
          ans.addEventListener("click", () => {
            ci = i;
            if (ci !== null) {
              console.log(
                i,
                ans.querySelector("p")
                  ? ans.querySelector("p")
                  : ans.querySelector("img")
              );
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
    parentAvt = document.querySelector(
      ".ictu-page-test__test-panel__user-info>div>div:first-child"
    );
    btnStatus = document.querySelector(".app-version__connect-status");
    labelStatus = document.querySelector(".app-version");
    //call
    animate(btnStatus);
    //call
    select();
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
    alert("save function: " + e);
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
  let interval = 1000;
  console.clear();
  function intervalBtnNext() {
    console.log("%c🟡 wait add event btn ...", styleW);
    let intervalId = setInterval(() => {
      nav = document.querySelector(".ictu-page-test__test-panel__single-nav");
      if (nav) {
        console.log("%c🟢 add event btn styleSful", styleS);
        //call
        addEventBtnStatus();
        intervalEventA();
        clearInterval(intervalId);
      }
    }, interval);
  }
  function intervalEventA() {
    console.log("%c🟡 wait add event logo ...", styleW);
    let intervalId = setInterval(() => {
      let a = document.querySelector(".m-header a");
      if (a) {
        console.log("%c🟢 add event logo styleSful", styleS);
        //call
        intervalBtnNext();
        clearInterval(intervalId);
      }
    }, interval);
  }
  intervalEventA();
}

//start
appendCSS(css);
interval();
