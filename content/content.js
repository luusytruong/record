//declare
let css = `
* {
    user-select: text !important;
    -moz-user-select: text !important;
    -webkit-user-select: text !important;
}
::selection {
    background-color: #7A6BFF;
    color: #F5F5F5;
}
@keyframes animate {
    0% {
        background-color: #00EE00;
    }
    40% {
        background-color: #3B82F6;
    }
    60% {
        background-color: #00EE00;
    }
    100% {
        background-color: #3B82F6;
    }
}
#syluu.animate {
    animation: animate 0.35s ease;
}
#syluu {
    background-color: #3B82F6;
    color: #FFF;
    padding: 0 15px;
    height: 40px;
    border-radius: 50px;
    border: 0;
    transition: 0.2s;
    margin: 5px;
    user-select: none !important;
}
#syluu:hover {
    background-color: #2563EB !important
}
#syluu:active {
    background-color: #1D4ED8 !important
}
`;
let lba = ["A.", "B.", "C.", "D."];
let ci = null;
let arr = [];
let btnSave = null;
let imgData = [];
//func upload blob to server
async function upload(blobUrl) {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const formData = new FormData();
    const fileName = blobUrl.split("/").pop();
    console.log(imgData);
    const existingImg = imgData.find((img) => img.name === fileName);
    if (existingImg) return existingImg;
    formData.append("file", blob);
    const uploadResponse = await fetch(
      "https://luusytruong.xyz/lms/api/temp.php",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await uploadResponse.json();
    imgData.push({
      name: fileName,
      link: data.link,
    });
    console.log(data);
    return data;
  } catch (e) {
    console.error(e);
  }
}

//func create question html
async function getQuestion(qi, q, img, objectOption) {
  try {
    async function op() {
      let dataOj = objectOption.data;
      return Promise.all(
        dataOj.map(async (option, i) => {
          const isCorrect = i === ci;
          const optionImg = await upload(option.src);
          console.log(isCorrect ? "correct: " : "wrong: ", option.innerText);
          const optionHtml =
            objectOption.key === "text"
              ? `
            <div class="${isCorrect ? "answer choose" : "answer"}">
            <p>${isCorrect ? "*" : ""}${lba[i] + " " + option.innerText}</p>
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
    let q = document.querySelector(".present-single-question__direction p");
    let img = document.querySelector(
      ".present-single-question__direction p + figure img"
    );
    let ops = Array.from(
      document.querySelectorAll(
        "mat-radio-group .question-type-radio__answer-content p:first-child"
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
      btnSave.className = "animate";
      setTimeout(() => {
        btnSave.className = "";
      }, 400);
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
    let ops = document.querySelectorAll("question-type-radio label");
    ops.forEach((ans, i) => {
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
    });
  } catch (e) {
    alert("select function: " + e);
  }
}

//func create btn
function createBtnSave() {
  try {
    let nav = document.querySelector(
      ".ictu-page-test__test-panel__single-nav__navigation"
    );
    if (nav && !document.getElementById("syluu")) {
      btnSave = document.createElement("button");
      btnSave.id = "syluu";
      btnSave.innerText = "Status";
      btnSave.title = "Load question index";
      let cssBtn = document.createElement("style");
      cssBtn.innerHTML = css;
      document.head.appendChild(cssBtn);
      nav.appendChild(btnSave);
      select();
      createSuccess = true;
    }
    btnSave.previousElementSibling.addEventListener("click", () => {
      setTimeout(() => {
        select();
      }, 300);
    });
    //
    btnSave.addEventListener("click", () => {
      select();
    });
  } catch (e) {
    alert("create btn function: " + e);
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
  function intervalCreateBtn() {
    console.log("active interval create btn");
    let intervalId = setInterval(() => {
      let nav = document.querySelector(
        ".ictu-page-test__test-panel__single-nav__navigation"
      );
      if (nav) {
        createBtnSave();
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
          intervalCreateBtn();
        });
        clearInterval(intervalId);
        console.log("find btn do");
      }
    }, interval);
  }
  //
  intervalCheckBtnDo();
}
//
interval();
