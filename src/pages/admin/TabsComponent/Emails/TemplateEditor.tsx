import React, { useState, useEffect } from "react";

interface TemplateEditorProps {
  template: string;
  onChange: (newTemplate: string) => void;
}

interface Segment {
  type: 'text' | 'placeholder';
  content: string;
  id: string;
  name?: string;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onChange }) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  
  // Parse template into segments whenever it changes
  useEffect(() => {
    parseTemplate(template);
  }, [template]);
  
  // Split the template into segments of text and placeholders
  const parseTemplate = (templateText: string) => {
    const parsedSegments: Segment[] = [];
    let lastIndex = 0;
    
    // Regular expression to match {{placeholder}} and {{#if condition}}...{{/if}} patterns
    const placeholderRegex = /(\{\{#if\s+([^}]+)\}\}|\{\{\/if\}\}|\{\{([^}]+)\}\})/g;
    let match;
    
    while ((match = placeholderRegex.exec(templateText)) !== null) {
      // Add text before placeholder
      if (match.index > lastIndex) {
        parsedSegments.push({
          type: 'text',
          content: templateText.substring(lastIndex, match.index),
          id: `text-${lastIndex}-${match.index}`
        });
      }
      
      // Add placeholder
      parsedSegments.push({
        type: 'placeholder',
        content: match[0],
        name: match[3] || match[2] || 'condition',
        id: `placeholder-${match.index}-${match.index + match[0].length}`
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < templateText.length) {
      parsedSegments.push({
        type: 'text',
        content: templateText.substring(lastIndex),
        id: `text-${lastIndex}-${templateText.length}`
      });
    }
    
    setSegments(parsedSegments);
  };
  
  // Handle text segment change
  const handleSegmentChange = (id: string, newContent: string) => {
    const newSegments = segments.map(segment => 
      segment.id === id ? { ...segment, content: newContent } : segment
    );
    
    // Reconstruct the full template string
    const newTemplate = newSegments.map(segment => segment.content).join('');
    onChange(newTemplate);
  };
  
  // Auto-resize function for text areas
  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };
  
  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white min-h-[200px]">
      {segments.map(segment => (
        <React.Fragment key={segment.id}>
          {segment.type === 'text' ? (
            <textarea
              value={segment.content}
              onChange={(e) => handleSegmentChange(segment.id, e.target.value)}
              onInput={autoResize}
              className="border-0 p-0 focus:ring-0 resize-none w-full inline-block"
              style={{
                minHeight: '24px',
                height: 'auto'
              }}
            />
          ) : (
            <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700 whitespace-nowrap">
              {segment.content}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TemplateEditor;
