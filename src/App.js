import React, { Component } from 'react';
import './App.css';
import WebcamCapture from './webCamCapture'

class App extends Component {
  render() {
    return (
      <div className="App">
        <WebcamCapture/>
      </div>
    );
  }
}

export default App;
