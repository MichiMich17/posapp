import { BrowserRouter } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";

export default function App() {
  return (
    <BrowserRouter >
      <WelcomeScreen />
    </BrowserRouter>
  );
}