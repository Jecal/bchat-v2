// imports
import React, { useRef, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import MessageForm from './MessageForm';
import './App.css';

// firebase sdk
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// firebase hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// web app firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  // page toggle
  const [isToggled, setIsToggled] = useState(true);
  const togglePage = () => {
    setIsToggled(!isToggled);
  }

  return (
    <div className="App">

      {/* navbar */}
      <nav className='navbar bg-body-tertiary'>
        <div className='container-lg'>
          <span className='navbar-brand mb-0'><h3>bchat</h3></span>
          <SignOut />
        </div>
      </nav>

      {/* [ternary] signed-in(boolean): if true show chatroom, if false show signin */}
      <div>
        <div className='container-lg align-items-center justify-content-center'>

          {user ? (
            isToggled ? (
              <ChatRoom />
            ) : (
              <MessageForm setIsToggled={setIsToggled} />
            )
          ) : <SignIn />}

        </div>
        {/* button to toggle page */}
        <div>
          {user && (
            <button onClick={togglePage} className={isToggled ? 'btn btn-primary floating-btn' : 'btn btn-danger floating-btn mt-5'}>
              {isToggled ? 'Create a message!' : 'Cancel'}
            </button>)}
        </div>
      </div>

    </div>
  );
}

// sign in component
function SignIn() {
  const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div>
    <div className='alert alert-dark mt-5' role='alert'>
      <h4 className='alert-heading'>Notice</h4>
      <hr></hr>
      <p>yes, you can only sign in with google (atm)</p>
    </div>

    <button onClick={SignInWithGoogle} className="btn btn-success mt-5">Sign In with Google</button>
    </div>
  );
}

// sign out component
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} className='btn btn-danger'>Sign Out</button>
  )
}

// chat room component
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData (query, {idField: 'id'});

  // navigate + message visibility toggle
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    navigate('/create');
    setIsVisible(!isVisible);
  }

  return (

      <div className='container-lg'>

        <Prompt />
        
        <div className={isVisible ? 'visible' : 'hidden'}>
          {/*cards container*/}
          <div className='container mt-5'>
            <div className='row'>
              {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
              <span ref={dummy}></span>
            </div>
          </div>
        </div>

      </div>
  );
}

// chat message component
function ChatMessage(props) {
  const { name, para, uid, photoURL } = props.message;

  const user = auth.currentUser;
    
  if(!user) {
    return;
  }

  return (
    <div className='col-md-4 mb-4 chat-msg'>
      <div className='card'>
        <div className='card-body'>
          <img src={photoURL} className='rounded-circle py-3' style={{maxWidth: '50px'}} alt='profile'></img>
          <div className='p-2'>
            <h4 className='card-title'>{name}</h4>
            <p className='card-text'>{para}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Prompt() {

  return (
    <div className='alert alert-info mt-5' role='alert'>
      <h4 className='alert-heading'>Week 1 Prompt</h4>
      <hr></hr>
      <p>reccomend a game to play</p>
    </div>
  )
}

export default App;