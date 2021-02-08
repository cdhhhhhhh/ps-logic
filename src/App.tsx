import React from 'react';
import './styles/index.global.scss';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AnalyzerView from './page/AnalyzerView';
import DeviceView from './page/DeviceView';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={DeviceView} />
        <Route path="/AnalyzerView" component={AnalyzerView} />
        <Route path="/DeviceView" component={DeviceView} />
      </Switch>
    </Router>
  );
}
