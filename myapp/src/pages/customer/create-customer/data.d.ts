export interface CustomerDataType {
  passportNo: string;
  name: string;
  gender: string;
  country: string;
  birthDate: any;
  issueDate: any;
  expiryDate: any;
}

export interface VisaDataType {
  id: React.Key;
  country: string;
  visaName: string;
  issueDate: any;
  expiryDate: any;
}

export interface VisaFormProps {
  customerId?: number;
  customerName?: string;
  passportNo?: string;
  onSave: (visas: VisaDataType[]) => Promise<boolean>;
  loading: boolean;
}

export type CurrentTypes = 'base' | 'visa' | 'result';
