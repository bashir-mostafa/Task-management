export default function ErrorMessage({ error }) {
  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 
      text-red-700 dark:text-red-300 p-5 mb-8 rounded-xl shadow-md 
      border-l-4 border-red-500 dark:border-red-400 
      backdrop-blur-sm animate-fadeIn">
      <div className="flex items-center justify-start gap-3">
        <div className="w-5 h-5 bg-red-500 dark:bg-red-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-base">{error}</p>
          
        </div>
      </div>
    </div>
  );
}