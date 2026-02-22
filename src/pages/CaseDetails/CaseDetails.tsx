import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {  MessageSquare, Printer, Bell, ArrowLeft, Edit2, Trash, Plus, Phone, MapPin, Scale, Hash, Calendar as CalendarIcon, User, Info, Gavel } from "lucide-react";
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
    useDeleteDocumentStageMutation,
    useGetFeeQuery,
    useAddOrUpdateFeeMutation,
    useDeletePaymentMutation
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
import { generateCasePDF } from "@/utils/pdfGenerator";
import { AddEditFee } from "./AddEditFee";


export default function CaseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: caseData, isLoading, isError } = useGetCaseQuery(id);
    

    const [addHearing, { isLoading: isAddingHearingMutation }] = useAddHearingMutation();
    const [updateHearing, { isLoading: isUpdatingHearing }] = useUpdateHearingMutation();
    const [deleteHearing, { isLoading: isDeletingHearing }] = useDeleteHearingMutation();


    const { data: contacts = [], isLoading: isContactsLoading } = useGetContactsQuery(id, {
        skip: !id, 
    });
    const [addContact, { isLoading: isAddingContact }] = useAddContactMutation();
    const [updateContact, { isLoading: isUpdatingContact }] = useUpdateContactMutation();
    const [deleteContact, { isLoading: isDeletingContact }] = useDeleteContactMutation();

    const { data: documents = [], isLoading: isDocumentsLoading } = useGetDocumentsQuery(id, { skip: !id });
    const { data: stages = [], isLoading: isStagesLoading } = useGetDocumentStagesQuery({});
    const [addDocument] = useAddDocumentMutation();
    const [updateDocument] = useUpdateDocumentMutation();
    const [addStage] = useAddDocumentStageMutation();
    const [deleteStage] = useDeleteDocumentStageMutation();
    const [deleteDocument, { isLoading: isDeletingDoc }] = useDeleteDocumentMutation();

    const { data: feeData, isLoading: isFeeLoading } = useGetFeeQuery(id, { skip: !id });
    const [addOrUpdateFee, { isLoading: isFeeSubmitting }] = useAddOrUpdateFeeMutation();
    const [deletePayment] = useDeletePaymentMutation();

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
           vakkalath: lastHearing?.vakkalath || caseData.vakkalath,
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
            // Close modal after success
            setDeleteConfirmation({ isOpen: false, type: null, id: null });
        } catch (err) {
            toast.error("Failed to delete item");
        }
    };
    
    const handleSaveFee = async (data: any) => {
        try {
            await addOrUpdateFee(data).unwrap();
            toast.success("Fee record updated");
        } catch (err) {
            toast.error("Failed to update fee record");
        }
    };

    const handleDeletePayment = async (paymentId: string) => {
        try {
            await deletePayment({ caseId: id, paymentId }).unwrap();
            toast.success("Payment record removed");
        } catch (err) {
            toast.error("Failed to delete payment");
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
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-8 rounded-[48px] border border-white dark:border-slate-900 shadow-inner space-y-8">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="hover:bg-white rounded-2xl h-12 w-12 border-slate-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Case Details</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Management Console</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="hearings" className="w-full">
                <div className="mb-4 overflow-x-auto scrollbar-hide">
                    <TabsList className="flex w-max min-w-full justify-start rounded-none bg-transparent p-0 h-auto border-b">
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
                    <div className="relative bg-[#fdfeff] dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl shadow-sky-900/15 border border-slate-200/60 dark:border-slate-800/60 space-y-0">
                        {/* Top Accent Bar */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-sky-500 shadow-sm" />
                        
                        {/* Premium Header */}
                        <div className="bg-gradient-to-br from-sky-100/40 via-white to-white dark:from-slate-800/50 dark:to-slate-900 p-4 pt-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Case Overview</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Status: Active</span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-6 h-10 shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all font-bold"
                                    onClick={startUpdateCase}
                                >
                                    <Edit2 className="h-4 w-4 mr-2" /> Update Case
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Action Toolbar */}
                            <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-50 dark:border-slate-800/50">
                                {/* Generic Send Message acts as shortcut to first contact */}
                                {isAdminOrSuperAdmin && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-xl px-4 text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-100 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-400 font-bold"
                                        onClick={() => {
                                            if (contacts && contacts.length > 0) {
                                                window.open(`https://wa.me/${contacts[0].whatsappNo}`, '_blank');
                                            } else {
                                                toast.warning("Client contact isn't added");
                                            }
                                        }}
                                    >
                                        <MessageSquare className="h-4 w-4 mr-1.5" /> WhatsApp
                                    </Button>
                                )}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-xl px-4 text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 font-bold"
                                    onClick={() => {
                                        toast.info("Generating Case Report PDF...");
                                        generateCasePDF(caseData, contacts, documents, stages);
                                    }}
                                >
                                    <Printer className="h-4 w-4 mr-1.5" /> Export PDF
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-xl px-4 text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400 font-bold ml-auto"
                                    onClick={() => setIsReminderModalOpen(true)}
                                >
                                    <Bell className="h-4 w-4 mr-1.5" /> Reminder
                                </Button>
                            </div>

                            {/* Case Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Case No & Type */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-sky-200 dark:hover:border-sky-900 group">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center ">
                                            <span className="font-bold text-slate-800 dark:text-white  transition-colors e">Case no : &nbsp;</span>
                                            <p className="font-black text-2xl text-slate-800 dark:text-white  transition-colors uppercase">{caseData.caseNo}</p>
                                            <Hash className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-bold text-slate-400  tracking-[0.2em]">Case Type</p>
                                            {caseData.caseType && <Badge variant="secondary" className="text-[10px] font-black bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 rounded-lg">{caseData.caseType}</Badge>}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Next Date */}
                                <div className="bg-rose-50/30 dark:bg-rose-900/10 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-black text-2xl text-rose-500 dark:text-rose-400 italic">{safeFormatDate(caseData.nextDate)}</p>
                                            <CalendarIcon className="h-5 w-5 text-rose-200" />
                                        </div>
                                        <p className="text-[10px] font-bold text-rose-300 dark:text-rose-900/50 uppercase tracking-[0.2em]">Next Hearing Session</p>
                                    </div>
                                </div>
                            
                                {/* Party & Role */}
                                <div className="col-span-1 sm:col-span-2 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent rounded-[24px] pointer-events-none" />
                                    <div className="text-center py-4 px-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                        <div className="h-2 w-full absolute top-0 left-0 bg-sky-500/10" />
                                        <p className="font-black text-2xl text-slate-900 dark:text-white mb-1 tracking-tight">{caseData.nameOfParty}</p>
                                        <div className="flex items-center justify-center flex-wrap gap-3">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                                                <User className="h-3 w-3 text-slate-400" />
                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">Client Profile</span>
                                            </div>
                                            {caseData.roleOfParty && (
                                                <Badge variant="outline" className="text-[10px] border-sky-200 text-sky-600 bg-sky-50 rounded-lg font-black uppercase shadow-sm">
                                                    Role: {caseData.roleOfParty}
                                                </Badge>
                                            )}
                                            {caseData.vakkalath && (
                                                <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50 rounded-lg font-black uppercase shadow-sm">
                                                    Vak: {caseData.vakkalath}
                                                </Badge>
                                            )}
                                        </div>
                                        {caseData.additionalParties && (
                                            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl italic">
                                                <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">"{caseData.additionalParties}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Opposite Party Section */}
                                {(caseData.oppositePartyName || caseData.oppositeCounselName) && (
                                    <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-0 overflow-hidden rounded-[24px] border border-rose-100 dark:border-rose-900/20 shadow-sm shadow-rose-500/5">
                                        <div className="bg-rose-50/40 dark:bg-rose-900/5 p-3 border-b sm:border-b-0 sm:border-r border-rose-100 dark:border-rose-900/20 relative">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-black text-lg text-slate-800 dark:text-slate-200 leading-tight">{caseData.oppositePartyName || "N/A"}</p>
                                                <p className="text-[10px] uppercase font-black text-rose-400 tracking-widest flex items-center gap-1.5">
                                                    <span className="h-1 w-1 rounded-full bg-rose-400" /> Opposite Party
                                                </p>
                                                {caseData.additionalOppositeParties && (
                                                    <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-rose-200 pl-3">"{caseData.additionalOppositeParties}"</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900/20 p-3 flex flex-col justify-center">
                                            <div className="sm:text-right flex flex-col gap-1">
                                                <p className="font-black text-lg text-slate-800 dark:text-slate-200 leading-tight">{caseData.oppositeCounselName || "Not Recorded"}</p>
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Counsel for Defense</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Particulars */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-sky-200 dark:hover:border-sky-900 group">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm leading-relaxed line-clamp-2">{caseData.particulars || "No specific details available."}</p>
                                            <Info className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Particulars</p>
                                    </div>
                                </div>

                                {/* Case Initiation */}
                                <div className="bg-sky-50/30 dark:bg-sky-900/10 p-3 rounded-2xl border border-sky-100 dark:border-sky-800/50">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-black text-2xl text-slate-800 dark:text-white uppercase">{safeFormatDate(caseData.registrationDate)}</p>
                                            <Gavel className="h-5 w-5 text-sky-200" />
                                        </div>
                                        <p className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em]">Case Initiation</p>
                                    </div>
                                </div>
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
                            className={`bg-card rounded-lg shadow-sm border overflow-hidden ${isHighlighted ? 'border-red-500 ring-2 ring-red-200' : ''}`}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {contacts.map((contact: any) => (
                                <div key={contact._id} className="bg-card rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-green-100 p-2 rounded-full">
                                                    <MessageSquare className="h-4 w-4 text-green-600" />
                                                </div>
                                                <span className="font-bold text-lg text-slate-800">{contact.whatsappNo}</span>
                                            </div>
                                            <Badge 
                                                variant="secondary" 
                                                className="text-[10px] bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer uppercase font-black" 
                                                onClick={() => openWhatsApp(contact.whatsappNo)}
                                            >
                                                Chat
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 pt-2">
                                            {contact.alternativeNo && (
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                    <Phone className="h-3 w-3" />
                                                    <span>Alt: {contact.alternativeNo}</span>
                                                </div>
                                            )}
                                            {contact.address && (
                                                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                                                    <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                                    <span className="line-clamp-2">{contact.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-50">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50 rounded-lg text-slate-400" onClick={() => handleDeleteContact(contact._id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-sky-500 hover:bg-sky-50 rounded-lg text-slate-400" onClick={() => startEditContact(contact)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
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
                         <div className="bg-card rounded-2xl p-6 border shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-primary/10 p-2 rounded-lg text-primary">₹</span>
                                Fee Management
                            </h2>
                            {isFeeLoading ? (
                                <div className="text-center py-10">Loading fee details...</div>
                            ) : (
                                <AddEditFee 
                                    caseId={id!} 
                                    feeData={feeData} 
                                    onSubmit={handleSaveFee}
                                    onDeletePayment={handleDeletePayment}
                                    isLoading={isFeeSubmitting}
                                />
                            )}
                         </div>
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
                        isLoading={isAddingHearingMutation || isUpdatingHearing}
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
                        isLoading={isAddingContact || isUpdatingContact}
                    />
                }
            />

            <ConfirmDialog 
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, type: null, id: null })}
                onConfirm={confirmDeleteAction}
                isLoading={isDeletingHearing || isDeletingContact || isDeletingDoc}
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
    );
}
