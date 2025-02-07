import { MdStart } from "react-icons/md";

export default function SecondVideo() {
  return (
    <>
      <video
        className="w-screen h-screen"
        autoPlay
        loop
        muted
        onClick={() => {
          location.href = "/pick-language";
        }}
      >
        <source src="second-video.mp4" type="video/mp4" />
      </video>
      <button
        onClick={() => {
          location.href = "/pick-language";
        }}
        className="fixed left-1/2 top-2/3 transform -translate-x-1/2 -translate-y-1/2 text-3xl z-10 m-auto border bg-white text-[#ff5656] rounded-full p-4 px-4 font-semibold uppercase flex items-center gap-2 justify-around"
      >
        <MdStart size={50} className="text-[#ff5656] etxt-3xl" />
        Başla
      </button>
    </>
  );
}
