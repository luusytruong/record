import React from "react";
import classNames from "classnames/bind";
import styles from "./Question.module.scss";
import errorImg from "~/assets/images/error.png";
import { useContext, useEffect, useState } from "react";
import { HomeContext } from "~/context/HomeContext";
import { getStorage } from "~/utils/chrome";

const cx = classNames.bind(styles);
const BASE_URL = "https://luusytruong.id.vn/api/lms/uploads/";
const dataTest = [
  {
    no: 1,
    text: "Đoạn mã JSP sau sử dụng đối tượng ẩn nào để lấy dữ liệu từ yêu cầu HTTP ?",
    img_src: {
      error: true,
    },
    options: ["*A. request", "B. session", "C. application", "D. response"],
    select: [0],
  },
  {
    no: 2,
    text: 'Trong thẻ <c:forEach items="${myList}" var="item">, tham số nào được sử dụng để đặt tên cho biến đại diện cho từng phần tử trong danh sách khi duyệt qua danh sách ?',
    options: ["A. value", "B. index", "*C. item", "D. items"],
    select: [2],
  },
  {
    no: 3,
    text: "Cho các yêu cầu phi chức năng như sau:\n\nSUPL-1: “Hệ thống sử dụng kiến trúc ứng dụng dịch vụ siêu nhỏ (Microservice Architecture)”\n\nSUPL-2: “Cơ sở dữ liệu của hệ thống được bảo quản trên server của công ty”.\n\nHãy cho biết chúng thuộc tiêu chí chất lượng nào trong bộ chuẩn ISO/IEC 9126? (chọn 2 đáp án đúng)",
    options: [
      "*A. Thời gian phản hồi (Response time)",
      "B. Tính dễ sử dụng (Ease of use)",
      "C. Tính bảo mật (Security)",
      "*D. Tính bảo trì (Maintainability)",
    ],
    select: [0, 3],
  },
];

const renderQuestionText = (text = "") => {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, i) => (
      <p key={i} className={cx("question-text")}>
        {line}
      </p>
    ));
};

const renderQuestionImg = (img = "") => {
  return !img ? null : img?.error ? (
    <img className={cx("question-img")} src={errorImg} alt=" " onCopy={null} />
  ) : (
    <img
      className={cx("question-img")}
      src={BASE_URL + img}
      alt=" "
      onCopy={null}
    />
  );
};

const renderOption = (option = [], select = []) => {
  const set = new Set(select);
  return option?.map((option, i) => {
    if (option.type === "img") {
      return (
        <img
          key={i}
          src={option?.src}
          className={cx("option", { choose: set.has(i) })}
        />
      );
    } else {
      return (
        <p key={i} className={cx("option", { choose: set.has(i) })}>
          {option}
        </p>
      );
    }
  });
};

function Question() {
  const [test, setTest] = useState([]);
  const { key, handleSuccess, handleError } = useContext(HomeContext);

  useEffect(() => {
    getStorage("test")
      .then((result) => {
        setTest(result);
        handleSuccess("Đã tải xong câu hỏi");
      })
      .catch((e) => {
        setTest(dataTest);
        handleError(e.message);
      });
  }, [key]);

  return (
    <div className={cx("list-question")}>
      {test
        ?.filter((question) => question !== null)
        ?.map((question, i) => (
          <div key={`question${i}`} className={cx("question")}>
            <div className={cx("wrapper")}>
              <p className={cx("label")}>Question {question?.no}</p>
              {renderQuestionText(question?.text)}
              {renderQuestionImg(question?.img_src)}
              <div className={cx("line")}></div>
              {renderOption(question?.options, question?.select)}
              <div className={cx("br")}>
                <br />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Question;
