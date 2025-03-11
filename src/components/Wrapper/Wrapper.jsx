import classNames from "classnames/bind";
import styles from "./Wrapper.module.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeContext } from "~/context/HomeContext";

const cx = classNames.bind(styles);

function Wrapper({ title, styles, children }) {
  const [animation, setAnimation] = useState("show-mixed");
  const [isDone, setIsDone] = useState(false);
  const { showOverlay, hideOverlay } = useContext(HomeContext);
  const ref = useRef();
  const nav = useNavigate();

  const handleHide = (e) => {
    if (!isDone) return;
    if (e.target === ref.current) {
      hideOverlay();
      setAnimation("hide-mixed");

      setTimeout(() => {
        nav("/");
      }, 320);
    }
  };

  useEffect(() => {
    setIsDone(false);
    showOverlay();

    setTimeout(() => {
      setAnimation("");
      setIsDone(true);
    }, 400);
  }, []);

  return (
    <div className={cx("main", animation)} ref={ref} onClick={handleHide}>
      <div className={cx("inner")} style={{ ...styles }}>
        <p className={cx("title")}>{title}</p>
        {children}
      </div>
    </div>
  );
}

export default Wrapper;
