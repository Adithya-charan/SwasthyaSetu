'use client';
import { Activity, Download, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MOCK_REPORTS = [
    { id: 'LR-101', type: 'Complete Blood Count', date: 'Oct 10, 2024', doctor: 'Dr. Sarah Smith', remarks: 'Normal ranges' },
    { id: 'LR-102', type: 'Cholesterol Panel', date: 'Oct 10, 2024', doctor: 'Dr. Sarah Smith', remarks: 'Slightly elevated LDL' },
    { id: 'LR-095', type: 'X-Ray Chest', date: 'Sep 05, 2024', doctor: 'Dr. Emily Chen', remarks: 'Clear lungs, no abnormalities' },
];

export default function LabReportsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Lab Reports</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="p-4 pl-6 w-16">#</th>
                                <th className="p-4">Report Type</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Prescribed By</th>
                                <th className="p-4">Remarks</th>
                                <th className="p-4 pr-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_REPORTS.map((report, idx) => (
                                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 pl-6 text-slate-400 font-medium">{idx + 1}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-900">{report.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium">
                                        <span className="bg-slate-100 px-3 py-1 rounded text-sm whitespace-nowrap">{report.date}</span>
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">{report.doctor}</td>
                                    <td className="p-4 text-slate-500 text-sm max-w-xs truncate" title={report.remarks}>{report.remarks}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                            <Download className="w-4 h-4" /> PDF
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {MOCK_REPORTS.length === 0 && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Activity className="w-12 h-12 text-slate-300 mb-3" />
                        <p>No lab reports available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
