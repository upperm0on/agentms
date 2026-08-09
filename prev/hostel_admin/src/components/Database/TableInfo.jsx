import React, { useState } from 'react'
import './TableInfo.css'

const TableInfo = ({ structure }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!structure) {
    return null
  }

  const getFieldTypeIcon = (field) => {
    if (field.is_foreign_key) {
      return '🔗'
    }
    if (field.is_many_to_many) {
      return '🔗🔗'
    }
    if (field.type === 'BooleanField') {
      return '✓'
    }
    if (field.type === 'DateTimeField' || field.type === 'DateField') {
      return '📅'
    }
    if (field.type === 'TextField') {
      return '📝'
    }
    if (field.type === 'IntegerField' || field.type === 'DecimalField') {
      return '🔢'
    }
    if (field.type === 'CharField') {
      return '📄'
    }
    if (field.type === 'EmailField') {
      return '📧'
    }
    if (field.type === 'URLField') {
      return '🌐'
    }
    if (field.type === 'ImageField' || field.type === 'FileField') {
      return '📎'
    }
    if (field.type === 'JSONField') {
      return '📋'
    }
    return '📄'
  }

  const getFieldTypeColor = (field) => {
    if (field.is_foreign_key || field.is_many_to_many) {
      return '#007bff'
    }
    if (field.type === 'BooleanField') {
      return '#28a745'
    }
    if (field.type === 'DateTimeField' || field.type === 'DateField') {
      return '#6f42c1'
    }
    if (field.type === 'TextField') {
      return '#fd7e14'
    }
    if (field.type === 'IntegerField' || field.type === 'DecimalField') {
      return '#20c997'
    }
    return '#6c757d'
  }

  return (
    <div className="table-info">
      <div 
        className="table-info-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="table-info-title">
          <h4>Table Structure</h4>
          <span className="field-count">{structure.fields.length} fields</span>
        </div>
        <div className="table-info-toggle">
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="table-info-content">
          <div className="table-meta">
            <div className="meta-item">
              <strong>App:</strong> {structure.app_label}
            </div>
            <div className="meta-item">
              <strong>Model:</strong> {structure.model_name}
            </div>
            <div className="meta-item">
              <strong>Table:</strong> {structure.table_name}
            </div>
          </div>

          <div className="fields-list">
            <h5>Fields</h5>
            <div className="fields-grid">
              {structure.fields.map((field) => (
                <div key={field.name} className="field-item">
                  <div className="field-header">
                    <span className="field-icon">
                      {getFieldTypeIcon(field)}
                    </span>
                    <span className="field-name">{field.name}</span>
                    <span className="field-type" style={{ color: getFieldTypeColor(field) }}>
                      {field.type}
                    </span>
                  </div>
                  
                  <div className="field-details">
                    <div className="field-verbose">
                      {field.verbose_name}
                    </div>
                    
                    <div className="field-constraints">
                      {!field.null && <span className="constraint required">Required</span>}
                      {!field.blank && <span className="constraint not-blank">Not Blank</span>}
                      {field.max_length && (
                        <span className="constraint max-length">
                          Max {field.max_length}
                        </span>
                      )}
                      {field.choices && (
                        <span className="constraint choices">
                          {field.choices.length} choices
                        </span>
                      )}
                    </div>
                    
                    {field.help_text && (
                      <div className="field-help">
                        {field.help_text}
                      </div>
                    )}
                    
                    {field.related_model && (
                      <div className="field-relation">
                        → {field.related_model}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableInfo
