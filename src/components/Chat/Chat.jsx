import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button, message as systemMessage } from 'antd';
import { BASE_URL } from '../../constants';
import queries from '../../serverQueries';
import {
  ChatContainer,
  Header,
  CloseButton,
  Main,
  UserListTitle,
  OnlineLED,
  UserList,
  User,
  UserLink,
  MessageList,
  Message,
  EventMessage,
  MessageAvatar,
  MessageAuthor,
  MessageImage,
  MessageDate,
  MessageText,
  ScrollToTopButton,
  Arrow,
  Form,
  Footer,
} from './styled';

const url = BASE_URL;

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { message: '', file: null, filePath: '', replyTo: null, hasScrolled: false };
  }

  componentDidMount() {
    this.scrollingWrapper.addEventListener('scroll', this.onScroll);
  }

  handleChangeMessage = event => {
    this.setState({ message: event.target.value });
  };

  handleChangeFile = async event => {
    const { size } = event.target.files[0];
    if (size / 1024 / 1024 > 20) {
      systemMessage.error('Отправляемый файл не может быть больше 20 Мб');
      return;
    }
    this.setState({ filePath: event.target.value });
  };

  uploadFile = async () => {
    const { filePath } = this.state;
    if (!filePath) return;

    const form = document.querySelector('.message-form');
    const formData = new FormData(form);
    const file = await queries.postFile(formData);
    this.setState({ file });
  };

  resetForm = () => {
    this.setState({ message: '', file: null, filePath: '' });
  };

  handleSubmit = async event => {
    event.preventDefault();
    await this.uploadFile();
    const { sendMessage } = this.props;
    const { message, file, replyTo } = this.state;
    sendMessage(message, file, replyTo);
    this.resetForm();
  };

  handleShowFull = () => {
    const { getMessages } = this.props;
    getMessages(true);
    this.scrollingWrapper.scrollTop = 0;
  };

  drawMessage = msg => {
    const { user } = this.props;
    if (msg.type === 'MESSAGE') {
      // const urlAvatar = msg.senderAvatar === null ? default : `${msg.senderAvatar}`;
      return (
        <Message toMe={user.nickName === msg.replyTo} key={msg.id}>
          <MessageAvatar
            alt="avatar"
            src={`${url}img/${msg.senderAvatar}`}
            onClick={() => this.setState({ replyTo: msg.sender, message: `${msg.sender}, ` })}
          />
          <div>
            <MessageAuthor>{msg.sender}</MessageAuthor>
            {msg.originalImg ? (
              <a
                rel="noopener noreferrer"
                href={`${url}img/chat/${msg.originalImg}`}
                target="_blank"
              >
                <MessageImage
                  alt="picture"
                  className="message-image"
                  src={`${url}img/chat/${msg.thumbnailImg}`}
                />
              </a>
            ) : (
              ''
            )}
            {msg.filePath ? (
              <div>
                <a href={`${url}img/chat/${msg.filePath}`} download>
                  {msg.fileName}
                </a>
              </div>
            ) : (
              ''
            )}
            <MessageText className="message-text">{msg.text}</MessageText>
          </div>
          <MessageDate className="message-date">{msg.messageDate}</MessageDate>
        </Message>
      );
    }
    return (
      <EventMessage className="event-message" key={msg.id}>
        {`${msg.sender} ${msg.type === 'LEAVE' ? 'покинул чат' : 'присоединился'}`}
      </EventMessage>
    );
  };

  onScroll = () => {
    const { hasScrolled } = this.state;
    if (this.scrollingWrapper.scrollTop > 100 && !hasScrolled) {
      this.setState({ hasScrolled: true });
    } else if (this.scrollingWrapper.scrollTop < 100 && hasScrolled) {
      this.setState({ hasScrolled: false });
    }
  };

  reference = id => ref => {
    this[id] = ref;
  };

  render() {
    const { handleDisconnect, messages, usersOnline } = this.props;
    const { message, filePath, hasScrolled } = this.state;
    return (
      <section>
        <ChatContainer>
          <Header>
            <h2>Общий чат</h2>
            <CloseButton onClick={handleDisconnect} />
          </Header>
          <Main>
            <div style={{ width: '20%' }}>
              <OnlineLED />
              <UserListTitle>Online:</UserListTitle>
              <UserList>
                {Object.entries(usersOnline).map(user => {
                  const [username, id] = user;
                  return (
                    <User key={user}>
                      <UserLink href={`/profile/${id}`}>{username}</UserLink>
                    </User>
                  );
                })}
              </UserList>
            </div>
            <div style={{ width: '80%' }}>
              <MessageList className="message-list" ref={this.reference('scrollingWrapper')}>
                {hasScrolled && (
                  <ScrollToTopButton onClick={this.handleShowFull}>
                    <Arrow />
                  </ScrollToTopButton>
                )}
                {messages.map(msg => this.drawMessage(msg))}
              </MessageList>
            </div>
          </Main>

          <Form className="message-form" onSubmit={this.handleSubmit}>
            <Input
              type="text"
              placeholder="Введите сообщение..."
              className="message-input"
              value={message}
              onChange={this.handleChangeMessage}
            />
            <Footer>
              <input
                type="file"
                onChange={this.handleChangeFile}
                value={filePath}
                name="file-input"
              />
              <Button type="primary" className="send-button" htmlType="submit">
                Отправить
              </Button>
            </Footer>
          </Form>
        </ChatContainer>
      </section>
    );
  }
}

export default Chat;

Chat.propTypes = {
  sendMessage: PropTypes.func.isRequired,
  getMessages: PropTypes.func.isRequired,
  handleDisconnect: PropTypes.func.isRequired,
  user: PropTypes.shape({
    nickName: PropTypes.string,
  }),
  usersOnline: PropTypes.shape({}),
  messages: PropTypes.arrayOf(PropTypes.object),
};

Chat.defaultProps = {
  user: null,
  usersOnline: {},
  messages: [],
};
