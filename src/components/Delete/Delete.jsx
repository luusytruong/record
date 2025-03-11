import classNames from "classnames/bind";
import styles from "./Delete.module.scss";
import Wrapper from "../Wrapper/Wrapper";
import { setStorage } from "~/utils/chrome";
import { HomeContext } from "~/context/HomeContext";
import { useContext } from "react";

const cx = classNames.bind(styles);

function Delete() {
  const { handleSuccess, handleError } = useContext(HomeContext);

  const handleConfirm = async () => {
    try {
      await setStorage("test", []);
      handleSuccess("Xoá thành công");
    } catch (e) {
      handleError(e.message);
    }
  };

  return (
    <Wrapper title={"Bạn có muốn xoá?"} styles={{ width: "200px" }}>
      <div className={cx("main")}>
        <button className={cx("yes")} onClick={handleConfirm}>
          Xác nhận
        </button>
      </div>
    </Wrapper>
  );
}

export default Delete;
