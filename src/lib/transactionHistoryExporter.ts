/* eslint-disable @typescript-eslint/no-explicit-any */
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";

// Initialize pdfmake VFS
pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs;

export interface TxHistoryRow {
  serial: number;
  payer: string;
  payingBank: string;
  platformAccount: string;
  tradeHash: string;
  sellerUsername: string;
  btcBought: string;
  ngnPaid: string;
  openedAt: string;
  paidAt: string;
  payerSpeed: number;
  ngnSellingPrice: string;
  ngnCostPrice: string;
  usdCost: string;
}

export const exportTxHistoryCSV = (rows: TxHistoryRow[]) => {
  const headers = [
    "S/N","Payer","Paying Bank","Platform Account","Trade Hash","Seller Username",
    "BTC Bought","NGN Paid","Opened At","Paid At","Speed (s)","NGN Sell Price","NGN Cost Price","USD Cost"
  ];
  const csvData = rows.map(r => [
    r.serial, r.payer, r.payingBank, r.platformAccount, r.tradeHash, r.sellerUsername,
    r.btcBought, r.ngnPaid, r.openedAt, r.paidAt, r.payerSpeed, r.ngnSellingPrice, r.ngnCostPrice, r.usdCost
  ]);
  const content = [headers, ...csvData]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `tx_history_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTxHistoryPDF = (rows: TxHistoryRow[]) => {
  const title = "Transaction History Report";
  const headers = [
    "S/N","Payer","Paying Bank","Platform Account","Trade Hash","Seller Username",
    "BTC Bought","NGN Paid","Opened At","Paid At","Speed (s)","NGN Sell Price","NGN Cost Price","USD Cost"
  ];
  const body = rows.map(r => [
    { text: r.serial, style: 'tableCell' },
    { text: r.payer, style: 'tableCell' },
    { text: r.payingBank, style: 'tableCell' },
    { text: r.platformAccount, style: 'tableCell' },
    { text: r.tradeHash, style: 'tableCell' },
    { text: r.sellerUsername, style: 'tableCell' },
    { text: r.btcBought, style: 'tableCell' },
    { text: r.ngnPaid, style: 'tableCell' },
    { text: r.openedAt, style: 'tableCell' },
    { text: r.paidAt, style: 'tableCell' },
    { text: r.payerSpeed, style: 'tableCell' },
    { text: r.ngnSellingPrice, style: 'tableCell' },
    { text: r.ngnCostPrice, style: 'tableCell' },
    { text: r.usdCost, style: 'tableCell' },
  ]);

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: ([
      { text: title, style: 'header', alignment: 'center', margin: [0, 0, 0, 12] },
      { text: `Generated: ${new Date().toLocaleString()}`, style: 'subheader', alignment: 'center', margin: [0,0,0,20] },
      {
        table: {
          headerRows: 1,
          widths: headers.map(() => '*'),
          body: [
            headers.map(h => ({ text: h, style: 'tableHeader', fillColor: '#2c3e50', color: '#ffffff' })),
            ...body
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#888',
          vLineColor: () => '#888',
          fillColor: (rowIndex) => rowIndex % 2 === 0 ? '#f5f5f5' : undefined
        }
      }
    ] as Content[]),
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 10 },
      tableHeader: { bold: true, fontSize: 10, color: 'white' },
      tableCell: { fontSize: 8, margin: [2,2,2,2] }
    },
    defaultStyle: { font: 'Roboto' }
  };

  pdfMake.createPdf(docDefinition).download(`tx_history_${new Date().toISOString().split("T")[0]}.pdf`);
};
