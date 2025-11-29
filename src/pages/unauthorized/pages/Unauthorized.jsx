export default function Unauthorized() {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <h1 className="text-3xl font-bold text-red-500">
          403 — غير مصرح لك بالدخول
        </h1>
        <p className="text-gray-600 mt-4">
          لا تملك صلاحية الوصول لهذه الصفحة.
        </p>
      </div>
    );
  }
  