/* eslint-disable @typescript-eslint/no-explicit-any */
import { jsPDF } from "jspdf";
import "jspdf-autotable";
export const exportToCSV = (data, type) => {
    let headers = [];
    let csvData = [];
    if (type === "completedTrades") {
        headers = [
            "Complaint ID",
            "Platform",
            "Submitted By",
            "Type",
            "Status",
            "Date",
            "Priority",
            "Description",
        ];
        csvData = data.map((item) => [
            item.complaintId,
            item.platform,
            item.submittedBy.name,
            item.type,
            item.status,
            item.date,
            item.priority,
            item.description,
        ]);
    }
    else if (type === "escalatedTrades") {
        headers = [
            "Trade ID",
            "Platform",
            "Escalated By",
            "Amount",
            "Status",
            "Date",
            "Complaint",
        ];
        csvData = data.map((item) => [
            item.tradeId,
            item.platform,
            item.escalatedBy.fullName,
            item.amount,
            item.status,
            new Date(item.createdAt).toLocaleDateString(),
            item.complaint,
        ]);
    }
    else if (type === "allTrades") {
        // Vendor trades export: adjust headers as needed
        headers = [
            "Trade ID",
            "Platform",
            "Owner",
            "Username",
            "Amount",
            "Status",
            "Date",
            "Account ID",
        ];
        csvData = data.map((item) => [
            item.tradeHash || item.id,
            item.platform,
            item.ownerUsername || "N/A",
            item.responderUsername || "N/A",
            item.amount,
            item.status,
            new Date(item.createdAt).toLocaleDateString(),
            item.accountId || "N/A",
        ]);
    }
    const csvContent = [headers, ...csvData]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${type}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
export const exportToPDF = (data, type) => {
    const doc = new jsPDF();
    let title = "";
    let headers = [];
    let tableData = [];
    if (type === "completedTrades") {
        title = "Customer Complaints Report";
        headers = [
            "ID",
            "Platform",
            "Submitted By",
            "Type",
            "Status",
            "Date",
            "Priority",
            "Description",
        ];
        tableData = data.map((item) => [
            item.complaintId,
            item.platform,
            item.submittedBy.name,
            item.type,
            item.status,
            item.date,
            item.priority,
            item.description,
        ]);
    }
    else if (type === "escalatedTrades") {
        title = "Escalated Trades Report";
        headers = [
            "Trade ID",
            "Platform",
            "Escalated By",
            "Amount",
            "Status",
            "Date",
            "Complaint",
        ];
        tableData = data.map((item) => [
            item.tradeId,
            item.platform,
            item.escalatedBy.fullName,
            item.amount,
            item.status,
            new Date(item.createdAt).toLocaleDateString(),
            item.complaint,
        ]);
    }
    else if (type === "allTrades") {
        title = "Vendor Trades Report";
        headers = [
            "Trade ID",
            "Platform",
            "Owner",
            "Username",
            "Amount",
            "Status",
            "Date",
            "Account ID",
        ];
        tableData = data.map((item) => [
            item.tradeHash || item.id,
            item.platform,
            item.ownerUsername || "N/A",
            item.responderUsername || "N/A",
            item.amount,
            item.status,
            new Date(item.createdAt).toLocaleDateString(),
            item.accountId || "N/A",
        ]);
    }
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
    doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 35,
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        // Adjust column styles as needed. For example:
        columnStyles: {
            0: { cellWidth: 25 },
            7: { cellWidth: 40 },
        },
    });
    doc.save(`${type}_${new Date().toISOString().split("T")[0]}.pdf`);
};
