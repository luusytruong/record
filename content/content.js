const urlFetch = "https://luusytruong.github.io/record/function.js";
const script = document.createElement("script");
const root = window.location.origin;

//create script elem
async function cScript() {
  try {
    const response = await fetch(urlFetch);
    if (!response.ok) throw new Error("failed to fetch");
    const data = await response.text();
    script.innerHTML = data;
    document.body.appendChild(script);
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

//call
const urlBrowser = window.location.href;
if (urlBrowser.includes("lms.ictu.edu.vn")) {
  console.log("lms");
} else {
  console.log("other");
}
cScript();
