//
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
let cooldown = true;
//
function getQuestion(qi, q, img, ops) {
  try {
    function op() {
      return ops
        .map((ans, i) => {
          if (i === ci) {
            return `<div class="answer choose"><p>*${lba[i] + " " + ans.innerText
              }</p></div>`;
          }
          return `<div class="answer">${lba[i] + " " + ans.innerText
            }<p></p></div>`;
        })
        .join("");
    }
    let imgHtml = img ? `<img class="question-image"src="${img.src}">` : "";
    let html = `
        <div class="question-head">
            <p class="question-label">Question ${qi}</p>
            <p class="question-content">${q.innerText}</p>
            ${imgHtml}
        </div>
        <div class="question-body">
            ${op()}
        </div>
    `;
    return html;
  } catch (e) {
    alert("get question function: " + e);
  }
}
//
function load() {
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
        "mat-radio-group .question-type-radio__answer-content p"
      )
    );
    if (q) {
      arr[qi - 1] = getQuestion(qi, q, img, ops).trim();
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
//
function choose() {
  try {
    let ops = document.querySelectorAll("question-type-radio label");
    ops.forEach((ans, i) => {
      ans.addEventListener("click", () => {
        ci = i;
        if (ci !== null) {
          console.log(ans.querySelector("p").innerText, i);
          load();
        }
      });
    });
  } catch (e) {
    alert("choose function: " + e);
  }
}
//
let btnSave = null;
//
function createBtnSave() {
  try {
    let nav = document.querySelector(
      ".ictu-page-test__test-panel__single-nav__navigation"
    );
    if (nav && !document.getElementById("syluu")) {
      btnSave = document.createElement("button");
      btnSave.id = "syluu";
      btnSave.innerText = "Status";
      btnSave.title = 'Load question index'
      let cssBtn = document.createElement("style");
      cssBtn.innerHTML = css;
      document.head.appendChild(cssBtn);
    }
    nav.appendChild(btnSave);
    choose();
    btnSave.previousElementSibling.addEventListener("click", () => {
      setTimeout(() => {
        choose();
      }, 300);
    });
    //
    btnSave.addEventListener("click", () => {
      choose()
    });
  } catch (e) {
    alert("create btn function: " + e);
  }
}
//
function saveToStorage(arr) {
  try {
    chrome.storage.local.set({ questions: arr }, function () {
      console.log("Array saved to storage:", arr);
    });
  } catch (e) {
    alert("save function: " + e);
  }
}
//
function loadToStorage() {
  try {
    if (chrome !== undefined && chrome.storage) {
      chrome.storage.local.get(["questions"], function (result) {
        if (result.questions) {
          arr = result.questions;
          console.log("Array loaded from storage:", arr);
        }
      });
    } else {
      console.log("chrome not exist");
    }
  } catch (e) {
    alert("load from storage function 214: " + e);
  }
}
//
let intervalId = setInterval(() => {
  let nav = document.querySelector(
    ".ictu-page-test__test-panel__single-nav__navigation"
  );
  if (nav) {
    console.clear();
    createBtnSave();
    clearInterval(intervalId);
  }
}, 1000);
//
