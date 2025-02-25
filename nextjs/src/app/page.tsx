import LedContent from "./components/led-content";

export default function Home() {
  return (
    <div className="led-matrix">
      <div className="text text-regular">
        <LedContent />
      </div>
    </div>
  );
}
