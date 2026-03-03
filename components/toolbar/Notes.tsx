import React from 'react';
import { useToolbar } from '../../hooks/useToolbarState';
import Draggable from './Draggable';

const Notes: React.FC = () => {
  const { notes, setNotes, toggleTool } = useToolbar();

  return (
    <Draggable title="Rough notes" onClose={() => toggleTool('notes')}>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-80 h-64 bg-gray-900/50 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 resize-both"
        placeholder="Type your notes here..."
      />
    </Draggable>
  );
};

export default Notes;
