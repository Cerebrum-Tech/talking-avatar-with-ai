import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { ChatInterface } from "./components/ChatInterface";
import Voice from "./components/voice";
import { BrowserRouter, Routes, Route } from "react-router";
import SecondScreen from "./components/SecondScreen";
import SecondVideo from "./components/SecondVideo";
import FirstVideo from "./components/FirstVideo";
import PickLanguage from "./components/PickLanguage";

function English() {}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<FirstVideo />} />
          <Route
            path="/pick-language"
            element={
              <PickLanguage />
            }
          />
          {location.href.includes("/en") && (
            <Route
              path="/en"
              element={
                <>
                  <Loader />
                  <Leva collapsed />
                  <ChatInterface language="en" />
                  <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
                    <Scenario />
                  </Canvas>
                </>
              }
            />
          )}
          {location.href.includes("/tr") && (
            <Route
              path="/tr"
              element={
                <>
                  <Loader />
                  <Leva collapsed />
                  <ChatInterface language="tr" />
                  <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
                    <Scenario />
                  </Canvas>
                </>
              }
            />
          )}
          <Route path="/second-video" element={<SecondVideo />} />
          <Route path="/second/tr" element={<SecondScreen language="tr" />} />
          <Route path="/second/en" element={<SecondScreen language="en" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
