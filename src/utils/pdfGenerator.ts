import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export function generateCasePDF(caseData: any, contacts: any[], documents: any[], stages: any[]) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Helper for safe date formatting
    const safeFormatDate = (date: any) => {
        if (!date) return "N/A";
        try {
            return format(new Date(date), "dd MMM yyyy");
        } catch (e) {
            return "N/A";
        }
    };

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233); // Sky-500
    doc.setFont("helvetica", "bold");
    doc.text("Office - Case Report", margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy, hh:mm aa")}`, margin, 26);
    
    doc.setDrawColor(200);
    doc.line(margin, 30, pageWidth - margin, 30);

    // --- Case Overview Section ---
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Case Overview", margin, 40);

    autoTable(doc, {
        startY: 45,
        margin: { left: margin },
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: "bold" },
        body: [
            ["Case Number", caseData.caseNo || "N/A", "Case Type", caseData.caseType || "N/A"],
            ["Client Name", caseData.nameOfParty || "N/A", "Role", caseData.roleOfParty || "N/A"],
            ["Court Name", caseData.courtName || "N/A", "Current Stage", caseData.stage || "N/A"],
            ["Next Date", safeFormatDate(caseData.nextDate), "Registration Date", safeFormatDate(caseData.registrationDate)],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 35 },
            2: { fontStyle: "bold", cellWidth: 35 },
        }
    });

    // --- Opposite Party Details ---
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Opposite Party Details", margin, finalY);

    autoTable(doc, {
        startY: finalY + 5,
        margin: { left: margin },
        body: [
            ["Opposite Party", caseData.oppositePartyName || "N/A"],
            ["Opposite Counsel", caseData.oppositeCounselName || "N/A"],
            ["Additional Details", caseData.additionalOppositeParties || "None"]
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } }
    });

    // --- Client Contact Info ---
    finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Client Contacts", margin, finalY);

    if (contacts && contacts.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            margin: { left: margin },
            head: [["WhatsApp No", "Alt Number", "Address"]],
            body: contacts.map(c => [c.whatsappNo, c.alternativeNo || "N/A", c.address || "N/A"]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [14, 165, 233] }
        });
    } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("No contact information available.", margin, finalY + 10);
        (doc as any).lastAutoTable = { finalY: finalY + 10 };
    }

    // --- Hearing History ---
    finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Hearing History", margin, finalY);

    const hearings = caseData.hearings || [];
    if (hearings.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            margin: { left: margin },
            head: [["Hearing Date", "Prev. Date", "Court", "Stage", "Notes"]],
            body: hearings.map((h: any) => [
                safeFormatDate(h.registrationDate),
                safeFormatDate(h.previousDate),
                h.courtName || "N/A",
                h.stage || "N/A",
                h.notes || ""
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [14, 165, 233] }
        });
    } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("No hearing history recorded.", margin, finalY + 10);
        (doc as any).lastAutoTable = { finalY: finalY + 10 };
    }

    // --- Documents & Timeline ---
    finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Check if we need a new page
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Document Timeline", margin, finalY);

    if (documents && documents.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            margin: { left: margin },
            head: [["Document Name", "Status / Stage", "Added Date"]],
            body: documents.map(d => [
                d.name,
                (typeof d.stage === 'object' ? d.stage?.name : (stages.find(s => s._id === d.stage)?.name)) || "Unassigned",
                safeFormatDate(d.createdAt || d.updatedAt)
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [14, 165, 233] }
        });
    } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("No documents uploaded.", margin, finalY + 10);
        (doc as any).lastAutoTable = { finalY: finalY + 10 };
    }

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} | Z.A Sukul Khadar & Associates Professional Legal Management`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    // Save PDF
    const fileName = `Case_Report_${caseData.caseNo.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
    doc.save(fileName);
}

export function generateDailySchedulePDF(date: Date, groupedEvents: { [key: string]: any[] }) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233); // Sky-500
    doc.setFont("helvetica", "bold");
    doc.text("Daily Court Schedule", margin, 20);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(format(date, "EEEE, MMMM do, yyyy"), margin, 32);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy, hh:mm aa")}`, margin, 38);

    doc.setDrawColor(200);
    doc.line(margin, 42, pageWidth - margin, 42);

    let currentY = 50;

    const courts = Object.keys(groupedEvents).sort();

    if (courts.length === 0) {
        doc.setFontSize(12);
        doc.text("No cases scheduled for today.", margin, currentY);
    } else {
        courts.forEach((court) => {
            const courtCases = groupedEvents[court];

            // Court Title
            doc.setFontSize(14);
            doc.setTextColor(14, 165, 233);
            doc.setFont("helvetica", "bold");
            
            // Check for page break
            if (currentY + 25 > 280) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.text(court, margin, currentY);
            currentY += 5;

            autoTable(doc, {
                startY: currentY,
                margin: { left: margin },
                head: [["Case No", "Party Name", "Event Type"]],
                body: courtCases.map(c => [
                    c.caseNo || "N/A",
                    c.nameOfParty || "N/A",
                    c.type === 'nextDate' ? "Upcoming Hearing" : 
                    c.type === 'registrationDate' ? "Case Registration" : "Previous Date"
                ]),
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [14, 165, 233] },
                theme: 'grid'
            });

            currentY = (doc as any).lastAutoTable.finalY + 15;
        });
    }

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} |  Z.A Sukul Khadar & Associates Professional Legal Management`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    const fileName = `Daily_Schedule_${format(date, "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
}
