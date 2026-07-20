interface DimensionBoxProps {
  length: number;
  width: number;
  height: number;
}

const FACE_BASE =
  "absolute border border-[#0b5bb5]/40 rounded-[2px]";
const FRONT = "bg-[#7fb4f0]/80";
const BACK = "bg-[#5a98e0]/70";
const SIDE = "bg-[#3f7fcf]/70";
const TOP = "bg-[#a9d0fb]/90";
const BOTTOM = "bg-[#2f6bbd]/70";

export function DimensionBox({ length, width, height }: DimensionBoxProps) {
  if (
    ![length, width, height].every(
      (v) => typeof v === "number" && Number.isFinite(v)
    )
  ) {
    return <div className="text-xs text-muted-foreground">N/A</div>;
  }

  const BASE = 70;
  const max = Math.max(length, width, height) || 1;
  const scale = BASE / max;
  const w = length * scale;
  const d = width * scale;
  const h = height * scale;

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ perspective: 600 }} className="h-[110px] w-[120px] flex items-center justify-center">
        <div
          style={{
            width: w,
            height: h,
            transformStyle: "preserve-3d",
            transform: "rotateX(-22deg) rotateY(-32deg)",
            position: "relative",
          }}
        >
          {/* Front (x·z, length × height) */}
          <div
            className={`${FACE_BASE} ${FRONT}`}
            style={{
              width: w,
              height: h,
              transform: `translateZ(${d / 2}px)`,
            }}
          />
          {/* Back */}
          <div
            className={`${FACE_BASE} ${BACK}`}
            style={{
              width: w,
              height: h,
              transform: `rotateY(180deg) translateZ(${d / 2}px)`,
            }}
          />
          {/* Right side (d·h, width × height) */}
          <div
            className={`${FACE_BASE} ${SIDE}`}
            style={{
              width: d,
              height: h,
              transform: `rotateY(90deg) translateZ(${w / 2}px)`,
              left: (w - d) / 2,
            }}
          />
          {/* Left side */}
          <div
            className={`${FACE_BASE} ${SIDE}`}
            style={{
              width: d,
              height: h,
              transform: `rotateY(-90deg) translateZ(${w / 2}px)`,
              left: (w - d) / 2,
            }}
          />
          {/* Top (w·d, length × width) */}
          <div
            className={`${FACE_BASE} ${TOP}`}
            style={{
              width: w,
              height: d,
              transform: `rotateX(90deg) translateZ(${h / 2}px)`,
              top: (h - d) / 2,
            }}
          />
          {/* Bottom */}
          <div
            className={`${FACE_BASE} ${BOTTOM}`}
            style={{
              width: w,
              height: d,
              transform: `rotateX(-90deg) translateZ(${h / 2}px)`,
              top: (h - d) / 2,
            }}
          />
        </div>
      </div>
      <div className="text-[10px] font-mono text-muted-foreground leading-tight text-center">
        <span className="text-primary-light">x</span> {length} ·{" "}
        <span className="text-primary-light">y</span> {width} ·{" "}
        <span className="text-primary-light">z</span> {height}
      </div>
    </div>
  );
}
