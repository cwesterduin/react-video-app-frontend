import {useState, useEffect} from 'react'
import commentStyles from "./commentStyles.module.css"
import MyEditor from './MyEditor'

const URL = 'ws://react-video-demo-backend.herokuapp.com'
let ws = new WebSocket(URL)

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function Post(props) {
  const [commentText, setCommentText] = useState()
  const [socketData, setSocketData] = useState()
  const [commentsData, setcommentsData] = useState(props.commentsData)
  const [timestamp, setTimestamp] = useState(undefined)
  const [checked, setChecked] = useState(true)

  function type(e) {
    setCommentText(e.target.value)
  }

  useEffect(() => {
    ws.addEventListener('message', function (event) {
    let data = JSON.parse(event.data)
    });
  },[])

  function postComment() {
    //ensure comment has a sufficient length
    if (!commentText || commentText.length <= 287) {
      alert("too short")
    }
    else {
      //generate a new UUID for message
      const newUuidv4 = uuidv4()
      const posted = new Date().toISOString().slice(0, 19).replace('T', ' ')

      let timestampSeconds
        if (timestamp === undefined || timestamp > new Date(props.mediaFunctions.duration() * 1000).toISOString().substr(11, 8)) {timestampSeconds = -1}
        else {
          let y = timestamp.split(":")
          y[0] = y[0] * 3600; y[1] = y[1] * 60; y[2] = y[2] * 1
          timestampSeconds = y.reduce((a,b) => a + b)
        }
      //set data variable for backend and send to websocket
      const data = {
        Author: 'Anon',
        Comment: commentText,
        Posted: posted,
        ParentUUID: props.CommentUUID,
        DocumentID: props.DocumentID,
        CommentUUID: newUuidv4,
        Timestamp: timestampSeconds,
        childNodes: []
      };
      ws.send(JSON.stringify({
          Author: 'Anon',
          Comment: commentText,
          Posted: posted,
          ParentUUID: props.CommentUUID,
          DocumentID: props.DocumentID,
          CommentUUID: newUuidv4,
          Timestamp: timestampSeconds,
          childNodes: []
        }))
      //post the message data to backend API
      fetch('https://react-video-demo-backend.herokuapp.com/comments', {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
          'Charset': 'utf-8',
        },
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(
        (result) => {console.log(result)}
      )
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    //close the reply box by setting state false
    if (!props.replying && !props.setAddComment) {}
    else if (props.setAddComment) {
    props.setAddComment(false)
    setCommentText('')
    }
    else {props.replying(false)}
    setCommentText('')
    }
  }

  function prepComment() {
    let parsedTimestamp =  new Date(props.mediaFunctions.currentTime() * 1000).toISOString().substr(11, 8)
    if (checked) {
      setTimestamp(parsedTimestamp)
    }
    else {setTimestamp(undefined)}
  }

  useEffect(() => {
    if (checked === false) {setTimestamp(undefined)}
  },[checked])


  return (
  <div class="wrapper">

  <div class="box box1">
    <MyEditor innerHTML={'<div></div>'} setCommentText={setCommentText} replying={props.replying} prepComment={prepComment}/>

  </div>

  <div class="box row">
  <input type="time" step='1' min="00:00:00" max="20:00:00" value={timestamp} onChange={e => setTimestamp(e.target.value)} />
    <input checked={checked} onChange={() => checked ? setChecked(false) : setChecked(true)} type="checkbox"/>
  </div>

  <div class="box row">
    <button className={commentStyles.high_emphasis} onClick={postComment}>submit</button>
  </div>
</div>
  )
}

export default Post
