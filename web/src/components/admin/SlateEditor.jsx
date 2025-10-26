import { useMemo, useCallback, useState } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Image as ImageIcon,
  Type,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SlateEditor = ({ value, onChange, onImageSelect, className = '' }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Ensure value is an array of blocks
  const editorValue = useMemo(() => {
    if (!value) return [{ type: 'paragraph', children: [{ text: '' }] }];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [{ type: 'paragraph', children: [{ text: '' }] }];
      } catch {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
      }
    }
    return Array.isArray(value) ? value : [{ type: 'paragraph', children: [{ text: '' }] }];
  }, [value]);

  const handleChange = useCallback((newValue) => {
    onChange(JSON.stringify(newValue));
  }, [onChange]);

  const toggleMark = useCallback((format) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      editor.removeMark(format);
    } else {
      editor.addMark(format, true);
    }
  }, [editor]);

  const toggleBlock = useCallback((format) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    if (isActive) {
      editor.setNodes({ type: 'paragraph' });
      if (isList) {
        editor.unwrapNodes({ match: (n) => LIST_TYPES.includes(n.type) });
      }
    } else {
      const newProperties = { type: format };
      editor.setNodes(newProperties);
      if (isList) {
        const block = { type: 'list-item', children: [] };
        editor.wrapNodes(block);
      }
    }
  }, [editor]);

  const handleInsertImage = useCallback(() => {
    onImageSelect?.();
  }, [onImageSelect]);

  const handleInsertLink = useCallback(() => {
    if (!linkUrl || !linkText) {
      toast.error('Please enter both URL and link text');
      return;
    }

    editor.insertNodes([
      {
        type: 'link',
        url: linkUrl,
        children: [{ text: linkText }],
      },
      { type: 'paragraph', children: [{ text: '' }] },
    ]);

    setLinkUrl('');
    setLinkText('');
    setIsLinkModalOpen(false);
  }, [editor, linkUrl, linkText]);

  const renderElement = useCallback((props) => {
    return <Element {...props} />;
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <div className={`flex flex-col border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <ToolbarButton
          icon={<Bold size={18} />}
          title="Bold (Ctrl+B)"
          active={isMarkActive(editor, 'bold')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark('bold');
          }}
        />
        <ToolbarButton
          icon={<Italic size={18} />}
          title="Italic (Ctrl+I)"
          active={isMarkActive(editor, 'italic')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark('italic');
          }}
        />
        <ToolbarButton
          icon={<Underline size={18} />}
          title="Underline (Ctrl+U)"
          active={isMarkActive(editor, 'underline')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark('underline');
          }}
        />

        <div className="w-px bg-gray-300 dark:bg-gray-500 mx-1" />

        {/* Headings */}
        <ToolbarButton
          icon={<Heading2 size={18} />}
          title="Heading 2"
          active={isBlockActive(editor, 'heading-two')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock('heading-two');
          }}
        />
        <ToolbarButton
          icon={<Type size={18} />}
          title="Heading 3"
          active={isBlockActive(editor, 'heading-three')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock('heading-three');
          }}
        />

        <div className="w-px bg-gray-300 dark:bg-gray-500 mx-1" />

        {/* Lists */}
        <ToolbarButton
          icon={<List size={18} />}
          title="Bullet List"
          active={isBlockActive(editor, 'bulleted-list')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock('bulleted-list');
          }}
        />
        <ToolbarButton
          icon={<ListOrdered size={18} />}
          title="Numbered List"
          active={isBlockActive(editor, 'numbered-list')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock('numbered-list');
          }}
        />

        <div className="w-px bg-gray-300 dark:bg-gray-500 mx-1" />

        {/* Block Elements */}
        <ToolbarButton
          icon={<Quote size={18} />}
          title="Blockquote"
          active={isBlockActive(editor, 'block-quote')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock('block-quote');
          }}
        />
        <ToolbarButton
          icon={<Code2 size={18} />}
          title="Code Block"
          active={isBlockActive(editor, 'code-block')}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock('code-block');
          }}
        />

        <div className="w-px bg-gray-300 dark:bg-gray-500 mx-1" />

        {/* Media */}
        <ToolbarButton
          icon={<Link2 size={18} />}
          title="Insert Link"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsLinkModalOpen(true);
          }}
        />
        <ToolbarButton
          icon={<ImageIcon size={18} />}
          title="Insert Image"
          onMouseDown={(e) => {
            e.preventDefault();
            handleInsertImage();
          }}
        />
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Insert Link</h3>
            <input
              type="text"
              placeholder="Link text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="url"
              placeholder="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <Slate editor={editor} initialValue={editorValue} onChange={handleChange}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (!event.ctrlKey && !event.metaKey) {
              return;
            }

            switch (event.key) {
              case 'b': {
                event.preventDefault();
                toggleMark('bold');
                break;
              }
              case 'i': {
                event.preventDefault();
                toggleMark('italic');
                break;
              }
              case 'u': {
                event.preventDefault();
                toggleMark('underline');
                break;
              }
              default:
                break;
            }
          }}
          className="p-4 min-h-96 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          placeholder="Start typing..."
        />
      </Slate>
    </div>
  );
};

// Toolbar Button Component
const ToolbarButton = ({ icon, title, active, onMouseDown }) => (
  <button
    onMouseDown={onMouseDown}
    title={title}
    className={`p-2 rounded flex items-center justify-center transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500'
    }`}
  >
    {icon}
  </button>
);

// Element Renderer
const Element = (props) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case 'heading-two':
      return (
        <h2 {...attributes} className="text-2xl font-bold my-2">
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 {...attributes} className="text-xl font-bold my-2">
          {children}
        </h3>
      );
    case 'block-quote':
      return (
        <blockquote {...attributes} className="border-l-4 border-gray-400 pl-4 italic my-2 text-gray-600 dark:text-gray-400">
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul {...attributes} className="list-disc list-inside my-2">
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol {...attributes} className="list-decimal list-inside my-2">
          {children}
        </ol>
      );
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'code-block':
      return (
        <pre {...attributes} className="bg-gray-200 dark:bg-gray-700 p-2 rounded my-2 overflow-x-auto">
          <code>{children}</code>
        </pre>
      );
    case 'link':
      return (
        <a
          {...attributes}
          href={element.url}
          className="text-blue-600 dark:text-blue-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    case 'image':
      return (
        <img
          {...attributes}
          src={element.url}
          alt={element.alt || 'Image'}
          className="max-w-full my-2 rounded"
        />
      );
    default:
      return (
        <p {...attributes} className="my-1">
          {children}
        </p>
      );
  }
};

// Leaf Renderer
const Leaf = (props) => {
  const { attributes, children, leaf } = props;

  let element = children;

  if (leaf.bold) {
    element = <strong>{element}</strong>;
  }

  if (leaf.italic) {
    element = <em>{element}</em>;
  }

  if (leaf.underline) {
    element = <u>{element}</u>;
  }

  if (leaf.code) {
    element = (
      <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono text-sm">
        {element}
      </code>
    );
  }

  return <span {...attributes}>{element}</span>;
};

// Helper functions
const isMarkActive = (editor, format) => {
  const marks = editor.marks;
  return marks ? marks[format] === true : false;
};

const isBlockActive = (editor, format) => {
  const [match] = editor.nodes({
    match: (n) => n.type === format,
  });
  return !!match;
};

const LIST_TYPES = ['bulleted-list', 'numbered-list'];

export default SlateEditor;
