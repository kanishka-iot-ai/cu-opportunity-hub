import React, { useState, useEffect } from 'react';
import { Bookmark, Compass, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';

export const SavedOpportunities = ({ onSelectOpportunity, onNavigateExplore }) => {
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const data = await api.getSavedOpportunities();
      setSavedOpportunities(data.saved_opportunities || []);
    } catch (err) {
      console.error('Failed to load saved opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = (id, isSaved) => {
    if (!isSaved) {
      setSavedOpportunities((prev) => prev.filter((o) => o.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-red-700" />
            Saved Opportunities
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Keep track of bookmarks and upcoming application deadlines in one place.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
          Saved Items: <strong className="text-slate-900">{savedOpportunities.length}</strong>
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading saved opportunities...</div>
      ) : savedOpportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No saved opportunities yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click the bookmark icon on any opportunity card to save it for quick reference later.
          </p>
          <button
            onClick={onNavigateExplore}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 cursor-pointer shadow-xs"
          >
            Explore Opportunities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              onSaveToggle={handleSaveToggle}
              showRecommendation={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOpportunities;
