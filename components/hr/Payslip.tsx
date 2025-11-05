import React from 'react';
import { User, PersonnelProfile } from '../../userStore';

interface PayslipProps {
  user: User;
  profile: PersonnelProfile;
  payPeriod: { start: string, end: string };
  totalHours: number;
  finalSalary: number;
  baseSalaryCalc: number;
  overtimePay: number;
  allowanceTotal: number;
  deductionTotal: number;
  allowances: { description: string, amount: number }[];
}

export const Payslip: React.FC<PayslipProps> = ({ user, profile, payPeriod, totalHours, finalSalary, baseSalaryCalc, overtimePay, allowanceTotal, deductionTotal, allowances }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';

    return (
        <div className="p-8 bg-white text-black font-sans text-sm">
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
            <header className="text-center mb-8">
                <h1 className="text-2xl font-bold">PHIẾU LƯƠNG</h1>
                <p>Kỳ lương: {payPeriod.start} - {payPeriod.end}</p>
            </header>
            
            <section className="mb-6">
                <h2 className="font-bold border-b pb-1 mb-2">Thông tin Nhân viên</h2>
                <div className="grid grid-cols-2 gap-x-4">
                    <p><strong>Họ và tên:</strong> {user.fullName}</p>
                    <p><strong>Chức vụ:</strong> {user.operationalRole ? user.operationalRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Nhân viên'}</p>
                </div>
            </section>

            <section className="mb-6">
                <h2 className="font-bold border-b pb-1 mb-2">Chi tiết Lương</h2>
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="py-1 text-left font-semibold">Diễn giải</th>
                            <th className="py-1 text-right font-semibold">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colSpan={2} className="pt-2 font-medium">I. THU NHẬP</td></tr>
                        <tr>
                            <td className="py-1 pl-4">Lương cơ bản:</td>
                            <td className="py-1 text-right">{formatCurrency(baseSalaryCalc)}</td>
                        </tr>
                        <tr>
                            <td className="py-1 pl-4">Lương tăng ca:</td>
                            <td className="py-1 text-right">{formatCurrency(overtimePay)}</td>
                        </tr>
                        {allowances.map((item, index) => (
                            <tr key={`allowance-${index}`}>
                                <td className="py-1 pl-4">{item.description}:</td>
                                <td className="py-1 text-right">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                        <tr className="font-semibold">
                            <td className="py-1">Tổng thu nhập:</td>
                            <td className="py-1 text-right">{formatCurrency(baseSalaryCalc + overtimePay + allowanceTotal)}</td>
                        </tr>
                        
                        <tr><td colSpan={2} className="pt-4 font-medium">II. KHẤU TRỪ</td></tr>
                         <tr>
                            <td className="py-1 pl-4">Tổng khấu trừ:</td>
                            <td className="py-1 text-right text-red-600">({formatCurrency(deductionTotal)})</td>
                        </tr>

                         <tr className="border-t-2 font-bold text-lg">
                            <td className="py-2">LƯƠNG THỰC NHẬN:</td>
                            <td className="py-2 text-right">{formatCurrency(finalSalary)}</td>
                        </tr>
                    </tbody>
                </table>
                 <p className="text-xs mt-2">Tổng giờ công: {totalHours.toFixed(2)} giờ</p>
            </section>

            <footer className="mt-12 text-center text-xs">
                <div className="grid grid-cols-3 gap-8">
                    <div>
                        <p className="font-bold">Người lập phiếu</p>
                        <p className="mt-12">(Ký, ghi rõ họ tên)</p>
                    </div>
                     <div>
                        <p className="font-bold">Kế toán</p>
                        <p className="mt-12">(Ký, ghi rõ họ tên)</p>
                    </div>
                     <div>
                        <p className="font-bold">Nhân viên</p>
                        <p className="mt-12">(Ký, ghi rõ họ tên)</p>
                    </div>
                </div>
                <p className="mt-8">Ngày.....tháng.....năm......</p>
            </footer>
        </div>
    );
};