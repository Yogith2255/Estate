import React from 'react';
import { Search } from 'lucide-react';
import './SearchToolbar.css';

/**
 * Enterprise toolbar for search, filter controls, and view toggles
 * @param {Object} props
 * @param {string} props.searchValue
 * @param {Function} props.onSearchChange
 * @param {string} [props.searchPlaceholder]
 * @param {React.ReactNode} [props.filters]
 * @param {React.ReactNode} [props.actions]
 */
export default function SearchToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = null,
  actions = null,
}) {
  return (
    <div className="search-toolbar">
      <div className="search-toolbar__left">
        <div className="search-toolbar__search">
          <Search size={15} className="search-toolbar__search-icon" />
          <input
            type="text"
            className="search-toolbar__input"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {filters && <div className="search-toolbar__filters">{filters}</div>}
      </div>

      {actions && <div className="search-toolbar__actions">{actions}</div>}
    </div>
  );
}
