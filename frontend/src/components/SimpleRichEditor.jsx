import React, { useState, useRef, useEffect } from 'react';

const SimpleRichEditor = ({ value, onChange, placeholder }) => {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState('right');
  const editorRef = useRef(null);
  const helpButtonRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateActiveStates();
  };

  const insertHTML = (html) => {
    document.execCommand('insertHTML', false, html);
    editorRef.current.focus();
  };

  const handleInput = () => {
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveStates();
  };

  const updateActiveStates = () => {
    if (editorRef.current) {
      setActiveStates({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline')
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
          ? range.commonAncestorContainer.parentElement 
          : range.commonAncestorContainer;
        
        // Check if we're inside a list item
        if (parentElement && (parentElement.tagName === 'LI' || parentElement.closest('li'))) {
          const listItem = parentElement.tagName === 'LI' ? parentElement : parentElement.closest('li');
          
          // If the list item is empty, break out of the list
          if (listItem.textContent.trim() === '') {
            e.preventDefault();
            document.execCommand('outdent');
            return;
          }
        }
      }
    } else if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
          ? range.commonAncestorContainer.parentElement 
          : range.commonAncestorContainer;
        
        // Check if we're inside a list item and at the beginning
        if (parentElement && (parentElement.tagName === 'LI' || parentElement.closest('li'))) {
          const listItem = parentElement.tagName === 'LI' ? parentElement : parentElement.closest('li');
          
          // If we're at the beginning of a list item and it's empty, break out of the list
          if (range.startOffset === 0 && listItem.textContent.trim() === '') {
            e.preventDefault();
            document.execCommand('outdent');
            return;
          }
        }
      }
    }
  };

  const toggleHelp = () => {
    const newShowHelp = !showHelp;
    setShowHelp(newShowHelp);
    
    if (newShowHelp && helpButtonRef.current) {
      // Check if tooltip would overflow on mobile
      setTimeout(() => {
        if (tooltipRef.current && helpButtonRef.current) {
          const buttonRect = helpButtonRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          
          // If tooltip would overflow right side, position it to the left
          if (buttonRect.right + tooltipRect.width > viewportWidth) {
            setTooltipPosition('left');
          } else {
            setTooltipPosition('right');
          }
        }
      }, 0);
    }
  };

  // Initialize content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Update content only when external value changes (not from typing)
  useEffect(() => {
    if (editorRef.current && isInitialized && value !== editorRef.current.innerHTML) {
      const cursorPosition = editorRef.current.selectionStart;
      editorRef.current.innerHTML = value || '';
      
      // Try to restore cursor position
      if (cursorPosition !== undefined) {
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (editorRef.current.firstChild) {
          range.setStart(editorRef.current.firstChild, Math.min(cursorPosition, editorRef.current.firstChild.length));
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }, [value, isInitialized]);

  return (
    <div className="simple-rich-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          title="Bold"
          className={`toolbar-btn ${activeStates.bold ? 'active' : ''}`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          title="Italic"
          className={`toolbar-btn ${activeStates.italic ? 'active' : ''}`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          title="Underline"
          className={`toolbar-btn ${activeStates.underline ? 'active' : ''}`}
        >
          <u>U</u>
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={() => insertHTML('<ul><li></li></ul>')}
          title="Bullet List"
          className="toolbar-btn"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertHTML('<ol><li></li></ol>')}
          title="Numbered List"
          className="toolbar-btn"
        >
          1. List
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
          className="toolbar-btn"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
          className="toolbar-btn"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
          className="toolbar-btn"
        >
          →
        </button>
        <div className="toolbar-separator"></div>
        <div className="help-button-container">
          <button
            ref={helpButtonRef}
            type="button"
            onClick={toggleHelp}
            title="Help"
            className="toolbar-btn help-btn"
          >
            ?
          </button>
          {showHelp && (
            <>
              <div className="help-backdrop" onClick={() => setShowHelp(false)}></div>
              <div 
                ref={tooltipRef}
                className={`editor-help-tooltip ${tooltipPosition === 'left' ? 'tooltip-left' : 'tooltip-right'}`}
              >
                <div className="help-content">
                  <h4>Editor Help</h4>
                  <ul>
                    <li><strong>Bold, Italic, Underline:</strong> Highlight in blue when active</li>
                    <li><strong>Lists:</strong> Click to create • Press Enter for new items • Press Enter in empty item to exit</li>
                    <li><strong>Alignment:</strong> Left, Center, Right text alignment</li>
                  </ul>
                  <button 
                    type="button" 
                    className="close-help-btn"
                    onClick={() => setShowHelp(false)}
                  >
                    ×
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsToolbarVisible(true)}
        onBlur={() => setIsToolbarVisible(false)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SimpleRichEditor; 