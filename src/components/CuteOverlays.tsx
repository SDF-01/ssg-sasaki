const GLITTER_CHARS = ['✦', '✧', '♡', '✨', '💖', '★', '♡', '✦', '✧', '✨', '♡', '★'] as const;

export function CuteOverlays() {
  return (
    <>
      <div className="glitter-field" aria-hidden="true">
        {GLITTER_CHARS.map((char, i) => (
          <span key={char + i} className={`glitter-bit glitter-bit--${i + 1}`}>
            {char}
          </span>
        ))}
      </div>
      <div className="cute-floats cute-floats--extra" aria-hidden="true">
        <span className="cute-float cute-float--7">☆</span>
        <span className="cute-float cute-float--8">♡</span>
        <span className="cute-float cute-float--9">🌸</span>
        <span className="cute-float cute-float--10">⭐</span>
      </div>
      <div className="candy-border candy-border--bottom" aria-hidden="true" />
    </>
  );
}

export function HibikiChibiFace() {
  return (
    <span className="hibiki-chibi" aria-hidden="true">
      <span className="hibiki-chibi__shine" />
      <span className="hibiki-chibi__eye hibiki-chibi__eye--l" />
      <span className="hibiki-chibi__eye hibiki-chibi__eye--r" />
      <span className="hibiki-chibi__mouth" />
      <span className="hibiki-chibi__blush hibiki-chibi__blush--l" />
      <span className="hibiki-chibi__blush hibiki-chibi__blush--r" />
    </span>
  );
}
