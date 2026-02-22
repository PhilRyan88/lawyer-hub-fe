import React, { useState } from "react";
import { format } from "date-fns";
import { Trash, Plus, History, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  type DropAnimation,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
};

export function DocumentTimeline({
  documents,
  stages,
  onMoveDocument,
  onAddStage,
  onDeleteStage,
  isLoading
}: DocumentTimelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState("");
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    }),
    useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        },
    }),
    useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const groupedDocs = stages.reduce((acc, stage) => {
    acc[stage._id] = documents.filter(d => 
        (d.stage && (typeof d.stage === 'object' ? d.stage._id === stage._id : d.stage === stage._id))
    );
    return acc;
  }, {} as Record<string, Document[]>);

  const unassignedDocs = documents.filter(d => !d.stage || (typeof d.stage === 'string' && !stages.find(s => s._id === d.stage)));

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id) {
       // active.id is docId, over.id is stageId (or "" for unassigned)
       onMoveDocument(active.id, over.id === "unassigned" ? "" : over.id);
    }
    setActiveId(null);
  };

  if (isLoading) {
      return <div className="p-10 text-center text-muted-foreground">Loading timeline...</div>;
  }

  const activeDoc = documents.find(d => d._id === activeId);

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

      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
        autoScroll={{ threshold: { x: 0.15, y: 0.15 }, acceleration: 10, interval: 10 }}
      >
        <div className="rounded-xl border bg-muted/30 dark:bg-muted/10 p-4">
            <ScrollArea className="w-full whitespace-nowrap rounded-lg min-h-[450px]">
            <div className="flex space-x-6 min-w-max p-4">
                
                {/* Unassigned Column - Only visible strictly if it has docs */}
                {unassignedDocs.length > 0 && (
                    <DroppableColumn id="unassigned" title="Unassigned" count={unassignedDocs.length}>
                        {unassignedDocs.map(doc => (
                            <DraggableDocument key={doc._id} doc={doc} isBeingDragged={activeId === doc._id} />
                        ))}
                    </DroppableColumn>
                )}

                {/* Stages Columns */}
                {stages.map((stage) => (
                    <DroppableColumn 
                        key={stage._id} 
                        id={stage._id} 
                        title={stage.name} 
                        count={groupedDocs[stage._id]?.length || 0}
                        onDelete={onDeleteStage ? () => onDeleteStage(stage._id) : undefined}
                    >
                        {groupedDocs[stage._id]?.map(doc => (
                            <DraggableDocument key={doc._id} doc={doc} isBeingDragged={activeId === doc._id} />
                        ))}
                    </DroppableColumn>
                ))}
                
                {/* Add Stage Placeholder */}
                <div 
                    className="w-16 shrink-0 flex items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/10 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all group h-[400px]"
                    onClick={() => setIsAddStageOpen(true)}
                >
                    <Plus className="h-6 w-6 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                </div>

            </div>
            <ScrollBar orientation="horizontal" className="bg-transparent" />
            </ScrollArea>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
            {activeId && activeDoc ? (
                <div className="w-80 opacity-90 scale-105 pointer-events-none">
                    <DocumentCard doc={activeDoc} isOverlay />
                </div>
            ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function DroppableColumn({ id, title, count, children, onDelete }: { id: string, title: string, count: number, children: React.ReactNode, onDelete?: () => void }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div 
            ref={setNodeRef}
            className={cn(
                "w-80 shrink-0 bg-background dark:bg-card/50 rounded-xl p-4 border transition-all flex flex-col h-full min-h-[400px]",
                isOver ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border/50 shadow-lg",
                id === "unassigned" && "bg-muted/40 dark:bg-secondary/10 border-dashed border-muted-foreground/20"
            )}
        >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground/80 uppercase text-[10px] tracking-widest">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px] bg-muted/80">{count}</Badge>
                    {onDelete && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground/40 hover:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 min-h-[150px] flex-1">
                {children}
                {count === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/20 border-2 border-dashed border-muted-foreground/10 rounded-lg py-8">
                        <Plus className="h-6 w-6 mb-1 opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Drop here</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function DraggableDocument({ doc, isBeingDragged }: { doc: Document, isBeingDragged?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: doc._id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className="touch-none"
        >
            <DocumentCard 
                doc={doc} 
                isBeingDragged={isBeingDragged} 
                dragHandleProps={{ ...attributes, ...listeners }} 
            />
        </div>
    );
}

function DocumentCard({ doc, isBeingDragged, dragHandleProps, isOverlay }: { doc: Document, isBeingDragged?: boolean, dragHandleProps?: any, isOverlay?: boolean }) {
    return (
        <div 
            className={cn(
                "group relative bg-card border rounded-xl p-4 shadow-sm border-l-4 border-l-primary/70",
                "hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-l-primary hover:bg-accent/5",
                !isOverlay && !isBeingDragged && "transition-all duration-300",
                isBeingDragged && "opacity-50 ring-2 ring-primary/20 border-dashed scale-95",
                isOverlay && "shadow-2xl ring-2 ring-primary/50"
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                        {...dragHandleProps} 
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted/50 transition-colors shrink-0"
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                    </div>
                    <h4 className="font-bold text-sm tracking-tight leading-snug text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                        {doc.name}
                    </h4>
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground/30 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors pointer-events-auto">
                            <History className="h-3.5 w-3.5" />
                         </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                {doc.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/50 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Document Type</p>
                                    <p className="text-sm font-semibold">{doc.type?.name || "Standard Document"}</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Last Updated</p>
                                    <p className="text-sm font-semibold">{format(new Date(doc.updatedAt), "MMM d, yyyy")}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h5 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-border" />
                                    Movement History
                                    <div className="h-px flex-1 bg-border" />
                                </h5>
                                <div className="space-y-6 relative pl-4 ml-1 border-l border-border/60">
                                    {doc.history?.slice().reverse().map((h: any, i: number) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[20.5px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                                            <p className="text-sm font-bold text-foreground/90">{h.stage?.name || "Initial Registration"}</p>
                                            <p className="text-[11px] font-medium text-muted-foreground">{format(new Date(h.date), "PPP p")}</p>
                                            {h.notes && (
                                                <div className="mt-2 p-2 bg-muted/30 rounded-lg border border-border/50">
                                                    <p className="text-xs italic text-muted-foreground leading-relaxed">"{h.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!doc.history || doc.history.length === 0) && (
                                        <div className="text-center py-4 bg-muted/20 rounded-xl border border-dashed">
                                            <p className="text-xs font-medium text-muted-foreground">No history records found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                 </Dialog>
            </div>
            
            <div className="flex items-center gap-2">
                 <Badge variant="outline" className="text-[10px] font-bold px-2 h-5 bg-muted/30 border-muted-foreground/10 text-muted-foreground">
                    {doc.type?.name || "DOC"}
                 </Badge>
                 <span className="text-[10px] font-medium text-muted-foreground/50 ml-auto">
                    {format(new Date(doc.updatedAt), "MMM d")}
                 </span>
            </div>
        </div>
    );
}
