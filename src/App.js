import "./App.css";
import { HashRouter, useRoutes } from "react-router-dom";
import { Suspense } from "react";
import routes from "./routes/routes";

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<p>Loading...</p>}>
        <AppRoutes />
      </Suspense>
    </HashRouter>
  );
}

export default App;
