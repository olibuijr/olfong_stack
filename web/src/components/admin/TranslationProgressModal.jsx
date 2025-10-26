import { useState, useEffect, useRef } from 'react';
import { Loader2, X, Check, AlertCircle } from 'lucide-react';

const TranslationProgressModal = ({ isOpen, type, title, onClose, sourceLocale, targetLocale, itemKey, itemValue, translatingKey }) => {
  const [logs, setLogs] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [result, setResult] = useState(null);
  const logsEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Start listening to SSE when modal opens
  useEffect(() => {
    if (!isOpen) {
      setLogs([]);
      setIsComplete(false);
      setHasError(false);
      setResult(null);
      return;
    }

    const startTranslation = async () => {
      try {
        let endpoint = '';
        let body = {};

        if (type === 'batch') {
          endpoint = '/api/translations/generate-stream';
          body = {
            sourceLocale,
            targetLocale
          };
        } else if (type === 'single') {
          endpoint = '/api/translations/translate-item-stream';
          body = {
            key: itemKey,
            sourceLocale,
            targetLocale,
            value: itemValue
          };
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'start') {
                  setLogs(prev => [...prev, { type: 'info', message: data.message }]);
                } else if (data.type === 'log') {
                  setLogs(prev => [...prev, { type: 'log', message: data.message }]);
                } else if (data.type === 'error') {
                  setLogs(prev => [...prev, { type: 'error', message: data.message }]);
                  setHasError(true);
                } else if (data.type === 'complete') {
                  setLogs(prev => [...prev, { type: 'success', message: 'Translation completed successfully!' }]);
                  setResult(data.data);
                  setIsComplete(true);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error streaming translation:', error);
        setLogs(prev => [...prev, { type: 'error', message: `Error: ${error.message}` }]);
        setHasError(true);
      } finally {
        if (!hasError) {
          setIsComplete(true);
        }
      }
    };

    startTranslation();
  }, [isOpen, type, sourceLocale, targetLocale, itemKey, itemValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {!isComplete ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : hasError ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Check className="w-5 h-5 text-green-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={!isComplete}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Logs Container */}
        <div className="flex-1 overflow-y-auto bg-gray-900 dark:bg-gray-950 p-4 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Starting translation...
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap break-words mb-1 ${
                  log.type === 'error'
                    ? 'text-red-400'
                    : log.type === 'success'
                    ? 'text-green-400'
                    : log.type === 'info'
                    ? 'text-blue-400'
                    : 'text-gray-300'
                }`}
              >
                {log.message}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                hasError
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {hasError ? 'Close' : 'Done'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationProgressModal;
