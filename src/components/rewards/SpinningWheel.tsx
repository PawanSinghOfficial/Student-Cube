import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

const SEGMENTS = [
  { label: "7 Hours", hours: 7, color: "#4F46E5" },
  { label: "12 Hours", hours: 12, color: "#F97316" },
  { label: "18 Hours", hours: 18, color: "#22C55E" },
  { label: "1 Day", hours: 24, color: "#EF4444" },
];

interface SpinningWheelProps {
  onResult: (hours: number) => void;
}

export function SpinningWheel({ onResult }: SpinningWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const drawWheel = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, size, size);

    SEGMENTS.forEach((seg, i) => {
      const start = i * segAngle - Math.PI / 2;
      const end = start + segAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + segAngle / 2 + Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(seg.label, 0, -radius * 0.6);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center text
    ctx.fillStyle = "#374151";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", center, center + 4);
  };

  const spin = () => {
    if (spinning || result !== null) return;
    setSpinning(true);

    const winIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segAngle = 360 / SEGMENTS.length;
    const extraRotations = (5 + Math.random() * 3) * 360;
    const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
    const totalRotation = extraRotations + targetAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(SEGMENTS[winIndex].hours);
      onResult(SEGMENTS[winIndex].hours);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-foreground drop-shadow-md" />
        </div>

        {/* Wheel */}
        <div
          className="transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? "4s" : "0s",
            transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
          }}
        >
          <canvas
            ref={(el) => {
              if (el) drawWheel(el);
            }}
            width={280}
            height={280}
            className="rounded-full shadow-xl"
          />
        </div>
      </div>

      {result === null && (
        <Button
          onClick={spin}
          disabled={spinning}
          size="xl"
          className="gap-2 animate-pulse"
        >
          <Gift className="h-5 w-5" />
          {spinning ? "Spinning..." : "Spin the Wheel!"}
        </Button>
      )}

      {result !== null && (
        <div className="text-center animate-fade-in">
          <p className="text-2xl font-bold text-foreground">
            🎉 You won {result === 24 ? "1 Day" : `${result} Hours`} of Free Listings!
          </p>
          <p className="text-muted-foreground mt-1">Create listings without any fee during this time.</p>
        </div>
      )}
    </div>
  );
}
