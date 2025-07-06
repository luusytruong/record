import Filter from "~/components/Filter/Filter";
import Setting from "~/components/Setting/Setting";
import Home from "~/pages/Home/Home";
import Delete from "~/components/Delete/Delete";
import path from "./path";

const routes = [
  {
    path: path.root,
    element: <Home />,
    children: [
      { path: path.setting, element: <Setting /> },
      { path: path.filter, element: <Filter /> },
      { path: path.delete, element: <Delete /> },
    ],
  },
];

export default routes;
