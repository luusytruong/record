import React from "react";
import classNames from "classnames/bind";
import styles from "./Header.module.scss";
import NavItem from "./NavItem/NavItem";
import { useContext } from "react";
import { HomeContext } from "~/context/HomeContext";
import { getClipboard } from "~/utils/upload";

const cx = classNames.bind(styles);

function Header() {
  const { handleSuccess, handleError } = useContext(HomeContext);

  const handleExpand = () => {
    try {
      chrome.runtime.openOptionsPage();
    } catch (e) {
      handleError(e.message);
    }
  };

  const handleUpload = async () => {
    const result = await getClipboard();
    if (result.error) {
      handleError(result.error);
    } else if (result.success) {
      handleSuccess(result.success);
    }
  };

  const navItemData = [
    {
      icon: "fa-rotate",
      title: "Tải lại",
      tooltip: true,
      to: "/",
      onClick: null,
    },
    {
      icon: "fa-expand",
      title: "Mở rộng",
      tooltip: true,
      to: "/",
      onClick: handleExpand,
    },
    {
      icon: "fa-gear",
      title: "Cài đặt",
      tooltip: true,
      to: "/setting",
      onClick: null,
    },
    {
      icon: "fa-cloud-arrow-up",
      title: "Tải lên",
      tooltip: true,
      to: "/",
      onClick: handleUpload,
    },
    {
      icon: "fa-filter",
      title: "Bộ lọc",
      tooltip: true,
      to: "/filter",
      onClick: null,
    },
    {
      icon: "",
      title: "Clear",
      tooltip: false,
      to: "/delete",
      onClick: null,
    },
  ];

  return (
    <header className={cx("header")}>
      <NavItem data={navItemData} />
    </header>
  );
}

export default Header;
