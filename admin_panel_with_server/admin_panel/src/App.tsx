import { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import homepage from './pages/homepage';
import Students from './pages/students';
import GoogleForms from './pages/googleforms';
import AdminPanelLayout from './layout/adminpanel';
import Login from './pages/login';
import _404page from './pages/_404page';

import { Message } from './states/type';

import './App.css';

/**
 * Main App function
 * 
 * @returns {JSX.Element}
 * @version 1.1.0
 * @since 1.0.0
 */

function App() {
  const [notifications, getNotificatoins] = useState<Message | null>(null);

  return (
      <Routes>
        <Route path='/' Component={homepage}/>
        <Route path='/admin-login' Component={Login} />
        <Route element={<AdminPanelLayout notification={notifications} />}>
          <Route path='/admin-panel' element={<Students collectNotifications={getNotificatoins} />} />
          <Route path='/admin-panel/student' element={<Students collectNotifications={getNotificatoins} />} />
          <Route path='/admin-panel/googleform' element={<GoogleForms collectNotifications={getNotificatoins} />} />
        </Route>
        <Route path='*' Component={_404page} />
      </Routes>
  );
}

export default App;
