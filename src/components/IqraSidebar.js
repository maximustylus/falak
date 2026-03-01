export default function IqraSidebar({ node, onClose }) {
  if (!node) return null;

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-black/80 backdrop-blur-md text-white p-6 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{node.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white focus:outline-none"
          aria-label="Close Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Section</h3>
          <p className="text-lg">{node.section}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Theme</h3>
          <p className="text-lg">{node.theme}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Arabic</h3>
          <p className="text-2xl font-arabic leading-loose text-right" dir="rtl">{node.arabic}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-1">English Translation</h3>
          <p className="text-base leading-relaxed text-gray-300">{node.english}</p>
        </div>
      </div>
    </div>
  );
}
