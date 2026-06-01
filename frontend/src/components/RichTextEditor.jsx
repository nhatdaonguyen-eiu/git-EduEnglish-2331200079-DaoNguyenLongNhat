import { useEffect, useRef } from 'react';

function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Nhập nội dung...', 
  minHeight = '120px', 
  showHeadings = true, 
  showLists = true, 
  label 
}) {
  const editorRef = useRef(null);

  // Sync external value changes to the editor (like when clicking Edit, resetting the form, or initial load)
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const handleFormat = (e, command, val = null) => {
    e.preventDefault(); // Crucial: prevents editor from losing selection and focus when toolbar buttons are clicked
    document.execCommand(command, false, val);
    handleInput();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all text-left">
      {label && (
        <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
          {label}
        </div>
      )}
      
      {/* 🛠️ BỘ CÔNG CỤ SOẠN THẢO WORD (RICH TEXT TOOLBAR) */}
      <div className="bg-slate-50 p-2 border-b border-slate-200 flex flex-wrap gap-1.5 items-center shrink-0">
        {/* In đậm */}
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'bold')}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
          title="In đậm"
        >
          𝗕
        </button>

        {/* In nghiêng */}
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'italic')}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
          title="In nghiêng"
        >
          𝘐
        </button>

        {/* Gạch chân */}
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'underline')}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
          title="Gạch chân"
        >
          <u>𝘜</u>
        </button>

        {showHeadings && (
          <>
            <span className="w-px h-5 bg-slate-300 mx-1"></span>
            
            {/* Tiêu đề H2 */}
            <button
              type="button"
              onMouseDown={(e) => handleFormat(e, 'formatBlock', '<h2>')}
              className="px-2 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-black flex items-center justify-center text-[10px] uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
              title="Tiêu đề chính H2"
            >
              H2
            </button>

            {/* Tiêu đề H3 */}
            <button
              type="button"
              onMouseDown={(e) => handleFormat(e, 'formatBlock', '<h3>')}
              className="px-2 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-black flex items-center justify-center text-[10px] uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
              title="Tiêu đề phụ H3"
            >
              H3
            </button>

            {/* Đoạn văn thường */}
            <button
              type="button"
              onMouseDown={(e) => handleFormat(e, 'formatBlock', '<p>')}
              className="px-2.5 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-black flex items-center justify-center text-[10px] uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
              title="Đoạn văn thường"
            >
              ¶ Paragraph
            </button>
          </>
        )}

        {showLists && (
          <>
            <span className="w-px h-5 bg-slate-300 mx-1"></span>
            
            {/* Bullet List */}
            <button
              type="button"
              onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')}
              className="px-2 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
              title="Danh sách dấu chấm"
            >
              • List
            </button>

            {/* Ordered List */}
            <button
              type="button"
              onMouseDown={(e) => handleFormat(e, 'insertOrderedList')}
              className="px-2 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
              title="Danh sách số"
            >
              1. List
            </button>
          </>
        )}

        <span className="w-px h-5 bg-slate-300 mx-1"></span>

        {/* Kích thước chữ */}
        <select
          onChange={(e) => {
            document.execCommand('fontSize', false, e.target.value);
            handleInput();
            e.target.value = "3"; // Trả lại hiển thị mặc định
          }}
          className="px-1.5 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer shadow-sm focus:outline-none"
          title="Kích thước chữ"
          defaultValue="3"
        >
          <option value="2">Cỡ nhỏ (14px)</option>
          <option value="3">Cỡ vừa (16px)</option>
          <option value="4">Cỡ lớn (18px)</option>
          <option value="5">Cỡ đại (24px)</option>
          <option value="6">Cỡ cực đại (32px)</option>
        </select>

        {/* Màu chữ */}
        <select
          onChange={(e) => {
            document.execCommand('foreColor', false, e.target.value);
            handleInput();
            e.target.value = "#1e293b"; // Trả lại hiển thị mặc định
          }}
          className="px-1.5 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer shadow-sm focus:outline-none"
          title="Màu chữ"
          defaultValue="#1e293b"
        >
          <option value="#1e293b">Mặc định (Slate)</option>
          <option value="#f97316">Màu Cam (EduOrange)</option>
          <option value="#10b981">Màu Xanh lá (Emerald)</option>
          <option value="#3b82f6">Màu Xanh dương (Blue)</option>
          <option value="#ef4444">Màu Đỏ (Red)</option>
          <option value="#6b7280">Màu Xám (Grey)</option>
        </select>

        <span className="w-px h-5 bg-slate-300 mx-1"></span>

        {/* Xóa định dạng */}
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'removeFormat')}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-red-50 text-red-500 hover:text-red-700 flex items-center justify-center text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
          title="Xóa định dạng"
        >
          ✕
        </button>
      </div>

      {/* 📝 TẤM SOẠN THẢO (EDITABLE CANVAS SHEET) */}
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onBlur={handleInput}
        placeholder={placeholder}
        style={{ minHeight }}
        className="rich-text-editor-canvas w-full px-5 py-4 focus:outline-none text-sm text-slate-800 placeholder-slate-400 bg-white leading-relaxed text-left prose prose-slate max-w-none 
          prose-headings:text-slate-800 prose-headings:font-black
          prose-h2:text-lg prose-h2:border-l-4 prose-h2:border-orange-500 prose-h2:pl-3 prose-h2:pt-2
          prose-h3:text-sm prose-h3:text-orange-600 prose-h3:font-extrabold overflow-y-auto"
      />

      {/* Scoped CSS styling for contentEditable placeholder */}
      <style>{`
        .rich-text-editor-canvas:empty::before {
          content: attr(placeholder);
          color: #94a3b8;
          font-weight: 500;
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
