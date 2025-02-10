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
import Map from "./components/Map";
import { tr } from "./constants/languages";

function English() {}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FirstVideo />} />
          <Route path="/pick-language" element={<PickLanguage />} />
          {Object.keys(tr)
            .filter((lang) => location.href.includes(lang))
            .map((language) => {
              return (
                <Route
                  key={language}
                  path={"/" + language}
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
              );
            })}
          <Route path="/second-video" element={<SecondVideo />} />

          {Object.keys(tr)
            .filter((lang) => location.href.includes(lang))
            .map((language) => {
              return (
                <Route
                  key={language}
                  path={"/second/" + language}
                  element={<SecondScreen language={language} />}
                />
              );
            })}
          {Object.keys(tr)
            .filter((lang) => location.href.includes(lang))
            .map((language) => {
              return (
                <Route
                  key={language}
                  path={"/map/" + language}
                  element={<Map language={language} />}
                />
              );
            })}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
