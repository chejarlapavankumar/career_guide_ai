function SkeletonLoader() {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-gray-300 h-8 w-1/2 rounded animate-pulse mb-6"></div>
        
        <div className="mb-6">
          <div className="bg-gray-300 h-6 w-1/4 rounded animate-pulse mb-4"></div>
          <div className="space-y-2">
            <div className="bg-gray-200 h-4 w-full rounded animate-pulse"></div>
            <div className="bg-gray-200 h-4 w-5/6 rounded animate-pulse"></div>
          </div>
        </div>
  
        <div className="mb-6">
          <div className="bg-gray-300 h-6 w-1/4 rounded animate-pulse mb-4"></div>
          <div className="flex flex-wrap gap-2">
            <div className="bg-gray-200 h-6 w-20 rounded-full animate-pulse"></div>
            <div className="bg-gray-200 h-6 w-24 rounded-full animate-pulse"></div>
            <div className="bg-gray-200 h-6 w-16 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  export default SkeletonLoader;