import { Plus, Search, SortAsc, Filter } from 'lucide-react';
import { useState } from 'react';

/**
 * Props for DashboardHeader component
 */
interface DashboardHeaderProps {
  /** Search query value */
  searchQuery: string;
  /** Search query change handler */
  onSearchChange: (query: string) => void;
  /** Sort order */
  sortBy: 'name' | 'date' | 'cost';
  /** Sort order change handler */
  onSortChange: (sortBy: 'name' | 'date' | 'cost') => void;
  /** Filter status */
  filterStatus: 'all' | 'recent' | 'archived';
  /** Filter change handler */
  onFilterChange: (status: 'all' | 'recent' | 'archived') => void;
  /** New project button click handler */
  onNewProject: () => void;
  /** Total project count */
  projectCount: number;
}

/**
 * DashboardHeader Component
 *
 * Header bar for the dashboard with search, filters, and actions.
 *
 * Features:
 * - Search input for filtering projects
 * - Sort dropdown (by name, date, cost)
 * - Filter tabs (all, recent, archived)
 * - New project button
 * - Project count display
 * - Responsive layout
 *
 * Usage:
 * ```tsx
 * <DashboardHeader
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   sortBy={sortBy}
 *   onSortChange={setSortBy}
 *   filterStatus={filterStatus}
 *   onFilterChange={setFilterStatus}
 *   onNewProject={handleNewProject}
 *   projectCount={projects.length}
 * />
 * ```
 */
export function DashboardHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterStatus,
  onFilterChange,
  onNewProject,
  projectCount,
}: DashboardHeaderProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Main header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title and count */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Projects
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {projectCount} {projectCount === 1 ? 'project' : 'projects'} total
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* New Project Button */}
            <button
              onClick={onNewProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search projects by name or file..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[140px]"
            >
              <SortAsc className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Sort: {sortBy === 'name' ? 'Name' : sortBy === 'date' ? 'Date' : 'Cost'}
              </span>
            </button>

            {/* Sort menu */}
            {showSortMenu && (
              <div className="absolute top-full mt-1 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    onSortChange('name');
                    setShowSortMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg ${
                    sortBy === 'name' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => {
                    onSortChange('date');
                    setShowSortMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    sortBy === 'date' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  Date Modified
                </button>
                <button
                  onClick={() => {
                    onSortChange('cost');
                    setShowSortMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors last:rounded-b-lg ${
                    sortBy === 'cost' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  Cost
                </button>
              </div>
            )}
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[140px]"
            >
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {filterStatus === 'all' ? 'All' : filterStatus === 'recent' ? 'Recent' : 'Archived'}
              </span>
            </button>

            {/* Filter menu */}
            {showFilterMenu && (
              <div className="absolute top-full mt-1 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    onFilterChange('all');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg ${
                    filterStatus === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  All Projects
                </button>
                <button
                  onClick={() => {
                    onFilterChange('recent');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors last:rounded-b-lg ${
                    filterStatus === 'recent' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  Recent
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close menus when clicking outside */}
      {(showSortMenu || showFilterMenu) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowSortMenu(false);
            setShowFilterMenu(false);
          }}
        />
      )}
    </div>
  );
}
