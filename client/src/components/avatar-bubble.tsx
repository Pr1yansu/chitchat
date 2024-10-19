import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { useEffect, useState } from "react";

type AvatarBubbleProps = {
  status?: "online" | "offline" | "away";
  size?: "default" | "sm" | "lg" | "xs" | "xl";
  image?: string;
  name: string;
};

const GOLDEN_RATIO_CONJUGATE = 0.6180339887;

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "size-10",
      sm: "size-8",
      lg: "size-12",
      xs: "size-6",
      xl: "size-14",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

function generateGoldenRatioColor() {
  let hue = Math.random();
  hue += GOLDEN_RATIO_CONJUGATE;
  hue %= 1;

  const h = Math.floor(hue * 360);
  const s = 70 + Math.random() * 10;
  const l = 50 + Math.random() * 10;
  const a = 0.25;

  const generateRandomTextColor = (
    h: number,
    s: number,
    l: number,
    a: number
  ) => {
    const hsl = `hsl(${h}, ${s}%, ${l}%)`;
    const rgb = `rgb(${
      hsl
        .match(/(\d+)/g)!
        .map((channel, index) =>
          index === 0
            ? (parseInt(channel) / 255) ** 2.2
            : parseInt(channel) / 255
        )
        .map((channel, index) =>
          index === 0
            ? channel * 0.299
            : index === 1
            ? channel * 0.587
            : channel * 0.114
        )
        .reduce((acc, channel) => acc + channel) >= 0.5
        ? "0,0,0"
        : "255,255,255"
    })`;
    return `rgba(${rgb},${a})`;
  };

  return {
    backgroundColor: `hsl(${h}, ${s}%, ${l}%, ${a})`,
    textColor: generateRandomTextColor(h, s, l, a),
  };
}

const AvatarBubble = ({ status, size, name, image }: AvatarBubbleProps) => {
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [textColor, setTextColor] = useState<string>("");

  useEffect(() => {
    setBackgroundColor(generateGoldenRatioColor().backgroundColor);
    setTextColor(generateGoldenRatioColor().textColor);
  }, []);

  return (
    <div className="flex">
      <div className="relative">
        <Avatar className={cn(avatarVariants({ size }))}>
          <AvatarImage src={image} />
          <AvatarFallback
            style={{
              backgroundColor: backgroundColor,
              color: textColor,
              fontWeight: 600,
            }}
          >
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        {status && (
          <div
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
              {
                "bg-emerald-500": status === "online",
                "bg-red-500": status === "offline",
                "bg-yellow-500": status === "away",
              }
            )}
          />
        )}
      </div>
    </div>
  );
};

export default AvatarBubble;
