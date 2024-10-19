import AvatarBubble from "@/components/avatar-bubble";
import { cn } from "@/lib/utils";
import { MessageCircle, PencilLine } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface ContactProps {
  typingStatus?: boolean;
  sentShortMsg?: string;
  id: string;
  newChatCount?: number;
  image?: string;
  name: string;
  type: "user" | "group";
}

const Contact = ({
  typingStatus = true,
  id,
  newChatCount,
  sentShortMsg,
  image,
  name,
  type,
}: ContactProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectChat = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get("chat") === id) {
      params.delete("chat");
    } else {
      params.set("chat", id);
    }

    setSearchParams(params);
  };

  const selectGroup = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get("group") === id) {
      params.delete("group");
    } else {
      params.set("group", id);
    }

    setSearchParams(params);
  };

  return (
    <button
      className={cn(
        "flex items-center p-2 cursor-pointer px-2 py-1 hover:bg-white focus:bg-white w-full justify-between",
        {
          "bg-white": searchParams.get("chat") === id,
        }
      )}
      onClick={type === "user" ? selectChat : selectGroup}
    >
      <div className="flex items-center gap-x-2 p-2 cursor-pointer hover:bg-white focus:bg-white w-full">
        <AvatarBubble status="online" size="lg" image={image} name={name} />
        <div className="space-y-1">
          <h4 className="text-base font-bold line-clamp-1">{name}</h4>
          {typingStatus ? (
            <p className="text-xs text-primary/60 flex items-center gap-2 line-clamp-1">
              <PencilLine className="size-3" />
              typing...
            </p>
          ) : (
            <>
              {sentShortMsg && (
                <p className="text-xs text-primary/60 flex items-center gap-2 line-clamp-1">
                  <MessageCircle className="size-3" />
                  {sentShortMsg}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {newChatCount && (
        <div className="bg-primary/10 text-primary flex justify-center items-center rounded-full size-10 text-xs font-semibold aspect-square">
          {newChatCount}
        </div>
      )}
    </button>
  );
};

export default Contact;
