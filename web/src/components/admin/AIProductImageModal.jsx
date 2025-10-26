import { useState, useEffect } from 'react';
import { X, Sparkles, Loader, Check, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AIProductImageModal = ({ media, isOpen, onClose, onComplete }) => {
  const [status, setStatus] = useState('idle'); // idle, generating, completed, error
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    shadowStyle: 'soft',
    backgroundColor: '#FFFFFF'
  });

  // Poll for status
  useEffect(() => {
    if (!jobId || status === 'completed' || status === 'error') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai-image/status/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (data.status === 'COMPLETED') {
          setStatus('completed');
          setGeneratedImage(data.media);
          setProgress(100);
          toast.success('AI generation completed!');

          // Auto-close after 3 seconds
          setTimeout(() => {
            onComplete(data.media);
            onClose();
          }, 3000);

        } else if (data.status === 'FAILED') {
          setStatus('error');
          setError('Generation failed');
          toast.error('Generation failed');
        } else {
          // IN_PROGRESS or IN_QUEUE
          setProgress(prev => Math.min(prev + 5, 90));
        }
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, status, onComplete, onClose]);

  const handleGenerate = async () => {
    try {
      setStatus('generating');
      setProgress(10);
      setError(null);

      const response = await fetch(`/api/ai-image/generate/${media.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(options)
      });

      const data = await response.json();

      if (data.success) {
        setJobId(data.jobId);
        toast.success('Generation started!');
      } else {
        throw new Error(data.error || 'Failed to start generation');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setJobId(null);
    setProgress(0);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Product Image Generation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Image Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Original Image
            </label>
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={media?.url}
                alt={media?.originalName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Options (only show in idle state) */}
          {status === 'idle' && (
            <>
              {/* Shadow Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shadow Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['minimal', 'soft', 'dramatic'].map(style => (
                    <button
                      key={style}
                      onClick={() => setOptions({...options, shadowStyle: style})}
                      className={`p-3 border rounded-lg text-sm font-medium capitalize ${
                        options.shadowStyle === style
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => setOptions({...options, backgroundColor: '#FFFFFF'})}
                    className={`p-3 border rounded-lg bg-white ${
                      options.backgroundColor === '#FFFFFF' ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-700">White</div>
                  </button>
                  <button
                    onClick={() => setOptions({...options, backgroundColor: '#F3F4F6'})}
                    className={`p-3 border rounded-lg bg-gray-100 ${
                      options.backgroundColor === '#F3F4F6' ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-700">Light Gray</div>
                  </button>
                  <button
                    onClick={() => setOptions({...options, backgroundColor: '#FFF8F0'})}
                    className={`p-3 border rounded-lg ${
                      options.backgroundColor === '#FFF8F0' ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{ backgroundColor: '#FFF8F0' }}
                  >
                    <div className="text-xs font-medium text-gray-700">Warm</div>
                  </button>
                  <button
                    onClick={() => setOptions({...options, backgroundColor: '#F0F9FF'})}
                    className={`p-3 border rounded-lg ${
                      options.backgroundColor === '#F0F9FF' ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{ backgroundColor: '#F0F9FF' }}
                  >
                    <div className="text-xs font-medium text-gray-700">Cool</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Generating State */}
          {status === 'generating' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Loader className="w-12 h-12 animate-spin text-purple-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Generating AI image...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                This usually takes 10-15 seconds
              </div>
            </div>
          )}

          {/* Completed State */}
          {status === 'completed' && generatedImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Generated Image
                </label>
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={generatedImage.url}
                    alt="AI Generated"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              <div className="text-center text-sm text-green-600 dark:text-green-400">
                Image replaced successfully! Closing in 3 seconds...
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="text-center text-red-600 dark:text-red-400">
                {error || 'Generation failed. Please try again.'}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {status === 'completed' ? 'Close' : 'Cancel'}
          </button>
          {status === 'idle' && (
            <button
              onClick={handleGenerate}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProductImageModal;
