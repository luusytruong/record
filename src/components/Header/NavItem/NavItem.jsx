import { NavLink } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./NavItem.module.scss";
import { useContext } from "react";
import { HomeContext } from "~/context/HomeContext";

const cx = classNames.bind(styles);

function NavItem({ data = [] }) {
  const { handleReload } = useContext(HomeContext);

  return (
    <ul className={cx("nav")}>
      {data?.map((item, index) => (
        <li key={index} className={cx("nav-item")}>
          <NavLink
            className={cx("nav-link")}
            to={item?.to}
            onClick={index ? item?.onClick : handleReload}
          >
            {item?.icon ? <i className={cx("fa-solid", item?.icon)}></i> : null}
            <span className={cx(item?.tooltip ? "tooltip" : "label")}>
              {item?.title}
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default NavItem;
