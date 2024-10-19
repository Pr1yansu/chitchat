import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  text?: string;
  loading?: boolean;
  textClassname?: string;
  imageClassname?: string;
}

const Logo = ({
  className = "",
  text,
  loading = false,
  textClassname = "text-4xl",
  imageClassname = "size-80",
  ...props
}: LogoProps) => {
  return (
    <div
      className={cn("flex flex-col justify-center items-center", className)}
      {...props}
    >
      <img
        src="./assets/logo.svg"
        alt={loading ? "loading" : "logo"}
        className={cn("size-80", loading && " animate-pulse", imageClassname)}
      />
      {text && (
        <p
          className={cn(
            "text-center text-orange-500 font-bold mt-4 uppercase",
            textClassname
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Logo;
