import { useState, useEffect } from 'react';
import { X, Sparkles, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const AIImageSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-image/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Load settings error:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/ai-image/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Settings saved successfully');
        onClose();
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Image Generation Settings
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Shadow Style Default */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Shadow Style
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['minimal', 'soft', 'dramatic'].map(style => (
                  <button
                    key={style}
                    onClick={() => setSettings({...settings, aiImageDefaultShadow: style})}
                    className={`p-4 border rounded-lg ${
                      settings.aiImageDefaultShadow === style
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="font-medium capitalize text-gray-900 dark:text-white">{style}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {style === 'minimal' && 'Subtle, barely visible shadow'}
                      {style === 'soft' && 'Realistic depth (Recommended)'}
                      {style === 'dramatic' && 'Strong visual impact'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Background Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setSettings({...settings, aiImageDefaultBackground: '#FFFFFF'})}
                  className={`p-3 border rounded-lg bg-white ${
                    settings.aiImageDefaultBackground === '#FFFFFF' ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">White</div>
                </button>
                <button
                  onClick={() => setSettings({...settings, aiImageDefaultBackground: '#F3F4F6'})}
                  className={`p-3 border rounded-lg bg-gray-100 ${
                    settings.aiImageDefaultBackground === '#F3F4F6' ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">Light Gray</div>
                </button>
                <button
                  onClick={() => setSettings({...settings, aiImageDefaultBackground: '#FFF8F0'})}
                  className={`p-3 border rounded-lg ${
                    settings.aiImageDefaultBackground === '#FFF8F0' ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{ backgroundColor: '#FFF8F0' }}
                >
                  <div className="text-sm font-medium text-gray-700">Warm White</div>
                </button>
                <button
                  onClick={() => setSettings({...settings, aiImageDefaultBackground: '#F0F9FF'})}
                  className={`p-3 border rounded-lg ${
                    settings.aiImageDefaultBackground === '#F0F9FF' ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{ backgroundColor: '#F0F9FF' }}
                >
                  <div className="text-sm font-medium text-gray-700">Cool White</div>
                </button>
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Resolution
              </label>
              <select
                value={settings.aiImageResolution || '1024'}
                onChange={(e) => setSettings({...settings, aiImageResolution: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="1024">1024×1024 ($0.03/image)</option>
                <option value="1536">1536×1536 ($0.07/image)</option>
                <option value="2048">2048×2048 ($0.13/image)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Higher resolution = better quality but higher cost
              </p>
            </div>

            {/* Advanced Settings */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Settings</h3>

              {/* Inference Steps */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inference Steps: <span className="text-purple-600">{settings.aiImageInferenceSteps || 28}</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="40"
                  value={settings.aiImageInferenceSteps || 28}
                  onChange={(e) => setSettings({...settings, aiImageInferenceSteps: e.target.value})}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  More steps = higher quality but slower generation (20-40)
                </p>
              </div>

              {/* Guidance Scale */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guidance Scale: <span className="text-purple-600">{settings.aiImageGuidance || 3.5}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="5"
                  step="0.5"
                  value={settings.aiImageGuidance || 3.5}
                  onChange={(e) => setSettings({...settings, aiImageGuidance: e.target.value})}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher values follow prompt more strictly (2-5)
                </p>
              </div>

              {/* Max Concurrent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Concurrent Generations (Batch Mode)
                </label>
                <select
                  value={settings.aiImageMaxConcurrent || '3'}
                  onChange={(e) => setSettings({...settings, aiImageMaxConcurrent: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="1">1 (Slower, cheapest)</option>
                  <option value="3">3 (Recommended)</option>
                  <option value="5">5 (Faster, more expensive)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Number of images to generate simultaneously in batch mode
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIImageSettings;
