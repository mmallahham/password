import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import logo from './password.png';
import { EditLogin } from './components/EditLogin'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Logins } from './components/Logins'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
      <div className="App-header">
        <Segment style={{ padding: '1em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle" horizantalAlign="middle">
            <Grid.Row>
              <Grid.Column width={7}></Grid.Column>
              <Grid.Column width={2}><img src={logo} className="App-logo" alt="logo" /></Grid.Column>
              <Grid.Column width={7}></Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={6}></Grid.Column>
              <Grid.Column width={4}><h1>Password Manager</h1></Grid.Column>
              <Grid.Column width={6}></Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}
                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }
    
    return (
      <Switch>
        <Route
          exact
          path="/logins/:loginId/edit"
          render={props => {
            return <EditLogin {...props} auth={this.props.auth} />
          }}
        />
        <Route
          exact
          path="/"
          render={props => {
            return <Logins {...props} auth={this.props.auth} />
          }}
        />

        <Route path="*" component={NotFound} />
      </Switch>
    )
  }
}
