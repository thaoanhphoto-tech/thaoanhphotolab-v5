
import React, { useRef, useState } from 'react';
import { FamilyMember, MemberRole } from './concept-photo/types';
import { MaleIcon } from './icons/MaleIcon';
import { FemaleIcon } from './icons/FemaleIcon';
import { ChildIcon } from './icons/ChildIcon';
import { XIcon } from './icons/XIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { CheckIcon } from './icons/CheckIcon';


interface FamilyUploaderProps {
  familyMembers: FamilyMember[];
  onFamilyChange: (members: FamilyMember[]) => void;
  maxMembers?: number;
}

const roleInfo: Record<MemberRole, { icon: React.FC<any>, label: string }> = {
    'adult_male': { icon: MaleIcon, label: 'Người Lớn (Nam)' },
    'adult_female': { icon: FemaleIcon, label: 'Người Lớn (Nữ)' },
    'child': { icon: ChildIcon, label: 'Trẻ Em' },
};

export const FamilyUploader: React.FC<FamilyUploaderProps> = ({ familyMembers, onFamilyChange, maxMembers }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [roleToAdd, setRoleToAdd] = useState<MemberRole | null>(null);
  const [visibleAnalysis, setVisibleAnalysis] = useState<Record<string, boolean>>({});

  const toggleAnalysisVisibility = (id: string) => {
      setVisibleAnalysis(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddClick = (role: MemberRole) => {
    setRoleToAdd(role);
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && roleToAdd) {
      const files = [...event.target.files];
      const newMembers: FamilyMember[] = files.map(file => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        status: 'compressing',
        previewUrl: URL.createObjectURL(file),
        role: roleToAdd,
        height: '',
      }));

      if (maxMembers && (familyMembers.length + newMembers.length) > maxMembers) {
          alert(`Bạn chỉ có thể thêm tối đa ${maxMembers} thành viên cho concept này.`);
          setRoleToAdd(null);
          return;
      }

      onFamilyChange([...familyMembers, ...newMembers]);
      event.target.value = '';
    }
    setRoleToAdd(null);
  };
  
  const handleRemoveMember = (id: string) => {
    onFamilyChange(familyMembers.filter(member => member.id !== id));
  };

  const handleHeightChange = (id: string, height: string) => {
      onFamilyChange(familyMembers.map(m => m.id === id ? {...m, height} : m));
  };

  const getStatusIndicator = (status: FamilyMember['status']) => {
    switch(status) {
      case 'compressing':
        return <div className="w-4 h-4 border-2 border-slate-400 dark:border-slate-500 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" title="Đang nén ảnh..."></div>;
      case 'done':
        return <span title="Sẵn sàng"><CheckIcon className="w-5 h-5 text-green-500" /></span>;
      case 'error':
        return <span title="Lỗi xử lý"><XIcon className="w-5 h-5 text-red-500" /></span>;
      default:
        return <div className="w-5 h-5"></div>;
    }
  }

  const isAddDisabled = maxMembers ? familyMembers.length >= maxMembers : false;
  const addButtonTooltip = isAddDisabled ? `Concept này chỉ hỗ trợ tối đa ${maxMembers} người.` : '';

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        multiple
      />
      <div className="grid grid-cols-3 gap-2">
        <button 
            onClick={() => handleAddClick('adult_male')} 
            disabled={isAddDisabled}
            title={addButtonTooltip}
            className="p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-600"
        >
          <MaleIcon className="w-6 h-6 text-slate-500 dark:text-slate-400 mb-1" />
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Thêm Nam</span>
        </button>
        <button 
            onClick={() => handleAddClick('adult_female')} 
            disabled={isAddDisabled}
            title={addButtonTooltip}
            className="p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-600"
        >
          <FemaleIcon className="w-6 h-6 text-slate-500 dark:text-slate-400 mb-1" />
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Thêm Nữ</span>
        </button>
        <button 
            onClick={() => handleAddClick('child')} 
            disabled={isAddDisabled}
            title={addButtonTooltip}
            className="p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-600"
        >
          <ChildIcon className="w-6 h-6 text-slate-500 dark:text-slate-400 mb-1" />
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Thêm Trẻ Em</span>
        </button>
      </div>

       {isAddDisabled && (
        <p className="text-xs text-center text-amber-500 dark:text-amber-400">{addButtonTooltip}</p>
      )}

      {familyMembers.length > 0 && (
        <div className="space-y-3">
          {familyMembers.map(member => {
            const RoleIcon = roleInfo[member.role].icon;
            return (
              <div key={member.id} className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg">
                <div className="flex items-start">
                    <img src={member.previewUrl} alt="portrait" className="w-12 h-12 object-cover rounded-md mr-3 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{roleInfo[member.role].label}</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={member.file.name}>{member.file.name}</p>
                       <div className="mt-1 flex items-center gap-2">
                          <label htmlFor={`height-${member.id}`} className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">Chiều cao</label>
                          <input
                              id={`height-${member.id}`}
                              type="number"
                              value={member.height || ''}
                              onChange={(e) => handleHeightChange(member.id, e.target.value)}
                              placeholder="cm"
                              className="w-full max-w-[80px] p-1 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900/50 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                          />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {member.isAnalyzing && (
                            <div className="w-4 h-4 border-2 border-slate-400 dark:border-slate-500 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" title="Đang phân tích..."></div>
                        )}
                        {member.analysisResult && (member.analysisResult.gender || member.analysisResult.age) && (
                            <button onClick={() => toggleAnalysisVisibility(member.id)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" aria-label={visibleAnalysis[member.id] ? "Ẩn phân tích" : "Hiện phân tích"}>
                                {visibleAnalysis[member.id] ? <EyeOffIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /> : <EyeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
                            </button>
                        )}
                        <div className="w-5 h-5 flex items-center justify-center font-bold">{getStatusIndicator(member.status)}</div>
                        <button onClick={() => handleRemoveMember(member.id)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Xóa thành viên">
                            <XIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>
                </div>
                {visibleAnalysis[member.id] && member.analysisResult && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                        {member.analysisResult.gender && <p><strong className="font-semibold">Giới tính:</strong> {member.analysisResult.gender}</p>}
                        {member.analysisResult.age && <p><strong className="font-semibold">Tuổi ước tính:</strong> {member.analysisResult.age}</p>}
                        {!member.analysisResult.gender && !member.analysisResult.age && <p>Không có thông tin phân tích.</p>}
                    </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
