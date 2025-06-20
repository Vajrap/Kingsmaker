import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "./components/ui/provider";
import ReactDOM from "react-dom/client";
import TermsPage from "./Pages/Index/Register/termsAndConditions";
import { LobbyMainViewModel } from "./Pages/Lobby/LobbyMain.viewModel";
import LoginPage from "./Pages/Index";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Provider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/lobby" element={<LobbyMainViewModel />} />
      </Routes>
    </Provider>
  </BrowserRouter>,
);
