interface ChatInterface2Props {
  language: string;
}

export default function ChatInterface2({ language }: ChatInterface2Props) {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 justify-between p-4 flex-col pointer-events-none">
      <div className="flex gap-10">
        <img src="k_logo.png" alt="logo" className="w-[10%] h-auto object-contain" />
        <img src="kb_logo.png" alt="logo" className="w-[10%] h-auto object-contain" />
      </div>
    </div>
  );
}
