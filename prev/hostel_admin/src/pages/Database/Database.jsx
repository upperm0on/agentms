import React, { useState, useEffect } from 'react'
import { dynamicDbAPI } from '../../services/adminApi'
import TableViewer from '../../components/Database/TableViewer'
import TableSelector from '../../components/Database/TableSelector'
import DatabaseSidebar from '../../components/Layout/DatabaseSidebar'
import { Menu } from 'lucide-react'
import './Database.css'

const Database = () => {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDatabaseSidebar, setShowDatabaseSidebar] = useState(false)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      const response = await dynamicDbAPI.getAllTables()
      if (response.data.success) {
        setTables(response.data.tables)
      } else {
        setError('Failed to load tables')
      }
    } catch (err) {
      setError('Error loading tables: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTableSelect = (table) => {
    setSelectedTable(table)
    setShowDatabaseSidebar(false) // Close sidebar on mobile after selection
  }

  if (loading) {
    return (
      <div className="database-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading database tables...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="database-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadTables} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="database-container">
      <div className="database-header">
        <div className="database-header-content">
          <div className="database-title">
            <h1>Database Management</h1>
            <p>Manage all database tables with full CRUD operations</p>
          </div>
          <button
            className="database-sidebar-toggle"
            onClick={() => setShowDatabaseSidebar(true)}
            title="Open database tables"
          >
            <Menu size={20} />
            <span>Tables</span>
          </button>
        </div>
      </div>

      <div className="database-content">
        <div className="database-main">
          {selectedTable ? (
            <TableViewer
              table={selectedTable}
              onTableChange={loadTables}
            />
          ) : (
            <div className="no-table-selected">
              <h3>Select a table to view and manage its data</h3>
              <p>Choose a table from the sidebar to start managing your database</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowDatabaseSidebar(true)}
              >
                Browse Tables
              </button>
            </div>
          )}
        </div>
      </div>

      <DatabaseSidebar
        isOpen={showDatabaseSidebar}
        onClose={() => setShowDatabaseSidebar(false)}
        onTableSelect={handleTableSelect}
      />
    </div>
  )
}

export default Database
