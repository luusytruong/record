import Wrapper from "../Wrapper/Wrapper";
import classNames from "classnames/bind";
import styles from "./Filter.module.scss";
import { useContext, useRef } from "react";
import { handleDuplicates } from "~/utils/deduplicates";
import { HomeContext } from "~/context/HomeContext";

const cx = classNames.bind(styles);

function Filter() {
  const { handleSuccess, handleError } = useContext(HomeContext);
  const ref = useRef();

  const handleDownload = async () => {
    const value = ref.current.value.trim();
    if (!value) {
      handleError("Không có câu hỏi");
      return;
    }
    const result = await handleDuplicates(ref.current, value);
    console.log(result);

    if (result?.error) {
      handleError(result?.error);
    } else {
      handleSuccess(result?.success);
    }
  };

  return (
    <Wrapper title={"Bộ lọc"} styles={{ width: "320px", aspectRatio: "1" }}>
      <textarea
        ref={ref}
        className={cx("text")}
        placeholder="Dán câu hỏi"
      ></textarea>
      <button className={cx("btn")} onClick={handleDownload}>
        Tải xuống
      </button>
    </Wrapper>
  );
}

export default Filter;
