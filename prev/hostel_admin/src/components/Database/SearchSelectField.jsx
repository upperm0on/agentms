import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import './SearchSelectField.css'

const SearchSelectField = ({
  value,
  onChange,
  options = [],
  loading = false,
  placeholder = "Search and select...",
  displayField = "str",
  valueField = "id",
  searchField = "str",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)


  useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find(option => option[valueField] === value)
      setSelectedOption(found || null)
    } else {
      setSelectedOption(null)
    }
  }, [value, options, valueField])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = useMemo(() => {
    if (searchInput) {
      return options.filter(option =>
        option[searchField]?.toLowerCase().includes(searchInput.toLowerCase())
      )
    }
    return options
  }, [searchInput, options, searchField])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const handleSelect = (option) => {
    setSelectedOption(option)
    onChange(option[valueField])
    setIsOpen(false)
    setSearchInput('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSelectedOption(null)
    onChange(null)
    setSearchInput('')
  }

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
  }

  const getDisplayValue = () => {
    if (selectedOption) {
      return selectedOption[displayField] || `ID: ${selectedOption[valueField]}`
    }
    return ''
  }

  return (
    <div className={`search-select-field ${className} ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      <div 
        className={`search-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
      >
        <div className="search-select-value">
          {selectedOption ? (
            <span className="selected-text">{getDisplayValue()}</span>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>
        <div className="search-select-actions">
          {selectedOption && !disabled && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <div className="dropdown-icon">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="search-select-dropdown">
          <div className="search-select-search">
            <Search size={16} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search options..."
              value={searchInput}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="search-select-options">
            {loading ? (
              <div className="search-select-loading">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Loading options...</span>
                </div>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option[valueField] || index}
                  className={`search-select-option ${
                    selectedOption?.[valueField] === option[valueField] ? 'selected' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="option-content">
                    <span className="option-text">{option[displayField] || `ID: ${option[valueField]}`}</span>
                    {option[valueField] && (
                      <span className="option-id">ID: {option[valueField]}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="search-select-empty">
                <p>No options found</p>
                {searchInput && (
                  <p className="search-hint">Try a different search term</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchSelectField
