const query = {
  number: ".present-single-question__head fieldset legend",
  question: ".present-single-question__head fieldset div",
  group: ".present-single-question__body .mdc-form-field",
  image: ".present-single-question__head fieldset img",
  btns: "button",
  label: "Câu hỏi tiếp theo",
  avatar: ".user-avatar",
};
const style = "font-size: 20px; color:#39C134; font-family: Inter";
let [finalAnswer, groupAnswer, groupImgs, test] = [[], [], [], []];
const [question, select, cachedImgs] = [{}, new Set(), []];
const url = "https://luusytruong.id.vn/api/lms/temp.php";
const label = ["A. ", "B. ", "C. ", "D. "];

function normal(str) {
  return str.normalize("NFKC").replace(/\s+/g, " ").trim();
}

async function handleUpload(blobUrl) {
  const fileName = blobUrl.split("/").pop();
  const existFile = cachedImgs.find((img) => img.name === fileName);
  if (existFile) return existFile.src;

  try {
    const responseBlob = await fetch(blobUrl);
    if (!responseBlob.ok) throw new Error("Mất kết nối");
    const blob = await responseBlob.blob();
    const formData = new FormData();
    formData.append("blob", blob);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Mất kết nối");
    const result = await response.json();
    if (result.src) {
      cachedImgs.push({ name: fileName, src: result.src });
      console.log("up load thành công");
      return result.src;
    }
    throw new Error(`Lỗi: ${result}`);
  } catch (e) {
    return { error: true };
  }
}

function handleChange(e) {
  const elem = e.target;
  const i = parseInt(elem.dataset.index, 10);
  if (elem?.type === "radio") {
    select.clear();
    select.add(i);
  } else {
    elem?.checked ? select.add(i) : select.delete(i);
  }
  handleBuild();
}

async function handleSelect() {
  const setting = await handleGet("settings");
  if (!setting?.toggle) return;
  const data = await handleGet("auto");
  const autoData = new Set(data);
  const groups = document.querySelectorAll(query.group);
  const questionElem = document.querySelector(query.question);
  const numberElem = document.querySelector(query.number);
  const imgElem = document.querySelector(query.image);

  select.clear();
  [finalAnswer, groupAnswer, groupImgs] = [[], [], []];
  question.img_src = "";

  if (questionElem) {
    question.text = normal(questionElem.innerText);
  }
  if (numberElem) {
    question.no = parseInt(numberElem.innerText.replace(/\D/g, ""));
  }
  if (imgElem) {
    await new Promise((resolve) => {
      const interval = setInterval(async () => {
        if (!imgElem.src.includes("blob")) return;
        clearInterval(interval);
        question.img_src = await handleUpload(imgElem.src);
        resolve();
      }, 10);
    });
  }

  for (let i = 0; i < groups.length; i++) {
    const input = groups[i].querySelector("input");
    const label = groups[i].querySelector("label");
    const image = groups[i].querySelector("img");

    if (input) {
      input.dataset.index = i;
      input.removeEventListener("click", handleChange);
      input.addEventListener("click", handleChange);
    }
    if (label && label.innerText !== "") {
      const ans = normal(label.innerText);
      const key = (question.text + " " + ans).toLowerCase();
      groupAnswer[i] = ans;
      if (setting?.auto && autoData.has(key)) {
        const interval = setInterval(() => {
          if (groupAnswer.length < groups.length) return;
          clearInterval(interval);
          label.classList.add("selected-hehe");
          label.click();
        }, 10);
      }
    } else if (image) {
      const src = await handleUpload(image.src);
      groupImgs[i] = { type: "img", src: src };
    }
  }

  console.log("%c✅ Tải câu hỏi", style);
}

async function handleBuild() {
  for (let i = 0; i < groupAnswer.length; i++) {
    const value = groupAnswer[i] ?? groupImgs[i];
    if (value) {
      finalAnswer[i] = (select.has(i) ? `*${label[i]}` : label[i]) + value;
    }
  }
  test[question.no - 1] = {
    ...question,
    options: finalAnswer,
    select: Array.from(select),
  };
  await handleSet("test", test);
}

async function handleSet(key, data) {
  if (typeof chrome === "undefined" || !chrome.storage) {
    console.error("Lỗi: không phải môi trường extension");
    return false;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: data }, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          console.error(`Lỗi storage: ${error.message}`);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });

    console.log(`Lưu thành công với key: ${key}`);
    return result;
  } catch (e) {
    console.error(`Lỗi khi thao tác storage - ${key}:`, e.message);
    return false;
  }
}

async function handleGet(key) {
  if (typeof chrome === "undefined" || !chrome.storage) {
    console.error("Lỗi: không phải môi trường extension");
    return null;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        const error = chrome.runtime.lastError;
        if (error) {
          console.error(`Lỗi storage: ${error.message}`);
          reject(error);
        } else {
          resolve(result[key] || null);
        }
      });
    });

    console.log(`Lấy thành công với key: ${key}`);
    return result;
  } catch (e) {
    console.error(`Lỗi khi thao tác storage - ${key}:`, e.message);
    return null;
  }
}

function handleAddEvent() {
  const versionLabel = document.querySelector(".app-version");
  if (versionLabel) {
    versionLabel.addEventListener("click", () => {
      handleSelect();
    });
  }

  const handleClick = () => {
    setTimeout(() => {
      handleSelect();
    }, 100);
  };

  setInterval(() => {
    const btns = Array.from(document.querySelectorAll(query.btns));
    const btn = btns.find(
      (btn) => btn.label === query.label || btn.innerText.trim() === query.label
    );

    if (btn && !btn.dataset.event) {
      btn.dataset.event = true;
      console.log("%c✅ Đã thấy nút", style);
      btn.addEventListener("click", handleClick);
      handleSelect();
    }
  }, 1000);
}

function enableCopy() {
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "c") {
      const selection = window.getSelection().toString();
      if (selection) {
        navigator.clipboard.writeText(selection).catch((err) => {
          console.error("Không thể sao chép:", err);
        });
      }
    }
  });
}

const href = window.location.href;
if (href.includes("lms.ictu.edu.vn") || href.startsWith("file")) {
  handleAddEvent();
  enableCopy();
  console.clear();
  window.addEventListener(
    "contextmenu",
    function (e) {
      e.stopPropagation();
    },
    true
  );
}
