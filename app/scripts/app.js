

import { AppNavbar, EmailView, Loading, Footer } from './components.js';
import { endpoint, fetchEmails, deleteEmail } from './common.js';

import ReactDom from 'react-dom';
import React from 'react';

class App extends React.Component {
  constructor() {
    super();
    this.state = { emails: [], loading: true };
    this.storeEmails();
  }

  storeEmails(filter = {}) {
    fetchEmails(filter, emails => {
      this.setState({
        loading: false,
        emails
      });
    })
  }

  deleteEmail(email) {
    const body = {
        accountID: email.UserID.S,
        dateID: email.Datetime.N
    }

    deleteEmail(body, () => this.storeEmails());
  }

  reloadEmails() {
    this.setState({ loading: true }, () => {
      this.storeEmails();
    });
  }

  filterEmails(tab) {
    if(tab.name === 'All Email') {
      this.storeEmails();
    } else {
      this.storeEmails({ email: tab.name });
    }
  }

  render() {
    const emailViewProps = {
      onDelete: email => this.deleteEmail(email),
      onReload: () => this.reloadEmails(),
      emails: this.state.emails.Items
    };

    return (
      <div>
        {
          !this.state.loading ?
            <div>
              <AppNavbar appName='Mailbox' onTabChange={(tab => this.filterEmails(tab))} />
              <EmailView {...emailViewProps} />
              <Footer author='William Taylor' />
            </div> :
            <Loading />
        }
      </div>
    )
  }
}

ReactDom.render(<App />, document.getElementById('app'));
