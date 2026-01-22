import ExcelJS from 'exceljs';

export type TransactionHistoryItem = {
  date: string;
  transactions: number;
};

export type TwoProductHistoryResult = {
  warehouse: string;
  productA: {
    id: string;
    name: string;
    history: TransactionHistoryItem[];
  };
  productB: {
    id: string;
    name: string;
    history: TransactionHistoryItem[];
  };
};

export type TwoProductQuantityResult = {
  warehouse: string;
  productA: {
    id: string;
    name: string;
    quantity: number;
  };
  productB: {
    id: string;
    name: string;
    quantity: number;
  };
};
