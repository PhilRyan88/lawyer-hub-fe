import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CustomModalProps {
  title: string;
  body: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  description?: string;
}

export function CustomModal({
  title,
  body,
  className,
  isOpen,
  onClose,
  description
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-3xl max-h-[90vh] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{body}</div>
      </DialogContent>
    </Dialog>
  );
}
