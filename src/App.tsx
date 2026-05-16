import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { peopleOutline, send, wallet } from "ionicons/icons";
import { WalletOverviewPage } from "./pages/WalletOverviewPage";
import { PaymentPage } from "./pages/PaymentPage";
import { ContactPage } from "./pages/ContactPage";

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
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path={routePath("/wallet")}>
            <WalletOverviewPage />
          </Route>
          <Route exact path={routePath("/payment")}>
            <PaymentPage />
          </Route>
          <Route path={routePath("/contact")}>
            <ContactPage />
          </Route>
          <Route exact path={rootPaths}>
            <Redirect to={routePath("/wallet")} />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="wallet" href={routePath("/wallet")}>
            <IonIcon aria-hidden="true" icon={wallet} />
            <IonLabel>Wallet</IonLabel>
          </IonTabButton>
          <IonTabButton tab="payment" href={routePath("/payment")}>
            <IonIcon aria-hidden="true" icon={send} />
            <IonLabel>Invoice</IonLabel>
          </IonTabButton>
          <IonTabButton tab="contact" href={routePath("/contact")}>
            <IonIcon aria-hidden="true" icon={peopleOutline} />
            <IonLabel>Contact</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
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
