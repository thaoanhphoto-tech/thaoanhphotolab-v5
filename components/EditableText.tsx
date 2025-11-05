import React, { useState, useEffect, useRef } from 'react';
import { loadTextContent, saveTextContent } from '../contentStore';

interface EditableTextProps {
    contentKey: string;
    defaultValue: string;
    isAdminMode: boolean;
    as?: React.ElementType;
    className?: string;
    onSave?: (newContent: string) => void;
}

export const EditableText: React.FC<EditableTextProps> = ({ contentKey, defaultValue, isAdminMode, as: Component = 'span', className, onSave }) => {
    const [content, setContent] = useState(defaultValue);
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setContent(loadTextContent(contentKey, defaultValue));
    }, [contentKey, defaultValue]);

    const handleBlur = () => {
        if (elementRef.current) {
            const newContent = elementRef.current.innerHTML;
            if (content !== newContent) {
                setContent(newContent);
                saveTextContent(contentKey, newContent);
                if (onSave) {
                    onSave(newContent);
                }
            }
        }
    };
    
    // This effect ensures that the DOM is updated if the content state changes from outside
    useEffect(() => {
        if (elementRef.current && elementRef.current.innerHTML !== content) {
            elementRef.current.innerHTML = content;
        }
    }, [content]);

    const adminClasses = isAdminMode 
        ? 'outline-2 outline-dashed outline-blue-500 rounded-sm focus:outline-solid focus:bg-blue-50 dark:focus:bg-blue-900/50 cursor-text p-1 -m-1' 
        : '';

    return (
        <Component
            ref={elementRef}
            contentEditable={isAdminMode}
            suppressContentEditableWarning={true}
            onBlur={handleBlur}
            className={`${className} ${adminClasses}`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};