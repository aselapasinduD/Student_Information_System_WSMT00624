import { Routes, Route } from 'react-router-dom';

import homepage from './pages/homepage';
import AdminPanel from './pages/admin-panel';
import Login from './pages/login';
import _404page from './pages/_404page';

import './App.css';

function App() {
  return (
      <Routes>
        <Route path='/' Component={homepage}/>
        <Route path='/admin-login' Component={Login} />
        <Route path='/admin-panel' Component={AdminPanel} />
        <Route path='*' Component={_404page} />
      </Routes>
  );
}

export default App;
