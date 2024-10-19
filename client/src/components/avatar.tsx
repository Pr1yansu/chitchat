import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MainAvatar = ({ src, sn }: { src?: string; sn?: string }) => {
  return (
    <div className="border-[3px] border-primary p-1 rounded-full border-t-transparent rotate-45">
      <Avatar className="size-10 -rotate-45">
        <AvatarImage src={src} />
        <AvatarFallback>{sn || "U"}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default MainAvatar;
