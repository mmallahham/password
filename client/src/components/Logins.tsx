import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createLogin, deleteLogin, getLogins, patchLogin } from '../api/logins-api'
import Auth from '../auth/Auth'
import { Login } from '../types/Login'

interface LoginsProps {
  auth: Auth
  history: History
}

interface LoginsState {
  logins: Login[]
  newLoginName: string
  newDomainName: string
  newPassword: string
  loadingLogins: boolean
}

export class Logins extends React.PureComponent<LoginsProps, LoginsState> {
  state: LoginsState = {
    logins: [],
    newLoginName: '',
    newDomainName: '',
    newPassword: '',
    loadingLogins: true
  }

  handleDomainNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newDomainName: event.target.value })
  }

  handleUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newLoginName: event.target.value })
  }

  handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPassword: event.target.value })
  }

  onEditButtonClick = (loginId: string) => {
    this.props.history.push(`/logins/${loginId}/edit`)
  }

  onLoginCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newLogin = await createLogin(this.props.auth.getIdToken(), {
        domainName: this.state.newLoginName,
        userName: this.state.newLoginName,
        password: this.state.newPassword
      })
      this.setState({
        logins: [...this.state.logins, newLogin],
        newLoginName: ''
      })
    } catch {
      alert('Login creation failed')
    }
  }

  onLoginDelete = async (loginId: string) => {
    try {
      await deleteLogin(this.props.auth.getIdToken(), loginId)
      this.setState({
        logins: this.state.logins.filter(login => login.loginId !== loginId)
      })
    } catch {
      alert('Login deletion failed')
    }
  }

  onLoginCheck = async (pos: number) => {
    try {
      const login = this.state.logins[pos]
      await patchLogin(this.props.auth.getIdToken(), login.loginId, {
        domainName: login.domainName,
        userName: login.userName,
        password: login.password
      })
    } catch {
      alert('Login deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const logins = await getLogins(this.props.auth.getIdToken())
      this.setState({
        logins,
        loadingLogins: false
      })
    } catch (e) {
      alert(`Failed to fetch logins: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Logins</Header>

        {this.renderCreateLoginInput()}

        {this.renderLogins()}
      </div>
    )
  }

  renderCreateLoginInput() {
    return (
      <Grid.Row>
        <Grid.Column width={7}>
          <Input size="big" 
            action={{
              size: "big", 
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onLoginCreate
            }}
            actionPosition="left"
            placeholder="Domain or App"
            onChange={this.handleDomainNameChange}
          />
          <Input size="big" 
            actionPosition="left"
            placeholder="User Name"
            onChange={this.handleUserNameChange}
          />
 
          <Input size="big" 
            actionPosition="left"
            placeholder="Password"
            onChange={this.handlePasswordChange}
          />
        </Grid.Column> 

      <Grid.Column width={16}>
        <Divider />
      </Grid.Column>
    </Grid.Row>
    )
  }

  renderLogins() {
    if (this.state.loadingLogins) {
      return this.renderLoading()
    }

    return this.renderLoginsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading logins
        </Loader>
      </Grid.Row>
    )
  }

  renderLoginsList() {
    return (
      <Grid padded>
        {this.state.logins.map((login, pos) => {
          let showImage = this.doesFileExist(String(login.attachmentUrl));
          console.log(showImage);
          
          return (
            <Grid.Row key={login.loginId}>
              <Grid.Column width={3} verticalAlign="middle">
              {showImage && (
                <Image src={login.attachmentUrl} size="small" wrapped />
              )}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {login.domainName}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {login.userName}
              </Grid.Column>
              <Grid.Column width={3} floated="right" verticalAlign="middle">
                {login.password}
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(login.loginId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onLoginDelete(login.loginId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
  
  doesFileExist(urlToFile: string) {
    var xhr = new XMLHttpRequest();
    try {
      xhr.open('Head', urlToFile, true);
      xhr.send();
    } catch($e) {
      return false
    }
    if (xhr.status >= 400) {
      return false;
    }
    return true;
  }
}
