
import * as Bootstrap from 'react-bootstrap';
import moment from 'moment';
import React from 'react';

import { capitaliseFirstLetter } from './common.js';

const navItems = [
  { index: 0, name: 'All Email' },
  { index: 1, name: 'B00235610@studentmail.uws.ac.uk' },
  { index: 2, name: 'wi11berto@yahoo.co.uk' }
];

export class Loading extends React.Component {
  render() {
    return (
      <div className="sk-cube-grid">
        <div className="sk-cube sk-cube1"></div>
        <div className="sk-cube sk-cube2"></div>
        <div className="sk-cube sk-cube3"></div>
        <div className="sk-cube sk-cube4"></div>
        <div className="sk-cube sk-cube5"></div>
        <div className="sk-cube sk-cube6"></div>
        <div className="sk-cube sk-cube7"></div>
        <div className="sk-cube sk-cube8"></div>
        <div className="sk-cube sk-cube9"></div>
      </div>
    );
  }
}

export class AppNavbar extends React.Component {
  constructor() {
    super();
    this.state = { tab: 0 };
  }

  setTab(tab) {
    this.setState({ tab }, () => {
      if(this.props.onTabChange) {
        this.props.onTabChange(navItems[tab]);
      }
    });
  }

  isActive(index) {
    return (this.state.tab == index);
  }

  createNavItemProps(index) {
    return {
      onClick: () => this.setTab(index),
      active: this.isActive(index),
      href: '#'
    }
  }

  download() {
    window.open("mailbox-win32-x64.zip");
  }

  render() {
    return (
      <Bootstrap.Navbar>
        <Bootstrap.Navbar.Header>
          <Bootstrap.Navbar.Brand>
            <a href="#"><span className="glyphicon glyphicon-envelope"></span> {this.props.appName}</a>
          </Bootstrap.Navbar.Brand>
          <Bootstrap.Navbar.Toggle />
        </Bootstrap.Navbar.Header>
        <Bootstrap.Navbar.Collapse>
          <Bootstrap.Nav pullRight>
            <Bootstrap.NavItem {...this.createNavItemProps(0)}>{ navItems[0].name }</Bootstrap.NavItem>
            <Bootstrap.NavItem {...this.createNavItemProps(1)}>{ navItems[1].name }</Bootstrap.NavItem>
            <Bootstrap.NavItem {...this.createNavItemProps(2)}>{ navItems[2].name }</Bootstrap.NavItem>
            {
              showDownload ?
                <Bootstrap.NavItem onClick={() => this.download()}>
                  <span className="glyphicon glyphicon-download-alt"></span>
                </Bootstrap.NavItem> : ''
            }
          </Bootstrap.Nav>
        </Bootstrap.Navbar.Collapse>
      </Bootstrap.Navbar>
    )
  }
}

class Email extends React.Component {
  render() {
    const email = this.props.email;

    return (
      <Bootstrap.Accordion>
        <Bootstrap.Panel eventKey={this.props.index} header={<h5 className="list-group-item-heading">{ email.Subject.S}</h5>}>
          <div>
            <div id="header">
              <p><strong>From: </strong> { JSON.parse(email.From.S).name}</p>
              <p><strong>Email: </strong> { email.Account.S }</p>
              <p><strong>Date: </strong> { moment(Number(email.Datetime.N)).format('MMMM Do YYYY, h:mm:ss a') }</p>
              <p><strong>Priority: </strong> { capitaliseFirstLetter(email.Priority.S) }</p>
            </div>
            <hr />
            <div id="body">
              <p className="email-body">
                {email.Text.S}
              </p>
            </div>
            <div>
              <button onClick={() => this.props.onDelete()}  className='btn btn-sm btn-danger pull-right'>Delete</button>
            </div>
          </div>
        </Bootstrap.Panel>
      </Bootstrap.Accordion>
    )
  }
}

export class EmailView extends React.Component {
  render() {
    const emailComponents = this.props.emails.map((email, index) => {
      return (
        <Email key={`Email${index}`} index={index} email={email} onDelete={() => this.props.onDelete(email)} />
      );
    })

    return (
      <div className="container">
        <div className="row list-group">
            <div ng-repeat="email in controller.emails">
              <div className="col-sm-offset-1 col-sm-10 col-xs-12">
                { emailComponents }
              </div>
            </div>
        </div>
        <div className="row" style={{"marginTop":"25px"}}>
          <div className="col-xs-12">
            <div className="input-group text-center">
              <span className="input-group-btn">
                <button onClick={() => this.props.onReload()} type="button" className="btn btn-primary btn-small">Reload Email</button>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export class Footer extends React.Component {
  render() {
    return (
      <div id="footer">
        <div className="container" style={{"marginTop":"5px"}}>
          <hr />
          <p className="text-muted text-center">Copyright © {this.props.author}</p>
          <hr />
        </div>
      </div>
    )
  }
}
