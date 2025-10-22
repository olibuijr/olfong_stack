import PropTypes from 'prop-types';

const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`card overflow-hidden ${className}`}>
            <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        );
      
      case 'product':
        return (
          <div className="group">
            <div className={`card overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md ${className}`}>
              <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
              <div className="p-6 bg-white">
                <div className="mb-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        );
      
      case 'button':
        return (
          <div className={`h-10 bg-gray-200 rounded animate-pulse ${className}`}></div>
        );
      
      case 'image':
        return (
          <div className={`bg-gray-200 animate-pulse ${className}`}></div>
        );
      
      default:
        return (
          <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['card', 'product', 'text', 'button', 'image']),
  count: PropTypes.number,
  className: PropTypes.string,
};

export default SkeletonLoader;