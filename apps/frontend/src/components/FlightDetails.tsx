export default function FlightDetails({
  flight,
  language,
}: {
  language: string;
  flight: {
    type: string;
    title: string;
    flight_number: string;
    destination: string;
    flight_status: string;
    latest_update: string;
    percentage_of_flight_progress: string;
  };
}) {
  const translated = {
    tr: {
      "Uçuş Numarası": "Uçuş Numarası",
      Hedef: "Hedef",
      Durum: "Durum",
      "Son Güncelleme": "Son Güncelleme",
      İlerleme: "İlerleme",
    },
    en: {
      "Uçuş Numarası": "Flight Number",
      Hedef: "Destination",
      Durum: "Status",
      "Son Güncelleme": "Last Update",
      İlerleme: "Progress",
    },
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="md:flex">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            {flight.type}
          </div>
          <h1 className="mt-2 text-2xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            {flight.title}
          </h1>
          <p className="mt-1 text-gray-500">
            {translated[language]["Uçuş Numarası"]}:{" "}
            <span className="font-medium">{flight.flight_number}</span>
          </p>
          <p className="mt-1 text-gray-500">
            {translated[language]["Hedef"]}:{" "}
            <span className="font-medium">{flight.destination}</span>
          </p>
          <p className="mt-1 text-gray-500">
            {translated[language]["Durum"]}:{" "}
            <span className="font-medium">{flight.flight_status}</span>
          </p>
          <p className="mt-1 text-gray-500">
            {translated[language]["Son Güncelleme"]}:{" "}
            <span className="font-medium">{flight.latest_update}</span>
          </p>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-indigo-500 rounded-full"
                style={{ width: flight.percentage_of_flight_progress }}
              ></div>
            </div>
            <p className="text-right text-sm font-medium text-gray-500 mt-1">
              {translated[language]["İlerleme"]}:{" "}
              {flight.percentage_of_flight_progress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
