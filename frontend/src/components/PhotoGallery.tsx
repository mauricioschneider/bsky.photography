import React, { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Author {
  handle: string;
  displayName: string;
  profileUrl: string;
}

interface PhotoPost {
  id: string;
  text: string;
  author: Author;
  postUrl: string;
  imageUrl: string;
  fullImageUrl: string;
  createdAt: string;
}

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/photos');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: unknown = await response.json();
        
        if (!Array.isArray(data) || !data.every(isValidPhotoPost)) {
          throw new Error('Invalid data format received from server');
        }
        
        setPhotos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load photos');
        console.error('Error fetching photos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Type guard for PhotoPost
  const isValidPhotoPost = (value: unknown): value is PhotoPost => {
    if (!value || typeof value !== 'object') return false;
    
    const candidate = value as Partial<PhotoPost>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.text === 'string' &&
      typeof candidate.postUrl === 'string' &&
      typeof candidate.imageUrl === 'string' &&
      typeof candidate.fullImageUrl === 'string' &&
      typeof candidate.createdAt === 'string' &&
      isValidAuthor(candidate.author)
    );
  };

  // Type guard for Author
  const isValidAuthor = (value: unknown): value is Author => {
    if (!value || typeof value !== 'object') return false;
    
    const candidate = value as Partial<Author>;
    return (
      typeof candidate.handle === 'string' &&
      typeof candidate.displayName === 'string' &&
      typeof candidate.profileUrl === 'string'
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex(current => 
      current !== null ? (current > 0 ? current - 1 : photos.length - 1) : null
    );
  }, [photos.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex(current => 
      current !== null ? (current < photos.length - 1 ? current + 1 : 0) : null
    );
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          handleCloseModal();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImageIndex, handlePrevious, handleNext]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 dark:text-gray-100">
        <div className="text-xl">Loading photography posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-xl text-red-500">Error loading photos</div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="p-8 relative">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute right-4 top-8 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Sun className="w-6 h-6 text-gray-100" />
          ) : (
            <Moon className="w-6 h-6 text-gray-800" />
          )}
        </button>
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
          Bluesky Photography
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
          Showing {photos.length} photography posts
        </p>
      </header>
      
      <main className="flex-grow p-8 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
          {photos.map((photo, index) => (
            <article 
              key={photo.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 aspect-square flex flex-col"
            >
              <div 
                className="flex-grow cursor-pointer overflow-hidden"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.text}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4 bg-white dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[3rem]">
                  {photo.text}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <a 
                    href={photo.author.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center"
                  >
                    {photo.author.displayName}
                    <ExternalLink size={14} className="ml-1 opacity-50" />
                  </a>
                  <a
                    href={photo.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {formatDate(photo.createdAt)}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>
          Created by{' '}
          <a 
            href="https://github.com/yourusername" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Your Name
          </a>
        </p>
        <p className="mt-1">
          Favicon by{' '}
          <a 
            href="https://icons8.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Icons8
          </a>
        </p>
      </footer>

      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close fullscreen image"
          >
            <X size={24} />
          </button>

          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>

          <div 
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={photos[selectedImageIndex].fullImageUrl}
              alt={photos[selectedImageIndex].text}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedImageIndex 
                      ? 'bg-white w-4' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{photos[selectedImageIndex].author.displayName}</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-300">
                    {selectedImageIndex + 1} / {photos.length}
                  </span>
                  <a
                    href={photos[selectedImageIndex].postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                    onClick={e => e.stopPropagation()}
                  >
                    View post <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-200 mt-1">
                {photos[selectedImageIndex].text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;