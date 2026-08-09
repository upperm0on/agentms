import React, { useState } from 'react'
import './TableSelector.css'

const TableSelector = ({ tables, selectedTable, onTableSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [groupByApp, setGroupByApp] = useState(true)

  // Filter tables based on search term
  const filteredTables = tables.filter(table => 
    table.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.verbose_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.app_label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group tables by app if enabled
  const groupedTables = groupByApp 
    ? filteredTables.reduce((groups, table) => {
        const app = table.app_label
        if (!groups[app]) {
          groups[app] = []
        }
        groups[app].push(table)
        return groups
      }, {})
    : { 'All Tables': filteredTables }

  return (
    <div className="table-selector">
      <div className="table-selector-header">
        <h3>Database Tables</h3>
        <div className="table-selector-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <label className="group-toggle">
            <input
              type="checkbox"
              checked={groupByApp}
              onChange={(e) => setGroupByApp(e.target.checked)}
            />
            Group by App
          </label>
        </div>
      </div>

      <div className="table-list">
        {Object.entries(groupedTables).map(([groupName, groupTables]) => (
          <div key={groupName} className="table-group">
            <div className="table-group-header">
              <h4>{groupName}</h4>
              <span className="table-count">({groupTables.length})</span>
            </div>
            <div className="table-group-content">
              {groupTables.map((table) => (
                <div
                  key={`${table.app_label}.${table.model_name}`}
                  className={`table-item ${
                    selectedTable && 
                    selectedTable.app_label === table.app_label && 
                    selectedTable.model_name === table.model_name
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => onTableSelect(table)}
                >
                  <div className="table-item-header">
                    <span className="table-name">{table.verbose_name || table.model_name}</span>
                    <span className="table-label">{table.app_label}</span>
                  </div>
                  <div className="table-item-meta">
                    <span className="table-fields">{table.fields.length} fields</span>
                    <span className="table-type">{table.table_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="no-tables">
          <p>No tables found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default TableSelector
