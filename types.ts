
export enum TransactionType {
  SALE = 'SALE'
}

export interface LineItem {
  id: string;
  description: string;
  details?: string;
  material?: string;
  sizeA: number;
  sizeB: number;
  quantity: number;
  sqFt: number;
  rate: number;
  amount: number;
}

export interface BusinessProfile {
  businessName: string;
  currencySymbol: string;
  pdfFooterNote: string;
  pdfThemeColor: string;
  defaultStatus: 'PAID' | 'UNPAID';
  materials: string[];
  showSqFtInPdf: boolean;
  showMaterialInPdf: boolean;
  pdfAccentColor: string;
  minSqFtPerPiece: number;
  minItemAmount: number;
  lastCloudSync?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  invoiceNumber: string;
  date: string;
  partyName: string; 
  billingAddress?: string;
  items: LineItem[];
  subTotal: number;
  grandTotal: number;
  status: 'PAID' | 'UNPAID';
}

export interface User {
  id: string;
  username: string;
  password?: string;
  businessName: string;
  createdAt: string;
}
