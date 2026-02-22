import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomModal } from "@/components/CustomModal";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: any;
}

export function ReminderModal({ isOpen, onClose, caseData }: ReminderModalProps) {
  const [title, setTitle] = useState(caseData ? `Hearing Reminder: ${caseData.caseNo}` : "");
  // Pre-fill time with next hearing date if available
  const [date, setDate] = useState<Date | undefined>(
    caseData?.nextDate ? new Date(caseData.nextDate) : new Date()
  );
  const [description, setDescription] = useState(
    caseData ? `Hearing for ${caseData.nameOfParty} vs ${caseData.oppositePartyName || 'Opposite Party'}` : ""
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const generateICS = () => {
      if (!title || !date) return;
      setIsProcessing(true);
      
      const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
      
      const start = new Date(date);
      start.setHours(9, 0, 0, 0);
      
      const end = new Date(date);
      end.setHours(12, 0, 0, 0);
      
      const startStr = formatDate(start);
      const endStr = formatDate(end);
      
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

      setTimeout(() => {
          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'reminder.ics');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setIsProcessing(false);
          toast.success("Event file downloaded.");
          onClose();
      }, 500);
  };

  const handleSetReminder = () => {
    if (!title || !date) {
      toast.error("Please provide a title and date.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
        const userAgent = navigator.userAgent || navigator.vendor;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        if (isIOS) {
            generateICS();
            return;
        }

        const start = new Date(date);
        start.setHours(9, 0, 0, 0);
        const startTime = start.toISOString().replace(/-|:|\.\d\d\d/g, "");

        const end = new Date(date);
        end.setHours(12, 0, 0, 0);
        const endTime = end.toISOString().replace(/-|:|\.\d\d\d/g, "");

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          title
        )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
          description
        )}`;

        window.open(googleCalendarUrl, "_blank");
        toast.success("Opening Google Calendar...");
        setIsProcessing(false);
        onClose();
    }, 500);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Calendar Reminder"
      description="Add this hearing to your device calendar."
      body={
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Reminder Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hearing Reminder"
          />
        </div>
        
        <div className="space-y-2">
            <Label>Date & Time</Label>
            <div className="block">
                <CustomDatePicker date={date} onChange={setDate} />
            </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about the reminder..."
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
            <Button onClick={handleSetReminder} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 rounded-xl font-bold">
                {isProcessing ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                    </div>
                ) : (
                    <>
                        <Calendar className="h-4 w-4" /> Add to Calendar
                    </>
                )}
            </Button>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
                 <button 
                    disabled={isProcessing}
                    onClick={() => {
                        if (!date) return;
                        setIsProcessing(true);
                        setTimeout(() => {
                            const start = new Date(date);
                            start.setHours(9, 0, 0, 0);
                            const startTime = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
                            
                            const end = new Date(date);
                            end.setHours(12, 0, 0, 0);
                            const endTime = end.toISOString().replace(/-|:|\.\d\d\d/g, "");
                            
                            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(description)}`;
                            window.open(url, "_blank");
                            setIsProcessing(false);
                            onClose();
                        }, 500);
                    }} 
                    className="text-xs text-muted-foreground hover:underline border-r disabled:opacity-50"
                 >
                    Use Google Calendar
                 </button>
                 <button 
                    disabled={isProcessing}
                    onClick={generateICS} 
                    className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                 >
                    Download .ics File
                 </button>
            </div>
        </div>
      </div>
      }
    />
  );
}
