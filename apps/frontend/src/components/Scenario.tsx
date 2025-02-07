import { CameraControls, Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Avatar } from "./Avatar";


export const Scenario = () => {
  const cameraControls = useRef<CameraControls>(null);
  useEffect(() => {
    cameraControls.current?.setLookAt(0, 1.6, 4, 1, 0, -80, true); 
  }, []);
  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      <Avatar />
    </>
  );
};
