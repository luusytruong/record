import classNames from "classnames/bind";
import styles from "./Home.module.scss";
import { Outlet } from "react-router-dom";
import Header from "~/components/Header/Header";
import Question from "~/components/Question/Question";

const cx = classNames.bind(styles);

function Home() {
  return (
    <div className={cx("wrapper")}>
      <Header />
      <div className={cx("inner")}>
        <Question />
      </div>
      <div className={cx("outlet-container")}>
        <Outlet />
      </div>
    </div>
  );
}

export default Home;
