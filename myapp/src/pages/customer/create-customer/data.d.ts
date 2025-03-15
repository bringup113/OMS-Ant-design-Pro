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
  visaType: string;
  visaName: string;
  issueDate: any;
  expiryDate: any;
}

export type CurrentTypes = 'base' | 'visa' | 'result';
