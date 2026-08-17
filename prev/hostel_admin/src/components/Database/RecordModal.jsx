import React, { useState, useEffect } from 'react'
import SearchSelectField from './SearchSelectField'
import { dynamicDbAPI } from '../../services/adminApi'
import './RecordModal.css'

const RecordModal = ({ table, structure, record, onSave, onClose }) => {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [foreignKeyOptions, setForeignKeyOptions] = useState({})
  const [loadingOptions, setLoadingOptions] = useState({})

  useEffect(() => {
    if (record) {
      // Editing existing record
      const initialData = {}
      structure.fields.forEach(field => {
        const value = record[field.name]
        if (value && typeof value === 'object' && value.id) {
          initialData[field.name] = value.id
        } else {
          initialData[field.name] = value || ''
        }
      })
      setFormData(initialData)
    } else {
      // Creating new record
      const initialData = {}
      structure.fields.forEach(field => {
        if (field.default !== undefined && field.default !== null) {
          initialData[field.name] = field.default
        } else if (field.null || field.blank) {
          initialData[field.name] = ''
        } else {
          initialData[field.name] = getDefaultValue(field)
        }
      })
      setFormData(initialData)
    }
  }, [record, structure])

  const getDefaultValue = (field) => {
    if (field.is_foreign_key) {
      return ''
    }
    if (field.type === 'BooleanField') {
      return false
    }
    if (field.type === 'IntegerField' || field.type === 'DecimalField') {
      return 0
    }
    return ''
  }

  const loadForeignKeyOptions = async (field) => {
    if (!field.related_model || foreignKeyOptions[field.name]) {
      return
    }

    setLoadingOptions(prev => ({ ...prev, [field.name]: true }))
    
    try {
      const [appLabel, modelName] = field.related_model.split('.')
      const response = await dynamicDbAPI.getTableData(appLabel, modelName, { page_size: 1000 })
      
      if (response.data.success) {
        const options = response.data.data.map(item => ({
          id: item.id,
          str: item.name || item.title || item.username || `ID: ${item.id}`,
          ...item
        }))
        
        setForeignKeyOptions(prev => ({
          ...prev,
          [field.name]: options
        }))
      }
    } catch (error) {
      console.error(`Error loading options for ${field.name}:`, error)
    } finally {
      setLoadingOptions(prev => ({ ...prev, [field.name]: false }))
    }
  }

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    structure.fields.forEach(field => {
      const value = formData[field.name]
      
      // Required field validation
      if (!field.null && !field.blank && (value === '' || value === null || value === undefined)) {
        newErrors[field.name] = `${field.verbose_name || field.name} is required`
      }
      
      // Foreign key validation
      if (field.is_foreign_key && value && isNaN(parseInt(value))) {
        newErrors[field.name] = `${field.verbose_name || field.name} must be a valid ID`
      }
      
      // Max length validation
      if (field.max_length && value && value.length > field.max_length) {
        newErrors[field.name] = `${field.verbose_name || field.name} must be ${field.max_length} characters or less`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      // Prepare data for submission
      const submitData = {}
      structure.fields.forEach(field => {
        const value = formData[field.name]
        
        if (field.is_foreign_key && value) {
          submitData[field.name] = parseInt(value)
        } else if (field.type === 'BooleanField') {
          submitData[field.name] = Boolean(value)
        } else if (field.type === 'IntegerField') {
          submitData[field.name] = value ? parseInt(value) : null
        } else if (field.type === 'DecimalField') {
          submitData[field.name] = value ? parseFloat(value) : null
        } else if (value === '') {
          submitData[field.name] = null
        } else {
          submitData[field.name] = value
        }
      })
      
      await onSave(submitData)
    } catch (err) {
      console.error('Error saving record:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field) => {
    const value = formData[field.name] || ''
    const hasError = errors[field.name]
    
    if (field.is_foreign_key) {
      // Load options when field is rendered
      if (!foreignKeyOptions[field.name] && !loadingOptions[field.name]) {
        loadForeignKeyOptions(field)
      }

      return (
        <div key={field.name} className="form-group">
          <label className="form-label">
            {field.verbose_name || field.name}
            {!field.null && !field.blank && <span className="required">*</span>}
          </label>
          <SearchSelectField
            value={value}
            onChange={(selectedId) => handleInputChange(field.name, selectedId)}
            options={foreignKeyOptions[field.name] || []}
            loading={loadingOptions[field.name]}
            placeholder={`Select ${field.related_model}...`}
            displayField="str"
            valueField="id"
            searchField="str"
            className={hasError ? 'error' : ''}
          />
          {hasError && <span className="error-message">{hasError}</span>}
          <small className="form-help">
            Foreign key to {field.related_model}
          </small>
        </div>
      )
    }
    
    if (field.type === 'BooleanField') {
      return (
        <div key={field.name} className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="form-checkbox"
            />
            {field.verbose_name || field.name}
          </label>
          {hasError && <span className="error-message">{hasError}</span>}
        </div>
      )
    }
    
    if (field.type === 'TextField') {
      return (
        <div key={field.name} className="form-group">
          <label className="form-label">
            {field.verbose_name || field.name}
            {!field.null && !field.blank && <span className="required">*</span>}
          </label>
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`form-textarea ${hasError ? 'error' : ''}`}
            rows={4}
            placeholder={`Enter ${field.verbose_name || field.name}`}
          />
          {hasError && <span className="error-message">{hasError}</span>}
        </div>
      )
    }
    
    if (field.choices) {
      return (
        <div key={field.name} className="form-group">
          <label className="form-label">
            {field.verbose_name || field.name}
            {!field.null && !field.blank && <span className="required">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`form-select ${hasError ? 'error' : ''}`}
          >
            <option value="">Select {field.verbose_name || field.name}</option>
            {field.choices.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {hasError && <span className="error-message">{hasError}</span>}
        </div>
      )
    }
    
    // Default input field
    return (
      <div key={field.name} className="form-group">
        <label className="form-label">
          {field.verbose_name || field.name}
          {!field.null && !field.blank && <span className="required">*</span>}
        </label>
        <input
          type={field.type === 'IntegerField' || field.type === 'DecimalField' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className={`form-input ${hasError ? 'error' : ''}`}
          placeholder={`Enter ${field.verbose_name || field.name}`}
          maxLength={field.max_length}
        />
        {hasError && <span className="error-message">{hasError}</span>}
        {field.help_text && (
          <small className="form-help">{field.help_text}</small>
        )}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {record ? 'Edit' : 'Create'} {table.verbose_name || table.model_name}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-fields">
            {structure.fields.map(renderField)}
          </div>
          
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (record ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecordModal
