import logo from './logo.svg';
import './App.css';
import Document from './Document'
import UserDocuments from './UserDocuments'

import {useRef, useEffect, useState} from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


const URL = 'ws://react-video-demo-backend.herokuapp.com'
let ws = new WebSocket(URL)

ws.onopen = () => {
// on connecting, do nothing but log it to the console
console.log("new connection")
}


 function mediaTime(video) {
   alert(Math.floor(video.current.currentTime * 100) / 100)
 }

function App() {
  const video = useRef(null);
  const [newPost, setNewPost] = useState([])

  const [items, setItems] = useState()
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
  fetch("https://react-video-demo-backend.herokuapp.com/documents")
    .then(res => res.json())
    .then(
      (result) => {
          setItems(result.results);
          setIsLoaded(true);
        },
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    )
  }, [])

  let demoDocuments
  if (items) {demoDocuments = items.map(
    item => <li><Link to={`/document/${item.DocumentID}`}>{item.DocumentName}</Link></li>
  )}
  else {demoDocuments = <div>loading...</div>}

  return (
    <div className="App">
    <header>
      <Link to={"/"}>HOME</Link>
    </header>
    <Switch>

      <Route path="/document/:id">
        <Document />
      </Route>


      <Route path="/">
        <ul>{demoDocuments}</ul>
        <b>About</b>
        <p>This is a demo of the react website I am working on for sharing and commenting on videos. Click the above links to test out comments, timestamps and sharing.</p>
        <p>This is just a demo so anyone can currently edit/delete comments. Feel free to try and break it, and please let me know if you do!</p>
        <p>Contact me at <a target="_blank" href="https://chriswesterduin.com/contact">chriswesterduin.com/contact</a> with any queries or recommendations about this project.</p>
      </Route>

    </Switch>
    <footer></footer>
    </div>
  );
}

export default App;
