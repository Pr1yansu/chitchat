import { Button } from "@/components/ui/button";
import { MoreHorizontal, Send, X, Loader2, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Attachment } from "@/types";

interface CustomInputProps {
  placeholder?: string;
  onSend?: (message: {
    content: string;
    type: "text" | "image" | "audio" | "video";
    attachments?: Attachment[];
  }) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

export default function CustomInput({
  placeholder,
  onSend,
  onTyping,
  disabled,
  onStopTyping,
}: CustomInputProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputField = document.getElementById(
      "message-input"
    ) as HTMLTextAreaElement;

    if (!inputField.value.trim() && attachments.length === 0) {
      toast.error("Message cannot be empty.");
      return;
    }

    if (onSend) {
      setIsSending(true);
      try {
        onSend({
          content: inputField.value,
          type:
            attachments.length > 0
              ? (attachments[0].type.split("/")[0] as
                  | "text"
                  | "image"
                  | "audio"
                  | "video")
              : "text",
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        inputField.value = "";
        setAttachments([]);
      } catch {
        toast.error("Failed to send message. Please try again.");
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;

    if (onTyping) onTyping();
    if (target.value === "" && onStopTyping) onStopTyping();
  };

  const handleAttachmentChange = async (files: FileList | null) => {
    if (files) {
      setIsUploading(true);
      const newAttachments: Attachment[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit.`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);

        try {
          const response = await fetch(
            import.meta.env.VITE_CLOUDINARY_URL as string,
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await response.json();
          newAttachments.push({ url: data.secure_url, type: file.type });
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      setAttachments([...attachments, ...newAttachments]);
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  return (
    <form
      className="relative flex items-center gap-2"
      onSubmit={handleSendClick}
    >
      <Textarea
        id="message-input"
        disabled={disabled || isSending}
        placeholder={placeholder || "Type message here..."}
        className="border-b outline-none focus-visible:ring-0 text-base font-semibold resize-none min-h-10 no-scrollbar overflow-hidden"
        rows={1}
        onInput={handleInput}
      />
      <div className="flex gap-1 h-full mt-2 justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              type="button"
              disabled={disabled || isSending}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="flex flex-col gap-2 w-auto">
            {isUploading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Uploading...</span>
              </div>
            ) : attachments.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {attachments.map((attachment, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={attachment.url}
                      alt="attachment"
                      className="h-40 w-40 object-cover rounded-md"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                  <span className="text-primary font-semibold text-sm ms-2">
                    Any File (Max 5MB)
                  </span>
                  <Input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleAttachmentChange(e.target.files)}
                    multiple
                    accept=".zip,.jpeg,.png,audio/*"
                  />
                </Button>
              </>
            )}
          </PopoverContent>
        </Popover>
        <Button
          size="icon"
          variant="ghost"
          type="submit"
          disabled={disabled || isSending}
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
