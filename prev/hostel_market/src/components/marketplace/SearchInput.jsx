import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'
import './SearchInput.css'

/**
 * Reusable search input component with debouncing
 * 
 * @param {object} props
 * @param {string} props.value - Current search value
 * @param {function} props.onChange - Callback when search value changes (receives debounced value)
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounceDelay - Debounce delay in ms (default: 300)
 * @param {boolean} props.loading - Show loading indicator
 * @param {boolean} props.showClearButton - Show clear button when value exists
 * @param {string} props.className - Additional CSS classes
 */
function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceDelay = 300,
  loading = false,
  showClearButton = true,
  className = '',
  ...props
}) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, debounceDelay)
  const inputRef = useRef(null)

  // Notify parent when debounced value changes
  useEffect(() => {
    if (onChange && debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  // Sync local value with prop value
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value)
    }
  }, [value])

  const handleChange = (e) => {
    setLocalValue(e.target.value)
  }

  const handleClear = () => {
    setLocalValue('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
    if (onChange) {
      onChange('')
    }
  }

  const handleKeyDown = (e) => {
    // Escape key clears search
    if (e.key === 'Escape' && localValue) {
      handleClear()
    }
    // Enter key triggers search (if not already debouncing)
    if (e.key === 'Enter' && onChange) {
      onChange(localValue)
    }
  }

  return (
    <div className={`search-input-container ${className}`}>
      <div className="search-input-wrapper">
        <Search 
          size={20} 
          className="search-icon"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Search"
          {...props}
        />
        {loading && (
          <Loader2 
            size={18} 
            className="search-loader"
            aria-label="Searching"
          />
        )}
        {showClearButton && localValue && !loading && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchInput


