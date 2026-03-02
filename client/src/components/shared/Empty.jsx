export default function Empty({ icon = '📭', title = 'Nothing here', description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <div className="text-gray-300 font-medium mb-1">{title}</div>
      {description && <div className="text-gray-500 text-sm max-w-sm">{description}</div>}
    </div>
  );
}
