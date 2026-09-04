import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Resources } from './pages/Resources';
import { Bookmarks } from './pages/Bookmarks';
import { AIAssistant } from './pages/AIAssistant';
import { Admin } from './pages/Admin';
import { RoleProvider } from './contexts/RoleContext';

import { Auth } from './pages/Auth';

function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="resources" element={<Resources />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;
