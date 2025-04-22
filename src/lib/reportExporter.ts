/* eslint-disable @typescript-eslint/no-explicit-any */
import pdfMake from 'pdfmake/build/pdfmake';


// Define the interfaces used in the export (if needed)
interface ComplaintData {
  complaintId: string;
  platform: string;
  submittedBy: {
    name: string;
  };
  type: string;
  status: string;
  date: string;
  priority: string;
  description: string;
}

interface EscalatedTradeData {
  tradeId: string;
  platform: string;
  escalatedBy: {
    fullName: string;
  };
  amount: string;
  status: string;
  createdAt: string;
  complaint: string;
}

// For vendor trades, we use the Trade interface from your dashboard
export interface Trade {
  messageCount: any;
  accountId: any;
  id: string;
  tradeHash?: string;
  platform: string;
  amount: number;
  status: string;
  createdAt: string;
  escalatedBy?: { id: string; fullName?: string; avatar?: string };
  assignedCcAgent?: { id: string; fullName?: string; avatar?: string };
  reason?: string;
  trade?: { tradeHash?: string; accountId?: string };
  hasNewMessages?: boolean;
  responderUsername?: string;
  ownerUsername?: string;
  cryptoCurrencyCode?: string;
  fiatCurrency?: string;
  paymentMethod?: string;
}

export const exportToCSV = (
  data: any[],
  type: "completedTrades" | "escalatedTrades" | "allTrades"
) => {
  let headers: string[] = [];
  let csvData: any[] = [];

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
    csvData = data.map((item: ComplaintData) => [
      item.complaintId,
      item.platform,
      item.submittedBy.name,
      item.type,
      item.status,
      item.date,
      item.priority,
      item.description,
    ]);
  } else if (type === "escalatedTrades") {
    headers = [
      "Trade ID",
      "Platform",
      "Escalated By",
      "Amount",
      "Status",
      "Date",
      "Complaint",
    ];
    csvData = data.map((item: EscalatedTradeData) => [
      item.tradeId,
      item.platform,
      item.escalatedBy.fullName,
      item.amount,
      item.status,
      new Date(item.createdAt).toLocaleDateString(),
      item.complaint,
    ]);
  } else if (type === "allTrades") {
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
    csvData = data.map((item: Trade) => [
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
    .map((row) => row.map((cell: any) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${type}_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
  data: any[],
  type: "completedTrades" | "escalatedTrades" | "allTrades"
) => {
  let title = "";
  let headers: string[] = [];
  let tableData: any[] = [];

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
    tableData = data.map((item: ComplaintData) => [
      item.complaintId,
      item.platform,
      item.submittedBy.name,
      item.type,
      item.status,
      item.date,
      item.priority,
      item.description,
    ]);
  } else if (type === "escalatedTrades") {
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
    tableData = data.map((item: EscalatedTradeData) => [
      item.tradeId,
      item.platform,
      item.escalatedBy.fullName,
      item.amount,
      item.status,
      new Date(item.createdAt).toLocaleDateString(),
      item.complaint,
    ]);
  } else if (type === "allTrades") {
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
    tableData = data.map((item: Trade) => [
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

  // Create the document definition
  const docDefinition = {
    content: [
      { text: title, style: 'header' },
      { text: `Generated on: ${new Date().toLocaleString()}`, style: 'subheader' },
      {
        table: {
          headerRows: 1,
          body: [headers, ...tableData]
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 10,
        margin: [0, 0, 0, 20]
      }
    }
  };

  // Generate the PDF and download it
  pdfMake.createPdf(docDefinition).download(`${type}_${new Date().toISOString().split("T")[0]}.pdf`);
};