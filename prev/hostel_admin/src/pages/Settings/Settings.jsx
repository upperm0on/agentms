import { useState } from 'react'
import { Settings as SettingsIcon, Save, User, Bell, Shield, Database, Globe } from 'lucide-react'
import './Settings.css'

function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Hostel Management System',
      siteDescription: 'Comprehensive hostel management solution',
      timezone: 'UTC',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingAlerts: true,
      paymentAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      loginAttempts: 5
    },
    system: {
      maintenanceMode: false,
      autoBackup: true,
      backupFrequency: 'daily',
      logLevel: 'info'
    }
  })

  const handleSave = () => {
    console.log('Saving settings:', settings)
    // Here you would typically save to backend
    alert('Settings saved successfully!')
  }

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database }
  ]

  return (
    <div className="settings">
      <div className="settings-header">
        <div className="settings-title">
          <SettingsIcon size={24} />
          <h1>System Settings</h1>
        </div>
        <button className="btn-save" onClick={handleSave}>
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Site Description</label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="GMT">GMT</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select
                  value={settings.general.language}
                  onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                  <span>Email Notifications</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                  />
                  <span>SMS Notifications</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                  />
                  <span>Push Notifications</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.bookingAlerts}
                    onChange={(e) => handleInputChange('notifications', 'bookingAlerts', e.target.checked)}
                  />
                  <span>Booking Alerts</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.paymentAlerts}
                    onChange={(e) => handleInputChange('notifications', 'paymentAlerts', e.target.checked)}
                  />
                  <span>Payment Alerts</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                  <span>Two-Factor Authentication</span>
                </label>
              </div>
              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  min="5"
                  max="120"
                />
              </div>
              <div className="form-group">
                <label>Password Policy</label>
                <select
                  value={settings.security.passwordPolicy}
                  onChange={(e) => handleInputChange('security', 'passwordPolicy', e.target.value)}
                >
                  <option value="weak">Weak</option>
                  <option value="medium">Medium</option>
                  <option value="strong">Strong</option>
                </select>
              </div>
              <div className="form-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.loginAttempts}
                  onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
                  min="3"
                  max="10"
                />
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-section">
              <h2>System Settings</h2>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => handleInputChange('system', 'maintenanceMode', e.target.checked)}
                  />
                  <span>Maintenance Mode</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.system.autoBackup}
                    onChange={(e) => handleInputChange('system', 'autoBackup', e.target.checked)}
                  />
                  <span>Automatic Backup</span>
                </label>
              </div>
              <div className="form-group">
                <label>Backup Frequency</label>
                <select
                  value={settings.system.backupFrequency}
                  onChange={(e) => handleInputChange('system', 'backupFrequency', e.target.value)}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Log Level</label>
                <select
                  value={settings.system.logLevel}
                  onChange={(e) => handleInputChange('system', 'logLevel', e.target.value)}
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings