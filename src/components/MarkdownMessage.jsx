import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownMessage.css';

const MarkdownMessage = ({ content, sender }) => {
  const contentRef = useRef(null);

  // Add table interaction enhancements
  useEffect(() => {
    if (contentRef.current) {
      const tables = contentRef.current.querySelectorAll('.table-wrapper');
      
      tables.forEach(tableWrapper => {
        const table = tableWrapper.querySelector('.markdown-table');
        const scrollHint = tableWrapper.querySelector('.table-scroll-hint');
        
        if (table && scrollHint) {
          // Hide scroll hint after user scrolls
          const handleScroll = () => {
            if (tableWrapper.scrollLeft > 10) {
              scrollHint.style.opacity = '0.3';
            } else {
              scrollHint.style.opacity = '1';
            }
          };
          
          // Show scroll hint initially if table is scrollable
          const isScrollable = table.scrollWidth > tableWrapper.clientWidth;
          if (!isScrollable) {
            scrollHint.style.display = 'none';
          }
          
          tableWrapper.addEventListener('scroll', handleScroll);
          
          // Cleanup
          return () => {
            tableWrapper.removeEventListener('scroll', handleScroll);
          };
        }
      });
    }
  }, [content]);

  // Custom components for markdown rendering
  const components = {
    // Custom paragraph handling
    p: ({ children }) => <p className="markdown-p">{children}</p>,
    
    // Custom code block handling
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="code-block">
          <div className="code-header">
            <span className="code-language">{match[1]}</span>
          </div>
          <pre className="code-content">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code className="inline-code" {...props}>
          {children}
        </code>
      );
    },
    
    // Custom link handling
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="markdown-link"
      >
        {children}
      </a>
    ),
    
    // Custom list handling
    ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
    ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
    li: ({ children }) => <li className="markdown-li">{children}</li>,
    
    // Custom blockquote handling
    blockquote: ({ children }) => (
      <blockquote className="markdown-blockquote">{children}</blockquote>
    ),
    
    // Custom table handling with mobile optimizations
    table: ({ children }) => (
      <div className="table-wrapper" role="region" aria-label="Data table" tabIndex="0">
        <table className="markdown-table">{children}</table>
        <div className="table-scroll-hint" aria-hidden="true">
          ← Vuốt để xem thêm →
        </div>
      </div>
    ),
    
    // Custom table cell handling for better mobile experience
    td: ({ children, ...props }) => (
      <td {...props} title={typeof children === 'string' ? children : ''}>
        {children}
      </td>
    ),
    
    th: ({ children, ...props }) => (
      <th {...props} title={typeof children === 'string' ? children : ''}>
        {children}
      </th>
    ),
    
    // Custom heading handling
    h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
    h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
    h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
    h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
  };

  return (
    <div ref={contentRef} className={`markdown-content ${sender}`}>
      <ReactMarkdown 
        components={components}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;