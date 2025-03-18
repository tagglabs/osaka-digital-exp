import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Cms from './Pages/Cms'

function App() {

  return (
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<Home/>} />
    <Route path="/cms" element={<Cms/>} />
  </Routes>
    </BrowserRouter>
  )
}

export default App
