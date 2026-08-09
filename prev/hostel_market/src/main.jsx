import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { store } from './store'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

// Mock Service Worker disabled - using real backend API
// async function enableMocks() {
//   if (import.meta.env.DEV) {
//     const { worker } = await import('./mocks/browser')
//     await worker.start()
//   }
// }

// enableMocks().finally(() => {
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
// })

