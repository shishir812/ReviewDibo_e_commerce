type LoadingErrorProps = {
  loading?: boolean;
  error?: string | null;
  loadingText?: string;
};

export default function LoadingError({
  loading,
  error,
  loadingText = "Loading..."
}: LoadingErrorProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
        {loadingText}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return null;
}
