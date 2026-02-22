import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FileText, MessageSquare, Printer, Bell, ArrowLeft, Edit2, Trash, Plus, Phone, MapPin } from "lucide-react";
import { 
    useGetCaseQuery, 
    useAddHearingMutation, 
    useUpdateHearingMutation, 
    useDeleteHearingMutation,
    useGetContactsQuery,
    useAddContactMutation,
    useUpdateContactMutation,
    useDeleteContactMutation,
    useGetDocumentsQuery,
    useAddDocumentMutation,
    useUpdateDocumentMutation,
    useDeleteDocumentMutation,
    useGetDocumentStagesQuery,
    useAddDocumentStageMutation,
    useDeleteDocumentStageMutation
} from "./caseDetailsApi";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CustomModal } from "@/components/CustomModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CaseForm } from "../Dashboard/CaseForm";
import { ContactForm } from "./ContactForm"; 
import { ReminderModal } from "@/components/ReminderModal"; 
import { DocumentTimeline } from "./DocumentTimeline"; // Import Timeline
import { toast } from "sonner";



export default function CaseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: caseData, isLoading, isError } = useGetCaseQuery(id);
    

    const [addHearing] = useAddHearingMutation();
    const [updateHearing] = useUpdateHearingMutation();
    const [deleteHearing] = useDeleteHearingMutation();


    const { data: contacts = [], isLoading: isContactsLoading } = useGetContactsQuery(id, {
        skip: !id, 
    });
    const [addContact] = useAddContactMutation();
    const [updateContact] = useUpdateContactMutation();
    const [deleteContact] = useDeleteContactMutation();

    const { data: documents = [], isLoading: isDocumentsLoading } = useGetDocumentsQuery(id, { skip: !id });
    const { data: stages = [], isLoading: isStagesLoading } = useGetDocumentStagesQuery({});
    const [addDocument] = useAddDocumentMutation();
    const [updateDocument] = useUpdateDocumentMutation();
    const [addStage] = useAddDocumentStageMutation();
    const [deleteStage] = useDeleteDocumentStageMutation();
    const [deleteDocument] = useDeleteDocumentMutation();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false); 
    const [editingContact, setEditingContact] = useState<any>(null); // State for editing
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false); // New State
    const [editingHearing, setEditingHearing] = useState<any>(null); 
    
    // Delete Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        type: 'hearing' | 'contact' | null;
        id: string | null;
    }>({ isOpen: false, type: null, id: null });

    const isAddingNewHearing = editingHearing?.isNew === true;

    const safeFormatDate = (dateString: any) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return format(date, "dd MMM yyyy");
        } catch (error) {
            console.error("Date formatting error:", error);
            return "Error";
        }
    };

    if (isLoading) return <div className="p-10 text-center text-foreground">Loading case details...</div>;
    if (isError) return <div className="p-10 text-center text-red-500">Error loading case. Please check your connection.</div>;
    if (!caseData) return <div className="p-10 text-center text-foreground">Case not found</div>;

    // URL Query Params for Highlighting
    const queryParams = new URLSearchParams(window.location.search);
    const shouldHighlight = queryParams.get("highlight") === "true";
    
    // Calculate index of first hearing with missing date for scrolling
    const hearings = caseData?.hearings || [];
    const firstMissingIndex = hearings.findIndex((h: any) => !h.registrationDate);

    // --- Hearing Handlers ---
    const handleSaveHearing = async (data: any) => {
        try {
            if (isAddingNewHearing) {
                const { isNew, _id, ...cleanData } = data; 
                await addHearing({
                    caseId: id,
                    ...cleanData
                }).unwrap();
                toast.success("Case updated successfully");
            } else {
                await updateHearing({
                    id: editingHearing._id,
                    caseId: id, 
                    ...data
                }).unwrap();
                toast.success("Hearing updated successfully");
            }
            setIsEditModalOpen(false);
            setEditingHearing(null);
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error("Failed to save changes");
        }
    }

    const startUpdateCase = () => {
        const lastHearing = caseData.hearings && caseData.hearings.length > 0 ? caseData.hearings[0] : null; 
        
        const prefillData = {
           registrationDate: lastHearing ? lastHearing.registrationDate : (caseData.nextDate || new Date().toISOString()),
           previousDate: lastHearing ? lastHearing.previousDate : (caseData.previousDate || new Date().toISOString()),
           nextDate: null,
           
           courtName: lastHearing?.courtName || caseData.courtName,
           caseNo: lastHearing?.caseNo || caseData.caseNo,
           nameOfParty: lastHearing?.nameOfParty || caseData.nameOfParty,
           particulars: lastHearing?.particulars || caseData.particulars,
           stage: lastHearing?.stage || caseData.stage,
           notes: "",
           // New Fields
           caseType: lastHearing?.caseType || caseData.caseType,
           roleOfParty: lastHearing?.roleOfParty || caseData.roleOfParty,
           oppositePartyName: lastHearing?.oppositePartyName || caseData.oppositePartyName,

           oppositeCounselName: lastHearing?.oppositeCounselName || caseData.oppositeCounselName,
           additionalParties: lastHearing?.additionalParties || caseData.additionalParties,
           additionalOppositeParties: lastHearing?.additionalOppositeParties || caseData.additionalOppositeParties,
        };
        
        setEditingHearing({ ...prefillData, isNew: true });
        setIsEditModalOpen(true);
    };

    const startEditHearing = (hearing: any) => {
        setEditingHearing(hearing);
        setIsEditModalOpen(true);
    }

    const handleDeleteHearing = (hearingId: string) => {
        setDeleteConfirmation({ isOpen: true, type: 'hearing', id: hearingId });
    }

    const handleSaveContact = async (data: any) => {
        try {
            const { documents: docData, removedDocIds, _id: _contactId, ...contactData } = data;
            
            let contactId = editingContact?._id;

            if (editingContact) {
                await updateContact({ id: contactId, ...contactData }).unwrap();
                toast.success("Contact updated");
            } else {
                const newContact = await addContact({ caseId: id, ...contactData }).unwrap();
                contactId = newContact._id;
                toast.success("Contact added");
            }
            
            if (docData && docData.length > 0) {
                for (const doc of docData) {
                   if (doc._id) {
                       // Update Existing
                       const { _id, ...updates } = doc;
                       await updateDocument({ id: _id, ...updates }).unwrap();
                   } else {
                       // Create New
                       await addDocument({
                           caseId: id,
                           contactId: contactId,
                           ...doc
                       }).unwrap();
                   }
                }
            }

            // Handle Deleted Documents
            if (removedDocIds && removedDocIds.length > 0) {
                 for (const docId of removedDocIds) {
                     await deleteDocument(docId).unwrap();
                 }
            }

            setIsContactModalOpen(false);
            setEditingContact(null);
        } catch (error: any) {
            console.error("Save contact/document error:", error);
            toast.error("Failed to save contact operations");
        }
    }

    const startEditContact = (contact: any) => {
        setEditingContact(contact);
        setIsContactModalOpen(true);
    };

    const handleMoveDocument = async (docId: string, stageId: string) => {
        try {
            await updateDocument({ id: docId, stage: stageId }).unwrap();
            toast.success("Document moved");
        } catch (error) {
            console.error("Move document error", error);
            toast.error("Failed to move document");
        }
    };

    const handleAddStage = async (name: string) => {
        try {
            await addStage({ name, order: stages.length }).unwrap();
            toast.success("Stage added");
        } catch (error) {
            toast.error("Failed to add stage");
        }
    };

    const handleDeleteStage = async (stageId: string) => {
         // Add confirmation logic ideally
         try {
             await deleteStage(stageId).unwrap();
             toast.success("Stage deleted");
         } catch (error) {
             toast.error("Failed to delete stage");
         }
    };

    const handleDeleteContact = (contactId: string) => {
        setDeleteConfirmation({ isOpen: true, type: 'contact', id: contactId });
    }

    const confirmDeleteAction = async () => {
        const { type, id } = deleteConfirmation;
        if (!type || !id) return;

        try {
            if (type === 'hearing') {
                await deleteHearing(id).unwrap();
                toast.success("Hearing deleted");
            } else if (type === 'contact') {
                await deleteContact(id).unwrap();
                toast.success("Contact deleted");
            }
        } catch (err) {
            toast.error("Failed to delete item");
        }
    };
    

    
    const openWhatsApp = (number: string) => {
         if(number) {
            window.open(`https://wa.me/${number}`, '_blank');
        }
    }

    // Role based access
    const role = localStorage.getItem("role");
    const isAdminOrSuperAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    return (
        <div className="min-h-screen bg-muted/40 pb-10">

            <div className="container mx-auto py-10 px-4">
                {/* Header / Breadcrumb */}
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-muted">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold">Case Details</h1>
                </div>

            {/* Tabs */}
            <Tabs defaultValue="hearings" className="w-full">
                <div className="mb-4">
                    <TabsList className="w-full justify-start rounded-md bg-transparent p-0 h-auto border-b">
                        <TabsTrigger 
                            value="hearings" 
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                        >
                            All Hearings
                        </TabsTrigger>
                        <TabsTrigger 
                            value="contacts" 
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                        >
                            Client Contacts
                        </TabsTrigger>
                        <TabsTrigger 
                            value="linked" 
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                        >
                            Linked Cases
                        </TabsTrigger>
                        <TabsTrigger 
                            value="documents" 
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                        >
                            Documents & Timeline
                        </TabsTrigger>
                        {isAdminOrSuperAdmin && (
                            <TabsTrigger 
                                value="fees" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                            >
                                Fee Details
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="hearings" className="space-y-4">
                    {/* ... (rest of hearings content) */}

                    {/* Main Case Card */}
                    <div className="bg-card rounded-lg p-6 shadow-sm border space-y-6">
                        <div className="flex justify-center mb-4">
                            <h2 className="text-lg font-semibold text-sky-500">Case Details</h2>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Case Status:</span>
                                <Badge variant="outline" className="text-sky-500 border-sky-500 rounded-full px-4">Active</Badge> 
                            </div>
                            <Button 
                                    size="sm" 
                                    className="bg-sky-500 hover:bg-sky-600 text-white"
                                    onClick={startUpdateCase}
                                >
                                    <Edit2 className="h-4 w-4 mr-2" /> Update Case
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                             <Button variant="outline" size="sm" className="rounded-full text-sky-600 bg-sky-50 border-sky-100">
                                <FileText className="h-4 w-4 mr-1" /> Note
                             </Button>
                             {/* Generic Send Message acts as shortcut to first contact */}
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full text-sky-600 bg-sky-50 border-sky-100"
                                onClick={() => {
                                    if (contacts && contacts.length > 0) {
                                        // specific requirement: "use that contact for texting in whatsapp"
                                        // We default to the first one for this shortcut button
                                        window.open(`https://wa.me/${contacts[0].whatsappNo}`, '_blank');
                                    } else {
                                        toast.warning("Client contact isn't added");
                                    }
                                }}
                             >
                                <MessageSquare className="h-4 w-4 mr-1" /> Send Message
                             </Button>
                             <Button variant="outline" size="sm" className="rounded-full text-sky-600 bg-sky-50 border-sky-100">
                                <Printer className="h-4 w-4 mr-1" /> Print
                             </Button>
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full text-sky-600 bg-sky-50 border-sky-100"
                                onClick={() => setIsReminderModalOpen(true)}
                             >
                                <Bell className="h-4 w-4 mr-1" /> Set Reminder
                             </Button>
                        </div>

                        {/* Case Info Grid */}
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            {/* Case No & Type */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg">{caseData.caseNo}</p>
                                    {caseData.caseType && <Badge variant="secondary" className="text-xs">{caseData.caseType}</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">Case No.</p>
                            </div>
                            
                            {/* Next Date */}
                            <div className="text-right">
                                <p className="font-bold text-lg">{safeFormatDate(caseData.nextDate)}</p>
                                <p className="text-xs text-muted-foreground">Next Date</p>
                            </div>

                            {/* Party & Role */}
                            <div className="col-span-2 text-center my-2 border-b pb-4">
                                <p className="font-bold text-xl">{caseData.nameOfParty}</p>
                                <div className="flex items-center justify-center gap-2">
                                    <p className="text-xs text-muted-foreground">Name of Party</p>
                                    {caseData.roleOfParty && <span className="text-xs font-medium text-sky-600">({caseData.roleOfParty})</span>}
                                </div>
                                {caseData.additionalParties && (
                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{caseData.additionalParties}</p>
                                )}
                            </div>

                            {/* Opposite Party Section */}
                            {(caseData.oppositePartyName || caseData.oppositeCounselName) && (
                                <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-2 rounded-md mb-2">
                                    <div>
                                         <p className="font-medium">{caseData.oppositePartyName || "-"}</p>
                                         <p className="text-xs text-muted-foreground">Opposite Party</p>
                                         {caseData.additionalOppositeParties && (
                                             <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{caseData.additionalOppositeParties}</p>
                                         )}
                                    </div>
                                    <div className="text-right">
                                         <p className="font-medium">{caseData.oppositeCounselName || "-"}</p>
                                         <p className="text-xs text-muted-foreground">Opposite Counsel</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="font-medium">{caseData.particulars || "-"}</p>
                                <p className="text-xs text-muted-foreground">Particular</p>
                            </div>
                             <div className="text-right">
                                <p className="font-medium">{caseData.courtName}</p>
                                <p className="text-xs text-muted-foreground">Court Name</p>
                            </div>
                        </div>
                    </div>

                    {/* History Cards */}
                    {/* History Cards */}
                    {hearings.map((hearing: any, index: number) => {
                        const isMissingDate = !hearing.registrationDate;
                        const isHighlighted = shouldHighlight && isMissingDate;
                        const shouldScroll = isHighlighted && index === firstMissingIndex;
                        
                        return (
                        <div 
                            key={index} 
                            ref={(el) => {
                                if (shouldScroll && el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }}
                            className={`bg-card rounded-lg shadow-sm border overflow-hidden ${isHighlighted ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                        >
                            <div className="bg-sky-50 p-2 px-4 flex justify-between items-center border-b border-sky-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-sky-600 font-medium">Head:</span>
                                    {/* User: "first table from below' head title is the registration date of it" */}
                                    {/* AND "above table... head tittle date of thtat table" */}
                                    {/* Backend now stores the desired "Head Title" date in `registrationDate` for ALL records including the top one */}
                                    <span className="font-semibold text-sky-500">
                                        {hearing.registrationDate ? safeFormatDate(hearing.registrationDate) : "Date Not Updated"}
                                    </span>
                                </div>
                                <div className="flex gap-2 text-slate-400">
                                    <Trash 
                                        className="h-4 w-4 cursor-pointer hover:text-red-500" 
                                        onClick={() => handleDeleteHearing(hearing._id)}
                                    />
                                    <Edit2 
                                        className="h-4 w-4 cursor-pointer hover:text-sky-500" 
                                        onClick={() => startEditHearing(hearing)}
                                    />
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Previous Date</p>
                                    <p className="text-sm font-medium">
                                        {safeFormatDate(hearing.previousDate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Name of Court</p>
                                    <p className="text-sm font-medium">{hearing.courtName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Case No.</p>
                                    <p className="text-sm font-medium">{hearing.caseNo}</p>
                                </div>
                                
                                <div className="col-span-3 text-center pt-2 border-t mt-2">
                                </div>
                            </div>
                             {hearing.notes && (
                                <div className="px-4 pb-4">
                                     <p className="text-xs text-muted-foreground">Note: {hearing.notes}</p>
                                </div>
                             )}
                        </div>
                        );
                    })}
                </TabsContent>
                
                <TabsContent value="contacts">
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button 
                                size="sm" 
                                onClick={() => {
                                    setEditingContact(null);
                                    setIsContactModalOpen(true);
                                }} 
                                className="bg-sky-500 hover:bg-sky-600"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Contact
                            </Button>
                        </div>
                        
                        {isContactsLoading && <div className="text-center">Loading contacts...</div>}
                        
                        {!isContactsLoading && contacts.length === 0 && (
                            <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                                No contacts added yet.
                            </div>
                        )}

                        <div className="grid gap-4">
                            {contacts.map((contact: any) => (
                                <div key={contact._id} className="bg-card rounded-lg p-4 shadow-sm border flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-green-500" />
                                            <span className="font-semibold text-lg">{contact.whatsappNo}</span>
                                            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer" onClick={() => openWhatsApp(contact.whatsappNo)}>
                                                WhatsApp
                                            </Badge>
                                        </div>
                                        {contact.alternativeNo && (
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Phone className="h-3 w-3" />
                                                <span>Alt: {contact.alternativeNo}</span>
                                            </div>
                                        )}
                                        {contact.address && (
                                            <div className="flex items-start gap-2 text-muted-foreground text-sm mt-2">
                                                <MapPin className="h-3 w-3 mt-0.5" />
                                                <span>{contact.address}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" className="hover:text-red-500 text-slate-400" onClick={() => handleDeleteContact(contact._id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="hover:text-sky-500 text-slate-400" onClick={() => startEditContact(contact)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="linked">
                    <div className="space-y-4">
                         {(!caseData.linkedCases || caseData.linkedCases.length === 0) && (
                            <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                                No cases linked.
                            </div>
                        )}
                        <div className="grid gap-2">
                            {caseData.linkedCases?.map((linked: any) => (
                                <div  
                                    key={linked._id || linked} 
                                    className="bg-card p-4 rounded-lg border shadow-sm cursor-pointer hover:bg-accent transition-colors flex justify-between items-center"
                                    onClick={() => navigate(`/dashboard/case/${linked._id || linked}`)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg">{linked.caseNo || "No Case Number"}</span>
                                        <span className="text-sm text-muted-foreground">{linked.nameOfParty || "Unknown Party"}</span>
                                    </div>
                                    <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="documents">
                    <DocumentTimeline
                        documents={documents}
                        stages={stages}
                        onMoveDocument={handleMoveDocument}
                        onAddStage={handleAddStage}
                        onDeleteStage={handleDeleteStage}
                        isLoading={isDocumentsLoading || isStagesLoading}
                    />
                </TabsContent>

                {isAdminOrSuperAdmin && (
                     <TabsContent value="fees">
                        <div className="p-4 text-center text-muted-foreground">Fee Details (Coming Soon)</div>
                    </TabsContent>
                )}
            </Tabs>

             {/* Update/Edit Hearing Modal */}
             <CustomModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={isAddingNewHearing ? "Update Case" : "Edit Hearing"}
                body={
                     <CaseForm
                        initialData={editingHearing || caseData}
                        onSubmit={handleSaveHearing}
                        isLoading={false}
                        isUpdate={true} 
                        isAddingHearing={isAddingNewHearing}
                    />
                }
            />

               {/* Add/Edit Contact Modal */}
               <CustomModal
                isOpen={isContactModalOpen}
                onClose={() => {
                    setIsContactModalOpen(false);
                    setEditingContact(null);
                }}
                title={editingContact ? "Edit Client Contact" : "Add Client Contact"}
                body={
                     <ContactForm
                        initialData={editingContact}
                        documents={editingContact ? documents.filter((d: any) => d.contactId === editingContact._id) : []}
                        onSubmit={handleSaveContact}
                        isLoading={false}
                    />
                }
            />

            <ConfirmDialog 
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, type: null, id: null })}
                onConfirm={confirmDeleteAction}
                title={deleteConfirmation.type === 'hearing' ? "Delete Hearing?" : "Delete Contact?"}
                description="Are you sure you want to delete this item? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
            />

            <ReminderModal 
                isOpen={isReminderModalOpen} 
                onClose={() => setIsReminderModalOpen(false)} 
                caseData={caseData} 
            />
            </div>
        </div>
    );
}
