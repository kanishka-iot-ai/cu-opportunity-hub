import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Compass,
  Building,
  CheckCircle2,
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';

export const OpportunityExplorer = ({ onSelectOpportunity, initialSearch = '' }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [isPaid, setIsPaid] = useState('');
  const [closingSoon, setClosingSoon] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, deptsRes] = await Promise.all([
          api.getCategories(),
          api.getDepartments()
        ]);
        setCategories(catsRes.categories || []);
        setDepartments(deptsRes.departments || []);
      } catch (err) {
        console.error('Failed to load categories/departments:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = {
        q: search,
        category_slug: selectedCategory,
        department_id: selectedDept,
        mode: selectedMode,
        is_paid: isPaid,
        closing_soon: closingSoon ? 'true' : '',
        sort_by: sortBy
      };
      const data = await api.getOpportunities(params);
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOpportunities();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory, selectedDept, selectedMode, isPaid, closingSoon, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedDept('');
    setSelectedMode('ALL');
    setIsPaid('');
    setClosingSoon(false);
    setSortBy('newest');
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedDept,
    selectedMode !== 'ALL' ? selectedMode : '',
    isPaid !== '' ? isPaid : '',
    closingSoon ? 'closingSoon' : ''
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-red-700" />
            Opportunity Explorer
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Browse, filter, and discover over 20 categories of internships, hackathons, and research grants.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
          >
            <option value="newest">Recently Published</option>
            <option value="closing_soon">Closing Soonest</option>
            <option value="most_viewed">Most Popular</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Search and Quick Category Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role, company (e.g. Google, DRDO), tech stack (Python, AI), or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Badges Toggle */}
          <button
            onClick={() => setClosingSoon(!closingSoon)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              closingSoon
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>⏰ Closing Soon (&lt;7d)</span>
          </button>

          <button
            onClick={() => setIsPaid(isPaid === 'true' ? '' : 'true')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              isPaid === 'true'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>💰 Paid Only</span>
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 20 Categories Horizontal Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === ''
                ? 'bg-red-700 text-white font-semibold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(isSelected ? '' : c.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-700 text-white font-semibold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{c.name}</span>
                {c.active_count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.active_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter Row: Department & Mode */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-white p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700"
          >
            <option value="">All Departments (University-wide)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500">Mode:</span>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700"
          >
            <option value="ALL">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline (Campus/Onsite)</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500">
          Showing <span className="font-bold text-slate-900">{opportunities.length}</span> opportunities
        </div>
      </div>

      {/* Grid of Opportunities */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Searching Chandigarh University Opportunity Network...
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No opportunities found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search terms, changing the category, or clearing active filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 cursor-pointer shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              showRecommendation={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunityExplorer;
