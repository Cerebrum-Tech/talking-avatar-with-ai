import { MdExitToApp } from "react-icons/md";

export default function Map({ language }: { language: string }) {
  const translated = {
    tr: {
      Çıkış: "Çıkış",
    },
    en: {
      Çıkış: "Exit",
    },
  };

  return (
    <>
      <iframe
        src="https://maps.istairport.com/?placeId=fd536e57-abe1-46de-a4f0-bc309cfa327c&startStoreId=F_TD_05&endStoreId=A10&language=tr&vk=true"
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
