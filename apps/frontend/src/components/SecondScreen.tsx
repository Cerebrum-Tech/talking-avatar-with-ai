import Keyboard from "./Keyboard";

export default function SecondScreen() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white ">
      <Keyboard  onKeyPress={(key) => {
        window.electron.pressKey(key);
        console.log(key);
      }}/>
    </div>
  );
}