import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { PaymentPage } from "./pages/PaymentPage";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

/* Tailwind styles */
import "./theme/tailwind.css";

setupIonicReact();

const routeBase = normalizeRouteBase(import.meta.env.BASE_URL);
const routePath = (path: `/${string}`) => `${routeBase}${path}`;
const rootPaths = routeBase === "" ? "/" : [routeBase, `${routeBase}/`];

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path={routePath("/payment")}>
          <PaymentPage />
        </Route>
        <Route exact path={rootPaths}>
          <Redirect to={routePath("/payment")} />
        </Route>
        <Route>
          <Redirect to={routePath("/payment")} />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

function normalizeRouteBase(baseUrl: string): "" | `/${string}` {
  const trimmed = baseUrl.trim();
  if (trimmed === "" || trimmed === "/") return "";

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1) as `/${string}`
    : withLeadingSlash as `/${string}`;
}

export default App;
