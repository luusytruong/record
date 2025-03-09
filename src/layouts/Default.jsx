import { Outlet } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Default.module.scss";
import Header from "~/components/Header/Header";

const cx = classNames.bind(styles);

function DefaultLayout() {
  return (
    <div className={cx("wrapper")}>
      <Header />
      <Outlet />
    </div>
  );
}

export default DefaultLayout;
