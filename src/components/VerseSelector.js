export default function VerseSelector({ nodes, selectedNode, onSelect }) {
  return (
    <div className="z-40 w-full mt-4">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl p-2 flex items-center justify-between relative">
        <select
          value={selectedNode?.id || ''}
          onChange={(e) => {
            const verseId = e.target.value;
            if (verseId === '') {
              onSelect(null);
            } else {
              const node = nodes.find(n => n.id === parseInt(verseId));
              onSelect(node);
            }
          }}
          className="w-full bg-transparent text-white text-base py-2 pl-4 pr-10 focus:outline-none appearance-none cursor-pointer placeholder-gray-400"
        >
          <option value="" className="bg-gray-900 text-gray-400">Search Surah Al-Mulk...</option>
          {nodes.map(node => (
            <option key={node.id} value={node.id} className="bg-gray-900 text-white">
              {node.name}: {node.theme}
            </option>
          ))}
        </select>

        {/* Custom Dropdown Arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
