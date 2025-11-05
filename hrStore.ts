import { User, PersonnelProfile } from './userStore';

export interface AdjustmentItem {
    description: string;
    amount: number;
}

export interface PayslipData {
    user: User;
    profile: PersonnelProfile;
    payPeriod: { start: string; end: string };
    totalHours: number;
    finalSalary: number;
    baseSalaryCalc: number;
    overtimePay: number;
    allowanceTotal: number;
    deductionTotal: number;
    allowances: { description: string; amount: number }[];
}
