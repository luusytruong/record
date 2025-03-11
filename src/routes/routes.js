import Filter from "~/components/Filter/Filter";
import Setting from "~/components/Setting/Setting";
import Home from "~/pages/Home/Home";
import Delete from "~/components/Delete/Delete";

const routes = [
  {
    path: "/",
    element: <Home />,
    children: [
      { path: "/setting", element: <Setting /> },
      { path: "/filter", element: <Filter /> },
      { path: "/delete", element: <Delete /> },
    ],
  },
];
export default routes;
