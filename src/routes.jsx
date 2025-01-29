import App from "./App";
import Room from "./Room";

const routes = [
  {
    path: "/",
    element: <App />,
  },

  {
    path: "/room/:id",
    element: <Room />,
  },
];

export default routes;
