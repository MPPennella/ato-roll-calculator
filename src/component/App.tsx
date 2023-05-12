import React from 'react';
import logo from '../logo.svg';
import './App.css';
import './DieSelectPanel'
import DieSelectPanel from './DieSelectPanel';
import ResultDisplayPanel from './ResultDisplayPanel';

function App() {
  return (
    <div className="App">
      <h1>Aeon Trespass Roll Calculator</h1>
      <ResultDisplayPanel />
      <DieSelectPanel />
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
