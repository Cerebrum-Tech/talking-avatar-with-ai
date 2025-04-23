import { tr } from "../constants/languages";
import { MdExitToApp } from "react-icons/md";

export default function Map({ language }: { language: string }) {
  const translated = tr

  return (
    <>
      <iframe
        src="https://app.mappedin.com/map/68090e97819c50000cd8bac5?you-are-here=39.91118778%2C32.80297245&floor=m_2cc36977894f237d&kiosk=true"
        width="100%"
        height="100%"
        frameBorder="0"
      ></iframe>
      <button
        onClick={() => {
          location.href = "/second/" + language;
        }}
        className="fixed z-10 top-0 right-0 m-10 border bg-white text-[#ff5656] rounded-full p-4 px-4 font-semibold uppercase flex items-center gap-2 justify-around"
      >
        <MdExitToApp size={30} className="text-[#ff5656]" />
        {translated[language]["Çıkış"]}
      </button>
    </>
  );
}
