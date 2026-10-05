export default function Backdrop() {
  return (
    <>
      <div className="grid-backdrop" aria-hidden="true" />
      <div
        className="glow-orb"
        style={{ top: "-10%", left: "10%", width: 480, height: 480, background: "#39ff8f" }}
        aria-hidden="true"
      />
      <div
        className="glow-orb"
        style={{ top: "20%", right: "-10%", width: 420, height: 420, background: "#39e8ff" }}
        aria-hidden="true"
      />
      <div
        className="glow-orb"
        style={{ bottom: "-15%", left: "30%", width: 460, height: 460, background: "#ff4fd8", opacity: 0.18 }}
        aria-hidden="true"
      />
    </>
  );
}
