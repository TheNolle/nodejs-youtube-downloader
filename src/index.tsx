import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.scss'

import App from './App'

if (document.getElementById('appComponent'))
    ReactDOM
        .createRoot(document.getElementById('appComponent') as HTMLDivElement)
        .render(<BrowserRouter><App /></BrowserRouter>)

void React