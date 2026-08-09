import React, { useState } from 'react'
import { Edit2, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react'
import './DataTable.css'

const DataTable = ({
  data,
  fields,
  loading,
  error,
  pagination,
  searchTerm,
  ordering,
  onEdit,
  onDelete,
  onPageChange,
  onSearch,
  onOrdering
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [visibleColumns, setVisibleColumns] = useState(new Set(fields.map(f => f.name)))
  const [showColumnFilter, setShowColumnFilter] = useState(false)
  const [expandedRows, setExpandedRows] = useState(new Set())

  const handleSearchChange = (e) => {
    onSearch(e.target.value)
  }

  const handleSort = (fieldName) => {
    onOrdering(fieldName)
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(data.map(item => item.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (recordId, checked) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(recordId)
    } else {
      newSelected.delete(recordId)
    }
    setSelectedRows(newSelected)
  }

  const handleColumnToggle = (fieldName) => {
    const newVisible = new Set(visibleColumns)
    if (newVisible.has(fieldName)) {
      newVisible.delete(fieldName)
    } else {
      newVisible.add(fieldName)
    }
    setVisibleColumns(newVisible)
  }

  const handleRowExpand = (recordId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId)
    } else {
      newExpanded.add(recordId)
    }
    setExpandedRows(newExpanded)
  }

  const toggleAllColumns = () => {
    if (visibleColumns.size === fields.length) {
      setVisibleColumns(new Set())
    } else {
      setVisibleColumns(new Set(fields.map(f => f.name)))
    }
  }

  const getSortIcon = (fieldName) => {
    if (ordering === fieldName) {
      return '↑'
    } else if (ordering === `-${fieldName}`) {
      return '↓'
    }
    return '↕'
  }

  const handleForeignKeyClick = (field, value) => {
    if (field.is_foreign_key && typeof value === 'object' && value.id) {
      // Navigate to the related record
      const [appLabel, modelName] = field.related_model.split('.')
      window.open(`/database?app=${appLabel}&model=${modelName}&id=${value.id}`, '_blank')
    }
  }

  const formatValue = (value, field, isExpanded = false) => {
    if (value === null || value === undefined) {
      return <span className="null-value">—</span>
    }

    if (typeof value === 'object' && value.id !== undefined) {
      return (
        <span 
          className={`foreign-key-value ${field.is_foreign_key ? 'clickable' : ''}`}
          onClick={() => field.is_foreign_key && handleForeignKeyClick(field, value)}
          title={field.is_foreign_key ? `Click to view ${field.related_model} record` : ''}
        >
          {value.str || `ID: ${value.id}`}
        </span>
      )
    }

    if (Array.isArray(value)) {
      if (isExpanded) {
        return (
          <div className="expanded-array">
            {value.map((item, index) => (
              <div key={index} className="array-item">
                {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
              </div>
            ))}
          </div>
        )
      }
      return (
        <span className="many-to-many-value">
          {value.length} items
        </span>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`boolean-value ${value ? 'true' : 'false'}`}>
          {value ? '✓' : '✗'}
        </span>
      )
    }

    if (typeof value === 'string' && value.length > 50) {
      if (isExpanded) {
        return (
          <div className="expanded-text" title={value}>
            {value}
          </div>
        )
      }
      return (
        <span className="truncated-value" title={value}>
          {value.substring(0, 50)}...
        </span>
      )
    }

    if (typeof value === 'object' && value.url !== undefined) {
      // File field
      if (isExpanded) {
        return (
          <div className="expanded-file">
            <div>URL: {value.url || 'No file'}</div>
            <div>Name: {value.name || 'No name'}</div>
          </div>
        )
      }
      return (
        <span className="file-value">
          {value.name || 'No file'}
        </span>
      )
    }

    return <span className="value">{String(value)}</span>
  }

  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="data-table-error">
        <div className="error-message">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="data-table">
      <div className="data-table-header">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button
            className="btn btn-sm btn-secondary column-filter-btn"
            onClick={() => setShowColumnFilter(!showColumnFilter)}
            title="Toggle column visibility"
          >
            📊 Columns ({visibleColumns.size}/{fields.length})
          </button>
        </div>
        <div className="table-info">
          Showing {data.length} of {pagination.total_count} records
        </div>
      </div>

      {showColumnFilter && (
        <div className="column-filter-panel">
          <div className="column-filter-header">
            <h4>Column Visibility</h4>
            <button
              className="btn btn-sm btn-primary"
              onClick={toggleAllColumns}
            >
              {visibleColumns.size === fields.length ? 'Hide All' : 'Show All'}
            </button>
          </div>
          <div className="column-filter-grid">
            {fields.map((field) => (
              <label key={field.name} className="column-filter-item">
                <input
                  type="checkbox"
                  checked={visibleColumns.has(field.name)}
                  onChange={() => handleColumnToggle(field.name)}
                />
                <span>{field.verbose_name || field.name}</span>
                <small>({field.type})</small>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="data-table-content">
        <table className="table">
          <thead>
            <tr>
              <th className="select-column">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              {fields.filter(field => visibleColumns.has(field.name)).map((field) => (
                <th
                  key={field.name}
                  className={`sortable ${ordering === field.name || ordering === `-${field.name}` ? 'sorted' : ''}`}
                  onClick={() => handleSort(field.name)}
                >
                  <div className="th-content">
                    <span>{field.verbose_name || field.name}</span>
                    <span className="sort-icon">{getSortIcon(field.name)}</span>
                  </div>
                </th>
              ))}
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <React.Fragment key={record.id}>
                <tr className={selectedRows.has(record.id) ? 'selected' : ''}>
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(record.id)}
                      onChange={(e) => handleSelectRow(record.id, e.target.checked)}
                    />
                  </td>
                  {fields.filter(field => visibleColumns.has(field.name)).map((field) => (
                    <td key={field.name} className="data-cell">
                      {formatValue(record[field.name], field, expandedRows.has(record.id))}
                    </td>
                  ))}
                  <td className="actions-column">
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleRowExpand(record.id)}
                        title={expandedRows.has(record.id) ? "Collapse" : "Expand"}
                      >
                        {expandedRows.has(record.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => onEdit(record)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => onDelete(record.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(record.id) && (
                  <tr className="expanded-row">
                    <td colSpan={visibleColumns.size + 2} className="expanded-content">
                      <div className="expanded-details">
                        <h4>Full Record Details</h4>
                        <div className="expanded-grid">
                          {fields.map((field) => (
                            <div key={field.name} className="expanded-field">
                              <strong>{field.verbose_name || field.name}:</strong>
                              <div className="expanded-value">
                                {formatValue(record[field.name], field, true)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="no-data">
          <p>No records found</p>
        </div>
      )}

      <div className="data-table-footer">
        <div className="pagination">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => onPageChange(pagination.current_page - 1)}
            disabled={!pagination.has_previous}
          >
            Previous
          </button>
          
          <div className="page-info">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
          
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => onPageChange(pagination.current_page + 1)}
            disabled={!pagination.has_next}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataTable
