import classNames from "classnames/bind";
import styles from "./Toast.module.scss";
import { useEffect, useRef, useState } from "react";

const cx = classNames.bind(styles);
const iError = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
  </svg>
);
const iSuccess = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
  </svg>
);
let timeout = null;

function Toast({ obj, setToast }) {
  const [classToast, setClassToast] = useState("show");

  const handleClose = (e) => {
    if (e && e.target) e.target.style.opacity = "0";
    clearTimeout(timeout);
    setClassToast("wait");

    timeout = setTimeout(() => {
      setClassToast("hide");

      timeout = setTimeout(() => {
        setToast(null);
      }, 620);
    }, 100);
  };

  const handleCloseRef = useRef(handleClose);
  const keepRef = useRef(obj?.keep);

  useEffect(() => {
    if (keepRef.current) return;

    //automatic close toast
    timeout = setTimeout(() => {
      handleCloseRef.current();
    }, 5400);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div id="toast" className={cx("toast", classToast)}>
      <div className={cx("toast-wrapper")}>
        <i className="fa-light fa-xmark" onClick={handleClose}></i>
        <div className={cx("toast-head", obj?.status)}>
          {obj?.status === "error" ? iError : iSuccess}
        </div>
        <div className={cx("toast-body")}>
          <div className={cx("toast-title")}>{obj?.title}</div>
          <div className={cx("toast-content")}>{obj?.content}</div>
        </div>
      </div>
    </div>
  );
}

export default Toast;
