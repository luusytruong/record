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
    background-color: #7A6BFF;
    color: #F5F5F5;
}
@keyframes animate {
    0% {
        background-color: #7A6BFF;
        box-shadow: 0 0 3px 2px #7A6BFF;
    }
    40% {
        background-color: #05c30c;
        box-shadow: 0 0 3px 2px #05c30c;
    }
    60% {
        background-color: #7A6BFF;
        box-shadow: 0 0 3px 2px #7A6BFF;
    }
    100% {
        background-color: #05c30c;
        box-shadow: 0 0 3px 2px #05c30c;
    }
}
.animate {
    animation: animate 0.4s ease forwards !important;
}
.ictu-page-test__test-panel__user-info>div>div:first-child {
    padding: 1px;
    border-radius: 50%;
}
.app-version__connect-status{
    cursor: pointer;
}
`;
let lba = ["A.", "B.", "C.", "D."];
let ci = null;
let cis = [];
let arr = [];
let nav = null;
let parentAvt = null;
let btnStatus = null;
let imgData = [];

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
      saveToStorage(arr);
      animate(btnStatus);
    } else {
      alert("câu này bị lỗi, dùng CTRL + S để lưu lại rồi gửi cho tao");
    }
  } catch (e) {
    alert("load to save function: " + e);
  }
}

//func select answer
function select() {
  try {
    ci = null;
    cis = [];
    let ops = document.querySelectorAll(".present-single-question__body label");
    let checkElems = document.querySelectorAll(
      '.present-single-question__body input[type="checkbox"]'
    );
    ops.forEach((ans, i) => {
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
  } catch (e) {
    alert("select function: " + e);
  }
}

//func create btn
function addEventBtnStatus() {
  try {
    parentAvt = document.querySelector(
      ".ictu-page-test__test-panel__user-info>div>div:first-child"
    );
    btnStatus = document.querySelector(".app-version__connect-status");
    //call
    animate(btnStatus);
    //call
    select();
    //listener e click btn
    btnStatus.addEventListener("click", () => {
      select();
    });
    //listener e click btn
    nav.querySelector("button").addEventListener("click", () => {
      setTimeout(() => {
        select();
      }, 300);
    });
  } catch (e) {
    alert("add event btn status function: " + e);
  }
}

//func save to storage local
function saveToStorage(arr) {
  try {
    chrome.storage.local.set({ questions: arr });
  } catch (e) {
    alert("save function: " + e);
  }
}

//func load question html in storage local
function loadToStorage() {
  try {
    if (chrome !== undefined && chrome.storage) {
      chrome.storage.local.get(["questions"], function (result) {
        if (result.questions) {
          arr = result.questions;
          // console.log("Array loaded from storage:", arr);
        }
      });
    } else {
      console.log("chrome not exist");
    }
  } catch (e) {
    alert("load from storage function 214: " + e);
  }
}

//func interval
function interval() {
  let interval = 1000;
  function intervalAddEvent() {
    console.log("active interval create btn");
    let intervalId = setInterval(() => {
      nav = document.querySelector(
        ".ictu-page-test__test-panel__single-nav__navigation"
      );
      if (nav) {
        //call
        addEventBtnStatus();
        clearInterval(intervalId);
        intervalCheckBtnDo();
        console.log("create btn successful");
      }
    }, interval);
  }
  function intervalCheckBtnDo() {
    console.clear();
    console.log("active interval find btn");
    let intervalId = setInterval(() => {
      let btn = document.querySelector(".tbl-testing-result td>div>button");
      if (btn) {
        btn.addEventListener("click", () => {
          intervalAddEvent();
        });
        clearInterval(intervalId);
        console.log("find btn do");
      }
    }, interval);
  }
  //call
  intervalCheckBtnDo();
  intervalAddEvent();
}

//start
appendCSS(css);
interval();
