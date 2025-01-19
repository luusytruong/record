if (window.location.href.includes("lms.ictu.edu.vn")) {
  window.addEventListener(
    "contextmenu",
    function (e) {
      e.stopPropagation();
    },
    true
  );
}
