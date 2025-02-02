import React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import * as Users from "../Users";
import { IUser } from "../Users";
import * as Images from "../Images";

import { Card, OverlayTrigger, Popover } from "react-bootstrap";

type MyProps = { setState; user: IUser };
type MyState = {
  contacts: string[];
  contactsList: JSX.Element[];
  newContact: string;
  contactsLoaded: number; //initially is set to 0, if user has no contacts is set to 1, if user has contacts is set to 2 this is to avoid page stutter
  user: IUser;
};

class ContactsView extends React.Component<MyProps, MyState> {
  contactsEnd: HTMLDivElement;
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      contactsList: [],
      newContact: "",
      contactsLoaded: 0,
      user: this.props.user,
    };
    this.addContact = this.addContact.bind(this);
    this.handleChangeNewContact = this.handleChangeNewContact.bind(this);
    this.handleKeyEnter = this.handleKeyEnter.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  gotoConversation(contact: IUser) {
    this.props.setState({
      view: "messages",
      user: this.state.user,
      contact: contact,
    });
  }

  // "Button" to add contacts, when activated it brings up a popover
  // that serves as a form to add a contact from the database
  addContactOverlay(props) {
    return (
      <OverlayTrigger
        rootClose={true}
        trigger="click"
        placement="bottom"
        overlay={this.addContactPopover({
          newContact: props.newContact,
          handleChange: props.handleChange,
          handleKeyEnter: props.handleKeyEnter,
        })}
      >
        <Button className="mx-4" variant="success" onClick={this.scrollToBottom}>
          Add Contact
        </Button>
      </OverlayTrigger>
    );
  }

  // Popover that serves as a form
  addContactPopover(props) {
    return (
      <Popover>
        <Popover.Body>
          <Form>
            <Form.Control
              type="text"
              value={props.newContact}
              placeholder="Contact user name"
              onChange={props.handleChange}
              onKeyDown={props.handleKeyEnter}
            />
          </Form>
        </Popover.Body>
      </Popover>
    );
  }

  //scroll to bottom
  scrollToBottom = () => {
    if(this.state.contactsLoaded == 2) this.contactsEnd.scrollIntoView(); //scrolls to invisible element at the end of the contacts
  };

  componentDidUpdate() {
    this.scrollToBottom();
  }

  // Will construct the interface (the existent contacts)
  async componentDidMount() {
    // this.scrollToBottom();
    const usersWorker: Users.Worker = new Users.Worker();
    const imagesWorker: Images.Worker = new Images.Worker();
    if (this.props.user.contacts === undefined) {
      // user has no contacts
      this.setState({ contactsLoaded: 1 });
      return;
    }
    const contacts: IUser[] = await usersWorker.listContacts(this.props.user);
    if (contacts) {
      this.setState({
        contactsLoaded: 2, // user has contacts
        contactsList: await Promise.all(
          // sends to contactsList all the corresponding HTML for each contact to be shown
          contacts.map(async (contact) => (
            <Card
              key={contact._id}
              className="float-start mx-3 my-3"
              style={{ width: "19rem" }}
            >
              <Card.Img
                className="mx-auto border border-5"
                style={{ borderRadius: "50%", width: "100px", height: "100px" }}
                variant="top"
                src={await imagesWorker.downloadUserImg(contact._id)}
              />
              <Card.Body>
                <Card.Title as="h4">{contact._id}</Card.Title>
                <Card.Text>
                  TODO: this is suposed to be the first message
                </Card.Text>
                <Button
                  className="float-center"
                  variant="primary"
                  onClick={() => this.gotoConversation(contact)}
                >
                  Go to conversation
                </Button>
              </Card.Body>
            </Card>
          ))
        ),
      });
    }
  }

  handleKeyEnter(event) {
    if (event.key === "Enter") {
      this.addContact();
      event.preventDefault();
    }
  }

  // Logs out current user and eliminates remember me through eliminating user "cache"
  async logOut() {
    const usersWorker: Users.Worker = new Users.Worker();
    await usersWorker.unsetRememberUser();
    this.props.setState({
      view: "login",
      user: null,
    });
  }

  // Adds a contact through a series of verifications
  async addContact() {
    const usersWorker: Users.Worker = new Users.Worker();
    const imagesWorker: Images.Worker = new Images.Worker();
    if (this.state.user._id === this.state.newContact) {
      alert("Can not add yourself as a contact");
      return;
    }
    try {
      let newContact: IUser = await usersWorker.getUser(this.state.newContact);
      if (newContact && !this.state.contacts.includes(newContact._id)) {
        // USER EXISTS
        const user = await usersWorker.addContact(
          this.state.user._id,
          newContact._id
        );
        this.setState({
          user: { ...user, userImg: this.props.user.userImg },
          newContact: "",
          contactsLoaded: 2,
          contacts: [...this.state.contacts, newContact._id],
          contactsList: [
            ...this.state.contactsList,
            <Card
              key={this.state.newContact}
              className="float-start mx-3 my-3"
              style={{ width: "19rem" }}
            >
              <Card.Img
                className="mx-auto border border-5"
                style={{ borderRadius: "50%", width: "100px", height: "100px" }}
                variant="top"
                src={await imagesWorker.downloadUserImg(this.state.newContact)}
                alt="avatar"
              />
              <Card.Body>
                <Card.Title as="h4">{this.state.newContact}</Card.Title>
                <Card.Text>
                  TODO: this is suposed to be the first message
                </Card.Text>
                <Button
                  className="float-center"
                  variant="primary"
                  onClick={() => this.gotoConversation(newContact)}
                >
                  Go to conversation
                </Button>
              </Card.Body>
            </Card>,
          ],
        });
      } else {
        alert("user not found or already a contact");
      }
    } catch (e) {
      console.log("add user failed");
      console.log(e);
    }
  }

  handleChangeNewContact(event) {
    this.setState({ newContact: event.target.value });
  }

  // If no contacts are unavailable simply appears the message "No contacts"
  // with logout and add contact buttons
  // Else shows the list of existing contacts and the logout and add contact
  // buttons
  render() {
    if (this.state.contactsLoaded == 0) {
      <></>;
    } else if (this.state.contactsLoaded == 1) {
      return (
        <div className="text-center p-5">
          <>
            <h5>No contacts</h5>
            <br></br>
            {this.addContactOverlay({
              newContact: this.state.newContact,
              handleChange: this.handleChangeNewContact,
              handleKeyEnter: this.handleKeyEnter,
            })}
          </>
          <Button className="mx-4" variant="danger" onClick={this.logOut}>
            LOG OUT
          </Button>
        </div>
      );
    } else {
      return (
        <div className="mx-4 my-4 py-4 border p-2 mb-6">
          <div className="d-flex flex-wrap overflow-hidden justify-content-center">
            {this.state.contactsList}
          </div>
          <div className="d-flex justify-content-center">
            {this.addContactOverlay({
              newContact: this.state.newContact,
              handleChange: this.handleChangeNewContact,
              handleKeyEnter: this.handleKeyEnter,
            })}
            <Button className="mx-4" variant="danger" onClick={this.logOut}>
              LOG OUT
            </Button>
          </div>
          <div
            style={{ float: "left", clear: "both" }}
            ref={(el) => {
              this.contactsEnd = el;
            }}
          ></div>
        </div>
      );
    }
  }
}

export default ContactsView;
