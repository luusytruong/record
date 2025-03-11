import classNames from "classnames/bind";
import styles from "./Setting.module.scss";
import { useContext, useEffect, useState } from "react";
import { HomeContext } from "~/context/HomeContext";
import { getStorage, setStorage } from "~/utils/chrome";
import Wrapper from "../Wrapper/Wrapper";

const cx = classNames.bind(styles);

function Setting() {
  const [setting, setSetting] = useState({ toggle: false, auto: false });
  const { handleSuccess, handleError } = useContext(HomeContext);

  const handleChange = (key) => {
    const newSetting = { ...setting, [key]: !setting[key] };
    setSetting(newSetting);
    setStorage("settings", newSetting)
      .then(() => {
        handleSuccess("Lưu thành công");
      })
      .catch((e) => {
        handleError(e.message);
      });
  };

  useEffect(() => {
    getStorage("settings")
      .then((result) => {
        if (typeof result === "object") {
          setSetting(result);
        }
      })
      .catch((e) => {
        handleError(e.message);
      });
  }, []);

  return (
    <Wrapper title={"Cài đặt"} styles={{ width: "200px" }}>
      <label className={cx("option")}>
        <span className={cx("content")}>Bật tiện ích</span>
        <input
          type="checkbox"
          checked={setting?.toggle}
          onChange={() => {
            handleChange("toggle");
          }}
        />
        <span className={cx("slider")}></span>
      </label>
      <label className={cx("option")}>
        <span className={cx("content")}>Tự động chọn</span>
        <input
          type="checkbox"
          checked={setting?.auto}
          onChange={() => {
            handleChange("auto");
          }}
        />
        <span className={cx("slider")}></span>
      </label>
    </Wrapper>
  );
}

export default Setting;
