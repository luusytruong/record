import React from "react";
import classNames from "classnames/bind";
import styles from "./Header.module.scss";
import NavItem from "./NavItem/NavItem";
import { useContext } from "react";
import { HomeContext } from "~/context/HomeContext";
import { getClipboard } from "~/utils/upload";
import { ReactComponent as UploadIcon } from "~/assets/svg/upload.svg";
import { ReactComponent as ExpandIcon } from "~/assets/svg/expand.svg";
import { ReactComponent as SettingIcon } from "~/assets/svg/setting.svg";
import { ReactComponent as FilterIcon } from "~/assets/svg/filter.svg";
import { ReactComponent as ReloadIcon } from "~/assets/svg/reload.svg";

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
      icon: <ReloadIcon />,
      title: "Tải lại",
      tooltip: true,
      id: "reload",
      to: "/",
      onClick: null,
    },
    {
      icon: <ExpandIcon />,
      title: "Mở rộng",
      tooltip: true,
      to: "/",
      onClick: handleExpand,
    },
    {
      icon: <SettingIcon />,
      title: "Cài đặt",
      tooltip: true,
      to: "/setting",
      onClick: null,
    },
    {
      icon: <UploadIcon />,
      title: "Tải lên",
      tooltip: true,
      to: "/",
      onClick: handleUpload,
    },
    {
      icon: <FilterIcon />,
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
