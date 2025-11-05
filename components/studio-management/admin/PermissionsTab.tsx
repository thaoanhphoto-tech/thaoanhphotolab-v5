import React, { useState } from 'react';
import { User, OperationalRole, OPERATIONAL_ROLE_NAMES } from '../../../userStore';

interface PermissionsTabProps {
    users: User[];
    onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

export const PermissionsTab: React.FC<PermissionsTabProps> = ({ users, onUpdateUser }) => {
    const handleRoleChange = (userId: string, role: OperationalRole | null) => {
        onUpdateUser(userId, { operationalRole: role });
    };

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {users.map(user => (
                <div key={user.id} className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border dark:border-zinc-700 flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{user.fullName}</p>
                        <p className="text-sm text-slate-500">{user.username}</p>
                    </div>
                    <select
                        value={user.operationalRole || ''}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as OperationalRole || null)}
                        className="p-2 border rounded dark:bg-zinc-700"
                    >
                        <option value="">-- Không có vai trò --</option>
                        {Object.entries(OPERATIONAL_ROLE_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
};