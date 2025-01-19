//custom copy button
if (window.location.href.includes("lms.ictu.edu.vn")) {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#7A6BFF" d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z"/></svg>`;
  const btnCopy = document.createElement("button");
  btnCopy.id = "btn-copy";
  btnCopy.innerHTML = icon;
  document.body.appendChild(btnCopy);

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "c") {
      const content = window.getSelection().toString();
      if (content.length && content !== "") {
        navigator.clipboard.writeText(content);
      }
    }
  });

  // window.addEventListener(
  //   "contextmenu",
  //   function (e) {
  //     e.stopPropagation();
  //   },
  //   true
  // );

  let content = "";
  window.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
      btnCopy.className = "";
      content = window.getSelection().toString();
      if (content.length <= 0 && content === "") {
        return;
      }
      setTimeout(() => {
        btnCopy.className = "show-by-syluu";
        btnCopy.style.left = e.clientX + "px";
        btnCopy.style.top = e.clientY + "px";
      }, 32);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target !== btnCopy) {
      btnCopy.className = "";
    }
    if (e.target === btnCopy) {
      navigator.clipboard.writeText(content);
      btnCopy.className = "";
    }
  });
}
