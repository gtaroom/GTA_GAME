import React, { useState, useEffect } from 'react';
import Button from './Button';

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onChange,
  placeholder = 'Start typing...'
}) => {
  const [content, setContent] = useState(initialValue);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    onChange(content);
  }, [content, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const saveSelection = () => {
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (textarea) {
      setSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });
    }
  };

  const restoreSelection = () => {
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (textarea && selection) {
      textarea.focus();
      textarea.setSelectionRange(selection.start, selection.end);
    }
  };

  const insertTag = (startTag: string, endTag: string = '') => {
    saveSelection();
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newContent = content.substring(0, start) + startTag + selectedText + endTag + content.substring(end);
      
      setContent(newContent);
      
      // Set cursor position after the operation
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + startTag.length + selectedText.length + endTag.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const insertVariable = (variable: string) => {
    saveSelection();
    insertTag(variable, '');
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-2 border-b border-gray-300 flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<h1>', '</h1>')}
          title="Heading 1"
        >
          H1
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<h2>', '</h2>')}
          title="Heading 2"
        >
          H2
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<p>', '</p>')}
          title="Paragraph"
        >
          P
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<strong>', '</strong>')}
          title="Bold"
        >
          B
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<em>', '</em>')}
          title="Italic"
        >
          I
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<u>', '</u>')}
          title="Underline"
        >
          U
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<a href="#">', '</a>')}
          title="Link"
        >
          Link
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
          title="Unordered List"
        >
          UL
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')}
          title="Ordered List"
        >
          OL
        </Button>
        <div className="border-l border-gray-400 h-6 mx-1"></div>
        {/* <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertVariable('{userName}')}
          title="Insert User Name"
        >
          User Name
        </Button> */}
        {/* <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => insertVariable('{userEmail}')}
          title="Insert User Email"
        >
          User Email
        </Button> */}
      </div>
      <textarea
        id="rich-text-editor"
        className="w-full p-3 min-h-[300px] focus:outline-none"
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        onClick={saveSelection}
        onKeyUp={saveSelection}
      ></textarea>
      <div className="bg-gray-50 p-3 border-t border-gray-300">
        <div className="text-sm text-gray-500">
          Use HTML tags for formatting.
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;