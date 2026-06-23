import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LogAnalysis } from "./components/LogAnalysis";
import { AIDecision } from "./components/AIDecision";
import { Explainability } from "./components/Explainability";
import { AuditTrail } from "./components/AuditTrail";
import { Login } from "./components/Login";
import { SplashScreen } from "./components/SplashScreen";

export const router = createBrowserRouter([
  {
    path: "/splash",
    Component: SplashScreen,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LogAnalysis },
      { path: "decision", Component: AIDecision },
      { path: "explainability", Component: Explainability },
      { path: "audit", Component: AuditTrail },
    ],
  },
]);
