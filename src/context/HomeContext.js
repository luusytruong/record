import { createContext, useState } from "react";
import Toast from "~/components/Toast/Toast";
import classNames from "classnames/bind";
import styles from "./HomeContext.module.scss";

const cx = classNames.bind(styles);

export const HomeContext = createContext();

export function HomeProvider({ children }) {
  const [key, setKey] = useState(0);
  const [toast, setToast] = useState(null);
  const [overlay, setOverlay] = useState(false);
  const [animation, setAnimation] = useState("show-opacity");

  const handleReload = () => {
    setKey((pre) => pre + 1);
  };

  const showToast = (obj) => {
    setToast(null);
    if (obj && typeof obj === "object") {
      setTimeout(() => {
        setToast(<Toast obj={obj} setToast={setToast} />);
      }, 4);
    }
  };

  const handleSuccess = (msg) => {
    showToast({
      status: "success",
      title: "Thành công",
      content: msg,
    });
  };

  const handleError = (msg) => {
    showToast({
      status: "error",
      title: "Đã xảy ra lỗi",
      content: msg,
    });
  };

  const showOverlay = () => {
    setOverlay(true);

    setTimeout(() => {
      setAnimation("");
    }, 320);
  };

  const hideOverlay = () => {
    setAnimation("hide-opacity");

    setTimeout(() => {
      setOverlay(false);
      setAnimation("show-opacity");
    }, 320);
  };

  return (
    <HomeContext.Provider
      value={{
        handleSuccess,
        handleError,
        showOverlay,
        hideOverlay,
        key,
        handleReload,
      }}
    >
      {overlay ? <div className={cx("overlay", animation)}></div> : null}
      {toast}
      {children}
    </HomeContext.Provider>
  );
}
