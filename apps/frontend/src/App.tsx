import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { ChatInterface } from "./components/ChatInterface";
import Voice from "./components/voice";
import { BrowserRouter, Routes, Route } from "react-router";
import SecondScreen from "./components/SecondScreen";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Loader />
                <Leva collapsed />
                <ChatInterface />
                <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
                  <Scenario />
                </Canvas>
              </>
            }
          />
          <Route path="/second" element={<SecondScreen />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
