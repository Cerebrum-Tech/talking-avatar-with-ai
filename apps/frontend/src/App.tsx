import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { ChatInterface } from "./components/ChatInterface";
import Voice from "./components/voice";
import { BrowserRouter, Routes, Route } from "react-router";
import SecondScreen from "./components/SecondScreen";

function English() {}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-row gap-4 w-1/2 mx-auto px-8 py-4 justify-center">
                    <div className="flex gap-4 px-8 py-4 items-center h-40 bg-white rounded-full w-1/2">
                      <img
                        className="rounded-md w-[10em]"
                        src="tr.svg"
                        alt=""
                      />
                      <span className="text-3xl">
                        <a href="/tr">Türkçe</a>
                      </span>
                    </div>
                    <div className="flex gap-2 px-8 py-4 items-center bg-white rounded-full w-1/2">
                      <img
                        className="rounded-md w-[10em]"
                        src="en.svg"
                        alt=""
                      />
                      <span className="text-3xl">
                        <a href="/en">English</a>
                      </span>
                    </div>
                  </div>
                </div>
              </>
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
          <Route path="/second" element={<SecondScreen />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
