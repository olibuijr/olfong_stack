import { useState } from 'react';
import { Edit, Trash2, Image as ImageIcon, Loader } from 'lucide-react';
import { useLanguage } from "../../contexts/LanguageContext";

const MediaGrid = ({
  media,
  selectedItems,
  onSelectItem,
  onEdit,
  onDelete,
  formatFileSize,
  formatDate
}) => {
  const { t } = useLanguage();
  const [loadingImages, setLoadingImages] = useState(new Set());

  const isSelected = (item) => {
    return selectedItems.includes(item.id);
  };

  const handleImageLoad = (itemId) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };



  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {media.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative group">
                      <div className="aspect-square bg-white dark:bg-white flex items-center justify-center relative">
                        {item.mimeType.startsWith('image/') ? (
                          <>
                            {loadingImages.has(item.id) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                                <Loader className="w-6 h-6 animate-spin text-gray-400" />
                              </div>
                            )}
                            <img
                              src={item.thumbnailUrl || item.url}
                              alt={item.alt || item.originalName}
                              className={`w-full h-full object-contain transition-opacity duration-300 ${
                                loadingImages.has(item.id) ? 'opacity-0' : 'opacity-100'
                              }`}
                              loading="lazy"
                              onLoad={() => handleImageLoad(item.id)}
                              onError={() => handleImageLoad(item.id)}
                            />
                          </>
                        ) : (
                          <div className="text-center text-gray-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <span className="text-xs">{item.mimeType.split('/')[1].toUpperCase()}</span>
                          </div>
                        )}
                      </div>

            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                checked={isSelected(item)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelectItem(item.id, true);
                  } else {
                    onSelectItem(item.id, false);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => onEdit(item)}
                className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-600"
                title={t('adminMedia.edit')}
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                title={t('adminMedia.delete')}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
              {item.originalName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(item.size)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;