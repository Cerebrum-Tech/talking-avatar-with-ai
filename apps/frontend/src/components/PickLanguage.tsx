import languages from "../languages.json";

export default function PickLanguage() {
  return (
    <>
      <div className="flex w-full language-picker bg-gradient-to-br from-[#2ABBAF] to-[#093430]">
        <div className="grid grid-cols-3 gap-8 mx-auto px-8 py-4 justify-center">
          <a
            href="/second/tr"
            className="flex gap-4 px-8 py-4 items-center h-30 bg-white rounded-full"
          >
            <img className="rounded-md w-[6em]" src="tr.svg" alt="" />
            <span className="text-2xl">Türkçe</span>
          </a>

          <a
            href="/second/en"
            className="flex gap-2 px-8 py-4 items-center bg-white rounded-full"
          >
            <img className="rounded-md w-[6em]" src="en.svg" alt="" />
            <span className="text-2xl">English</span>
          </a>

          {languages.map((language) => {
            return (
              <a
              key={language.code}
                href={language.active ? `/second/${language.code}` : "#"}
                className={"flex gap-4 px-8 py-4 items-center h-30 filter bg-white rounded-full" + (language.active ? "" : " grayscale")}
              >
                <img className="rounded-md w-[6em]" src={language.image} alt="" />
                <span className="text-2xl">{language.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
