import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Input } from "./ui/input";

interface UploadWidgetProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function UploadWidget({ value, onChange }: UploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleAttachmentChange = async (files: FileList | null) => {
    if (files) {
      setIsUploading(true);
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit.`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);

        try {
          const response = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          onChange(data.secure_url); // Pass the uploaded URL to the form
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {isUploading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Uploading...</span>
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            type="button"
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            <Paperclip className="h-5 w-5" />
            <span className="text-primary font-semibold text-sm ms-2">
              Upload Avatar
            </span>
          </Button>
          <Input
            id="avatar-upload"
            type="file"
            className="hidden"
            onChange={(e) => handleAttachmentChange(e.target.files)}
            accept=".jpeg,.png,.jpg"
          />
          {value && (
            <div className="flex items-center gap-2 bg-primary/10 p-2 rounded-lg justify-center">
              <img
                src={value}
                alt="Uploaded Avatar"
                className="h-24 w-24 object-cover rounded-full"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
