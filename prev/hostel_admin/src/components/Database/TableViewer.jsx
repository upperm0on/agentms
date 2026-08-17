import React, { useState, useEffect } from 'react'
import { dynamicDbAPI } from '../../services/adminApi'
import DataTable from './DataTable'
import RecordModal from './RecordModal'
import TableInfo from './TableInfo'
import './TableViewer.css'

const TableViewer = ({ table, onTableChange }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_previous: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [ordering, setOrdering] = useState('id')
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [tableStructure, setTableStructure] = useState(null)

  useEffect(() => {
    if (table) {
      loadTableStructure()
      loadData()
    }
  }, [table])

  useEffect(() => {
    if (table) {
      loadData()
    }
  }, [pagination.current_page, searchTerm, ordering])

  const loadTableStructure = async () => {
    try {
      const response = await dynamicDbAPI.getTableStructure(table.app_label, table.model_name)
      if (response.data.success) {
        setTableStructure(response.data.model_info)
      }
    } catch (err) {
      console.error('Error loading table structure:', err)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: pagination.current_page,
        page_size: 20,
        search: searchTerm,
        ordering: ordering
      }
      
      const response = await dynamicDbAPI.getTableData(table.app_label, table.model_name, params)
      
      if (response.data.success) {
        setData(response.data.data)
        setPagination(response.data.pagination)
      } else {
        setError('Failed to load data')
      }
    } catch (err) {
      setError('Error loading data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRecord(null)
    setShowModal(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setShowModal(true)
  }

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      const response = await dynamicDbAPI.deleteRecord(table.app_label, table.model_name, recordId)
      if (response.data.success) {
        loadData()
        onTableChange && onTableChange()
      } else {
        setError('Failed to delete record')
      }
    } catch (err) {
      setError('Error deleting record: ' + err.message)
    }
  }

  const handleModalSave = async (recordData) => {
    try {
      if (editingRecord) {
        // Update existing record
        const response = await dynamicDbAPI.updateRecord(
          table.app_label, 
          table.model_name, 
          editingRecord.id, 
          recordData
        )
        if (response.data.success) {
          loadData()
          onTableChange && onTableChange()
        } else {
          setError('Failed to update record')
        }
      } else {
        // Create new record
        const response = await dynamicDbAPI.createRecord(
          table.app_label, 
          table.model_name, 
          recordData
        )
        if (response.data.success) {
          loadData()
          onTableChange && onTableChange()
        } else {
          setError('Failed to create record')
        }
      }
      setShowModal(false)
    } catch (err) {
      setError('Error saving record: ' + err.message)
    }
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }))
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handleOrdering = (field) => {
    const newOrdering = ordering === field ? `-${field}` : field
    setOrdering(newOrdering)
  }

  if (!table) {
    return null
  }

  return (
    <div className="table-viewer">
      <div className="table-viewer-header">
        <div className="table-title">
          <h2>{table.verbose_name || table.model_name}</h2>
          <span className="table-subtitle">
            {table.app_label} • {pagination.total_count} records
          </span>
        </div>
        <div className="table-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreate}
          >
            Add Record
          </button>
          <button 
            className="btn btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {tableStructure && (
        <TableInfo structure={tableStructure} />
      )}

      <div className="table-viewer-content">
        <DataTable
          data={data}
          fields={table.fields}
          loading={loading}
          error={error}
          pagination={pagination}
          searchTerm={searchTerm}
          ordering={ordering}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onOrdering={handleOrdering}
        />
      </div>

      {showModal && (
        <RecordModal
          table={table}
          structure={tableStructure}
          record={editingRecord}
          onSave={handleModalSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default TableViewer
