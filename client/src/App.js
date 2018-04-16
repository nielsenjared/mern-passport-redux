import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import * as actions from './actions';

import Header from './components/Header';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';

class App extends Component {

  componentDidMount() {
    this.props.fetchUser();
  }

  render() {
    return (
      <div className="container">
        <Router>
          <div>
            <Header />
            <Route exact path ="/" component={Landing} />
            <Route exact path ="/dashboard" component={Dashboard} />
          </div>
        </Router>
      </div>
    );
  }
}

export default connect(null, actions)(App);
