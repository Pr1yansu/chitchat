import { cn } from "@/lib/utils";
import { AlertCircle, X } from "lucide-react";

interface FormErrorProps extends React.HTMLProps<HTMLDivElement> {
  error?: string;
  className?: string;
  onClose?: () => void;
}
const FormError = ({ error, className, onClose, ...props }: FormErrorProps) => {
  if (!error) return null;
  return (
    <div
      className={cn(
        "flex items-center p-2 bg-red-50 text-red-500 rounded-md justify-between",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-2 bg-red-50 text-red-500 rounded-md justify-between">
        <AlertCircle className="inline-block w-5 h-5 text-red-500" />
        <p className="text-sm font-semibold">{error}</p>
      </div>
      <X className="w-4 h-4 cursor-pointer" onClick={onClose} />
    </div>
  );
};

export default FormError;
