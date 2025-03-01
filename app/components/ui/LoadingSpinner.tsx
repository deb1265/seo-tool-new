export default function LoadingSpinner({ size = 'default' }: { size?: 'default' | 'large' | 'small' }) {
  const sizeClass = size === 'large' ? 'spinner-lg' : size === 'small' ? 'w-4 h-4 border' : '';
  
  return (
    <div className="flex justify-center items-center py-4">
      <div className={`spinner ${sizeClass}`} aria-label="Loading"></div>
    </div>
  );
}
