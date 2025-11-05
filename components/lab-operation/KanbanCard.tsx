import React, { useState } from 'react';
import { PrintRequest, User } from '../../userStore';
import { DeliveryUploadModal } from './DeliveryUploadModal';
import { DeliveryDetailsModal } from './DeliveryDetailsModal';
import { ClockIcon } from '../icons/ClockIcon';
import { HistoryModal } from './HistoryModal';

interface KanbanCardProps {
  request: PrintRequest;
  currentUser: User;
  onUpdateRequest: (requestId: string, updates: Partial<Omit<PrintRequest, 'id'>>, actionDescription: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ request, currentUser, onUpdateRequest }) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const { operationalRole } = currentUser;
    const { workflowStatus, paymentStatus, workInProgress } = request;

    const handleStatusChange = (newStatus: PrintRequest['workflowStatus'], action: string) => {
        onUpdateRequest(request.id, { workflowStatus: newStatus, workInProgress: false }, action);
    };
    
    const handleWorkInProgress = (inProgress: boolean, action: string) => {
        onUpdateRequest(request.id, { workInProgress: inProgress }, action);
    };

    const handleDeliveryUpload = (photoDataUrl: string) => {
        onUpdateRequest(request.id, { workflowStatus: 'delivered', deliveryPhotoUrl: photoDataUrl, workInProgress: false }, "Giao hàng thành công");
        setIsUploadModalOpen(false);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('requestId', request.id);
    };

    const isManager = operationalRole === 'tong_giam_doc' || operationalRole === 'giam_doc';
    const isAdmin = currentUser.purchasedPlans.includes('admin');

    const renderActions = () => {
        switch (operationalRole) {
            case 'ke_to_an':
                if (workflowStatus === 'delivered') {
                    return <ActionButton onClick={() => handleStatusChange('archived', 'Quyết toán đơn hàng')}>Quyết toán</ActionButton>;
                }
                return null;
            case 'truong_phong_lab':
                if (workflowStatus === 'pending_print') {
                    return <ActionButton onClick={() => handleStatusChange('printing', 'Bắt đầu in')}>Bắt đầu in</ActionButton>;
                }
                if (workflowStatus === 'printing') {
                    return <ActionButton onClick={() => handleStatusChange('finishing', 'In xong, chuyển Xưởng')}>In xong, chuyển Xưởng</ActionButton>;
                }
                return null;
            case 'xuong':
                 if (workflowStatus === 'finishing' && !workInProgress) {
                    return <ActionButton onClick={() => handleWorkInProgress(true, 'Nhận hoàn thiện')} color="bg-green-600 hover:bg-green-700">Nhận Hoàn Thiện</ActionButton>;
                }
                if (workflowStatus === 'finishing' && workInProgress) {
                    return <ActionButton onClick={() => handleStatusChange('shipping', 'Hoàn thành, chuyển Giao hàng')}>Hoàn thành, chuyển Giao hàng</ActionButton>;
                }
                return null;
            case 'ship':
                if (workflowStatus === 'shipping' && !workInProgress) {
                    return <ActionButton onClick={() => handleWorkInProgress(true, 'Nhận đơn giao hàng')} color="bg-green-600 hover:bg-green-700">Nhận Đơn Giao Hàng</ActionButton>;
                }
                 if (workflowStatus === 'shipping' && workInProgress) {
                    return (
                        <div className="space-y-1">
                            <ActionButton onClick={() => setIsDetailsModalOpen(true)} color="bg-slate-500 hover:bg-slate-600">Xem Chi Tiết Giao hàng</ActionButton>
                            <ActionButton onClick={() => setIsUploadModalOpen(true)}>Giao thành công & Chụp ảnh</ActionButton>
                        </div>
                    );
                }
                return null;
            default:
                return null;
        }
    };
    
    const isNewToColumn = (Date.now() - request.timestamp) < 5 * 60 * 1000;
    const shouldBlinkYellow = isNewToColumn && !workInProgress;

    const dimensions = request.manualOrderItems
      ? request.manualOrderItems.map(item => `${item.quantity}x ${item.size}`).join(', ')
      : request.orderDetails.layouts?.map(l => `${l.quantity}x ${l.customDescription || l.type}`).join(', ');

  return (
    <>
        <div 
            draggable
            onDragStart={handleDragStart}
            className={`relative bg-white dark:bg-zinc-700 p-3 rounded-md shadow ${shouldBlinkYellow ? 'animate-blink-border-yellow border-amber-500' : 'border border-slate-200 dark:border-zinc-600'} space-y-2`}>
            {workInProgress && (
                <div className="absolute top-2 left-2 w-2.5 h-2.5 bg-green-500 rounded-full animate-blink-green-dot" title="Đang thực hiện"></div>
            )}
            <div className="flex justify-between items-start">
                <p className="font-semibold text-slate-800 dark:text-zinc-100 text-sm pr-2">{request.orderDetails.customerInfo.fullName}</p>
                 <div className="flex-shrink-0 flex items-center gap-2">
                    {paymentStatus && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            paymentStatus === 'partially_paid' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                            {paymentStatus === 'paid' && 'Đã TT'}
                            {paymentStatus === 'unpaid' && 'Chưa TT'}
                            {paymentStatus === 'partially_paid' && 'TT Thiếu'}
                        </span>
                    )}
                    {(isManager || isAdmin) && (
                        <button onClick={() => setIsHistoryModalOpen(true)} title="Xem lịch sử đơn hàng">
                            <ClockIcon className="w-4 h-4 text-slate-400 hover:text-slate-600"/>
                        </button>
                    )}
                 </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Zalo: {request.orderDetails.customerInfo.zalo}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nguồn: {request.sourceChannel ? `${request.sourceChannel}` : request.sourceTool}
            </p>
             {request.fileStorageLocation && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    <strong>Lưu file:</strong> {request.fileStorageLocation}
                </p>
            )}
            {dimensions && (operationalRole === 'truong_phong_lab' || operationalRole === 'xuong') && (
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1">
                    KT: {dimensions}
                </p>
            )}
            <p className="text-xs text-slate-500 dark:text-zinc-400">Ngày: {new Date(request.timestamp).toLocaleDateString('vi-VN')}</p>
            {request.deliveryPhotoUrl && (
                <a href={request.deliveryPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Xem ảnh giao hàng</a>
            )}
            <div className="pt-2">
                {renderActions()}
            </div>
        </div>
        {isUploadModalOpen && (
            <DeliveryUploadModal
                request={request}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleDeliveryUpload}
            />
        )}
        {isDetailsModalOpen && (
            <DeliveryDetailsModal
                request={request}
                onClose={() => setIsDetailsModalOpen(false)}
            />
        )}
        {isHistoryModalOpen && (
            <HistoryModal
                history={request.history || []}
                onClose={() => setIsHistoryModalOpen(false)}
            />
        )}
    </>
  );
};

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; color?: string }> = ({ onClick, children, color = 'bg-blue-600 hover:bg-blue-700' }) => (
    <button
        onClick={onClick}
        className={`w-full px-2 py-1.5 text-white font-semibold rounded text-xs transition-colors ${color}`}
    >
        {children}
    </button>
);