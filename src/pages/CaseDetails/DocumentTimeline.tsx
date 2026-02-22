import React, { useState } from "react";
import { format } from "date-fns";
import { Trash, Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Stage {
  _id: string;
  name: string;
  order: number;
}

interface Document {
  _id: string;
  name: string;
  stage?: Stage | string; // Populated or ID
  currentLocation?: string;
  updatedAt: string;
  history?: any[];
  type?: any;
}

interface DocumentTimelineProps {
  documents: Document[];
  stages: Stage[];
  onMoveDocument: (docId: string, stageId: string) => void;
  onAddStage: (name: string) => void;
  onDeleteStage?: (id: string) => void;
  isLoading?: boolean;
}

export function DocumentTimeline({
  documents,
  stages,
  onMoveDocument,
  onAddStage,
  onDeleteStage,
  isLoading
}: DocumentTimelineProps) {
  const [draggedDocId, setDraggedDocId] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState("");
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, docId: string) => {
    e.dataTransfer.setData("docId", docId);
    setDraggedDocId(docId);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const docId = e.dataTransfer.getData("docId");
    if (docId) {
      onMoveDocument(docId, stageId);
    }
    setDraggedDocId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const groupedDocs = stages.reduce((acc, stage) => {
    acc[stage._id] = documents.filter(d => 
        (d.stage && (typeof d.stage === 'object' ? d.stage._id === stage._id : d.stage === stage._id))
    );
    return acc;
  }, {} as Record<string, Document[]>);

  // Catch-all for documents without a valid stage (or new ones)
  const unassignedDocs = documents.filter(d => !d.stage || (typeof d.stage === 'string' && !stages.find(s => s._id === d.stage)));

  if (isLoading) {
      return <div className="p-10 text-center text-muted-foreground">Loading timeline...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Document Timeline</h2>
        <Popover open={isAddStageOpen} onOpenChange={setIsAddStageOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Stage
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex gap-2">
              <Input 
                placeholder="Stage Name (e.g. Court)" 
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
              />
              <Button onClick={() => {
                if (newStageName.trim()) {
                  onAddStage(newStageName);
                  setNewStageName("");
                  setIsAddStageOpen(false);
                }
              }}>Add</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-slate-50/50 dark:bg-muted/10 p-4 min-h-[300px]">
        <div className="flex space-x-4 min-w-max pb-4">
            
            {/* Unassigned Column (if any) */}
            {unassignedDocs.length > 0 && (
                <div 
                    className="w-72 shrink-0 bg-slate-100/50 dark:bg-muted/20 rounded-lg p-3 border-2 border-dashed border-slate-200 dark:border-border"
                    onDrop={(e) => handleDrop(e, "")} // Handle clearing stage?
                    onDragOver={handleDragOver}
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-slate-500 dark:text-muted-foreground">Unassigned</span>
                        <Badge variant="secondary">{unassignedDocs.length}</Badge>
                    </div>
                     <div className="flex flex-col gap-2">
                        {unassignedDocs.map(doc => (
                            <DocumentCard 
                                key={doc._id} 
                                doc={doc} 
                                onDragStart={handleDragStart} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Stages Columns */}
            {stages.map((stage) => (
                <div 
                    key={stage._id}
                    className="w-80 shrink-0 bg-white dark:bg-card rounded-lg p-3 shadow-sm border"
                    onDrop={(e) => handleDrop(e, stage._id)}
                    onDragOver={handleDragOver}
                >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-card-foreground uppercase text-sm tracking-wide">{stage.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-muted">{groupedDocs[stage._id]?.length || 0}</Badge>
                             {onDeleteStage && (
                                <Trash className="h-4 w-4 text-slate-300 hover:text-red-500 cursor-pointer" onClick={() => onDeleteStage(stage._id)} />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 min-h-[100px]">
                        {groupedDocs[stage._id]?.map(doc => (
                            <DocumentCard 
                                key={doc._id} 
                                doc={doc} 
                                onDragStart={handleDragStart} 
                                isDragging={draggedDocId === doc._id}
                            />
                        ))}
                         {(!groupedDocs[stage._id] || groupedDocs[stage._id].length === 0) && (
                            <div className="h-full flex items-center justify-center text-slate-300 text-xs italic py-4">
                                Drop here
                            </div>
                         )}
                    </div>
                </div>
            ))}
            
            {/* Add Stage Placeholder */}
            <div 
                className="w-16 shrink-0 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-border hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-colors"
                onClick={() => setIsAddStageOpen(true)}
            >
                <Plus className="h-6 w-6 text-slate-300 dark:text-muted-foreground" />
            </div>

        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function DocumentCard({ doc, onDragStart, isDragging }: { doc: Document, onDragStart: any, isDragging?: boolean }) {
    return (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, doc._id)}
            className={cn(
                "group relative bg-white dark:bg-card border rounded-md p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 border-l-sky-500 dark:border-l-sky-500",
                isDragging && "opacity-50 ring-2 ring-sky-500 border-dashed"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm line-clamp-2">{doc.name}</h4>
                 <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-5 w-5 -mt-1 -mr-1 text-slate-400 hover:text-sky-600">
                            <History className="h-3 w-3" />
                         </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Details & History: {doc.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-muted-foreground">Type:</span> {doc.type?.name || "N/A"}</div>
                            </div>
                            
                            <h5 className="font-semibold border-b pb-1 mt-4">Movement History</h5>
                            <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 ml-1">
                                {doc.history?.slice().reverse().map((h: any, i: number) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-sky-500 border-2 border-white ring-1 ring-slate-200"></div>
                                        <p className="text-sm font-medium">{h.stage?.name || "Initial"}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(h.date), "PPP p")}</p>
                                        {h.notes && <p className="text-xs italic text-slate-500 mt-1">"{h.notes}"</p>}
                                    </div>
                                ))}
                                {(!doc.history || doc.history.length === 0) && <p className="text-sm text-muted-foreground">No history yet.</p>}
                            </div>
                        </div>
                    </DialogContent>
                 </Dialog>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 flex-wrap">
                 <Badge variant="outline" className="text-[10px] px-1 h-5">{doc.type?.name || "Doc"}</Badge>
            </div>
        </div>
    );
}
