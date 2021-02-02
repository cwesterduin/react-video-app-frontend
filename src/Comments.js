import {useState, useEffect, useRef, dangerouslySetInnerHTML} from 'react'
import Post from './Post'
import EditPost from './EditPost'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";
import useInterval from './useInterval.js'
import PopupBar from './PopupBar'

import commentStyles from "./commentStyles.module.css"

const URL = 'ws://react-video-demo-backend.herokuapp.com'
let ws = new WebSocket(URL)



const createDataTree = dataset => {
    let hashTable = Object.create(null)
    dataset.forEach( aData => hashTable[aData.CommentUUID] = { ...aData, childNodes : [] } )
    let dataTree = []
    dataset.forEach( aData => {
      if( aData.ParentUUID !== "null" ) hashTable[aData.ParentUUID].childNodes.push(hashTable[aData.CommentUUID])
      else dataTree.push(hashTable[aData.CommentUUID])
    } )
    return dataTree
}

const findInTree = (source, id) => {
    for (let key in source)
    {
        var item = source[key];
        if (item.CommentUUID == id)
            return item;
        if (item.childNodes)
        {
            var subresult = findInTree(item.childNodes, id);
            if (subresult)
                return subresult;
        }
    }
    return null;
}

function Timestamp(props) {

  function timeJump(){
    props.timeJump(props.time)
  }

  return(
    <button className={`${commentStyles.low_emphasis} ${commentStyles.time}`} onClick={timeJump}>{props.time === -1 ? null : new Date(props.time * 1000).toISOString().substr(11, 8)}</button>
  )
}

function Comment(props) {
    let { id } = useParams();
    const commentRef = useRef(null)
    const commenttextRef = useRef(null)
    let [active, setActive] = useState(null)

    function timeJump() {
      props.mediaFunctions.timeJump()
    }

    const [timeActive, setTimeActive] = useState(false)
/* useEffect(() => {
      if (window.location.hash === '#' + props.comment.CommentUUID) {
        commentRef.current.scrollIntoView({
		        block: "start"
	       });
        setActive('border-color:#5ebd63; border-width: .15em')
      }
    },[])

    useInterval(() => {
      console.log(props.mediaFunctions.currentTime())
      if (props.comment.ParentUUID !== 'null') {}
      else {
        if (props.mediaFunctions.currentTime() >= props.comment.Timestamp) {
          setTimeActive(true)
        }
        else if (props.mediaFunctions.currentTime() < props.comment.Timestamp) {
          setTimeActive(false)
        }
      }
    }, 1000)
    */

    useEffect(() => {
          if (window.location.hash === '#' + props.comment.CommentUUID) {
            commentRef.current.scrollIntoView({
    		        block: "start"
    	       });
            setActive('border-color:#5ebd63; border-width: .15em')
          }
        },[])

    useEffect(() => {
      if (timeActive) {
        commentRef.current.scrollIntoView()
      }
    },[timeActive])

    function initEditing() {
      if (editing) {setEditing(false)}
      else {
        setEditing(true)

      }
    }

    function deleteComment() {
      fetch(`https://react-video-demo-backend.herokuapp.com/delete/${props.comment.CommentUUID}`, {
        method: 'PUT', // or 'PUT'
      })
      ws.send(JSON.stringify({
          Delete: true,
          Comment: props.comment.Comment,
          DocumentID: id,
          ParentUUID: props.comment.ParentUUID,
          CommentUUID: props.comment.CommentUUID,
          childNodes: props.comment.childNodes,
          Posted: props.comment.Posted,
          Timestamp: -1
        }));
    }

    function saveEdit() {
      let editTimestampSeconds
              if (editTimestamp === null) {editTimestampSeconds = props.comment.Timestamp}
              else if (editTimestamp > new Date(props.mediaFunctions.duration() * 1000).toISOString().substr(11, 8)) {editTimestampSeconds = -1}
              else {
                let y = editTimestamp.split(":")
                y[0] = y[0] * 3600; y[1] = y[1] * 60; y[2] = y[2] * 1
                editTimestampSeconds = y.reduce((a,b) => a + b)
              }
      let data = {
        Comment: editText,
        Timestamp: editTimestampSeconds,
      };
      ws.send(JSON.stringify({
          Edit: true,
          Comment: editText,
          DocumentID: id,
          ParentUUID: props.comment.ParentUUID,
          CommentUUID: props.comment.CommentUUID,
          Timestamp: editTimestampSeconds,
          childNodes: props.comment.childNodes
        }));
      fetch(`https://react-video-demo-backend.herokuapp.com/edit/${props.comment.CommentUUID}`, {
        method: 'PUT', // or 'PUT'
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
      setEditing(false)
    }

    function cancelEdit() {
      setEditing(false)
    }

    const [editText, setEditText] = useState(props.comment.Comment)
    const [editTimestamp, setEditTimestamp] = useState(null)


    const [replying, setReplying] = useState(false)
    const [editing, setEditing] = useState(false)


/*
    useEffect(() => {
      ws.addEventListener('message', function (event) {
        let data = JSON.parse(event.data)
        console.log(data)
        if(data.DocumentID != id) {}
        else {
          if(data.Edit) {
            window.alert(data.CommentUUID, props.comment.CommentUUID)
            setCommentHTML("message", data)
            setRawCommentHTML(data.Comment.slice(1,data.Comment.length - 1))
          }
          else if(data.Delete && data.CommentUUID == props.comment.CommentUUID ) {
            setDeleted(true)
          }
          else{}
        };
      })
    },[])
  */

    if (props.comment.Comment === 'deleted' || props.comment.Deleted === true) {
      return (
        <div className="Comment" id={props.comment.CommentUUID} ref={commentRef}>
        <div className={commentStyles.main_cont} Style="text-align:center"><small>comment deleted</small></div>

        {props.comment.childNodes.length > 0 && props.comment.childNodes.map(function(child) {
          return <Comment mockPopup={props.mockPopup} mediaFunctions={props.mediaFunctions} key={child.ID} comment={child}/>
      })}
        </div>
      )
    }
    else {
    return (
      <div ref={commentRef} scrollTo={props.scrollTo} id={props.comment.CommentUUID} className="Comment">
      <div tabindex={0} Style={active} className={commentStyles.main_cont}>

        <div className={commentStyles.top_cont}>
          <div className={commentStyles.top_upper}>
            <div className={commentStyles.author}>{props.comment.Author ? props.comment.Author : 'Anon'}</div>
            <div>
              {editing ?
                <>
                <button onClick={saveEdit} className={commentStyles.medium_emphasis}>save</button>
                <button onClick={cancelEdit} className={commentStyles.medium_emphasis}>cancel</button>
                </>
                :
                <button onClick={initEditing} className={commentStyles.medium_emphasis}>edit</button>
              }
              <button onClick={deleteComment} Style="margin-left: .25em" className={commentStyles.medium_emphasis}>delete</button>
            </div>
          </div>
          {editing ?
            <div className={`${commentStyles.low_emphasis} ${commentStyles.time}`} Style="max-width:content-min">
              <input type="time" value={editTimestamp ? editTimestamp : new Date(props.comment.Timestamp * 1000).toISOString().substr(11, 8)} step='1' min="00:00:00" max="20:00:00" onChange={e => setEditTimestamp(e.target.value)}/>
            </div>
          :
          props.comment.Timestamp === -1 ? null
          :
          <Timestamp timeJump={(time) => props.mediaFunctions.timeJump(time)} time={props.comment.Timestamp}/>
        }
        </div>
        {editing ?
        <EditPost editing={editing} setEditText={setEditText} innerHTML={props.comment.Comment} CommentUUID={props.comment.CommentUUID} DocumentID={id} />
        :
        <div className={commentStyles.text}><div dangerouslySetInnerHTML={{__html: props.comment.Comment}}></div></div>
        }
        <div className={commentStyles.bottom_cont}>
          <div className={commentStyles.date}>{props.comment.Posted.replace(/(T|Z$)/g," ").trim()}</div>
        <div>
          <button className={`${commentStyles.low_emphasis} ${commentStyles.share}`} onClick={() => props.mockPopup(`localhost:3000/document/${props.comment.DocumentID}?t=${props.comment.Timestamp}#${props.comment.CommentUUID}`)}>share</button>
          <button className={commentStyles.medium_emphasis} onClick={() => replying ? setReplying(false) : setReplying(true)}>reply</button>
        </div>
        </div>

          {replying ?
          <Post mediaFunctions={props.mediaFunctions} replying={() => setReplying()} commentsData={props.commentsData} CommentUUID={props.comment.CommentUUID} DocumentID={id}/>
          :
          null
          }

      </div>

        {props.comment.childNodes.length > 0 && props.comment.childNodes.map(function(child) {
          return <Comment mockPopup={props.mockPopup} mediaFunctions={props.mediaFunctions} key={child.ID} comment={child}/>
      })}
    </div>

  )
}
}

function CommentList(props) {

  let { id } = useParams();

  const [commentsData, setCommentsData] = useState(createDataTree(props.items))
  const [comments, setComments] = useState(createDataTree(props.items).map(comment =>
  <Comment mockPopup={mockPopup} scrollTo={props.scrollTo} mediaFunctions={props.mediaFunctions} commentsData={commentsData} comment={comment}/>)
  )
  const [newMessage, setNewMessage] = useState(null)
  const [editMessage, setEditMessage] = useState(null)
  const [deleteMessage, setDeleteMessage] = useState(null)

  useEffect(() => {
    setComments(createDataTree(props.items).map(comment =>
    <Comment mockPopup={mockPopup} scrollTo={props.scrollTo} mediaFunctions={props.mediaFunctions} commentsData={commentsData} comment={comment}/>)
    )
  },[props.items])


  useEffect(() => {
    ws.addEventListener('message', function (event) {
      let data = JSON.parse(event.data)
      if (data.DocumentID == id) {
        if (data.Edit) {
          setEditMessage(data)
        }
        else if (data.Delete) {
          setDeleteMessage(data)
        }
        else {
          setNewMessage(data)
      }
    }
    else {}
    })
  },[])

  useEffect(() => {
    if (!newMessage) {}
    else {
      console.log(newMessage);
      if (newMessage.ParentUUID === null || newMessage.ParentUUID === 0) {
        let updateComments = [newMessage, ...commentsData]
        setCommentsData(updateComments)
        setComments(updateComments.map(comment =>
        <Comment mockPopup={mockPopup} scrollTo={props.scrollTo} mediaFunctions={props.mediaFunctions} commentsData={commentsData} comment={comment}/>))
      }
      else {
        let shadowCommentsData = commentsData
        let shadowResult = findInTree(shadowCommentsData, newMessage.ParentUUID)
        shadowResult.childNodes = [...shadowResult.childNodes, newMessage]
        setCommentsData(shadowCommentsData)
        setComments(shadowCommentsData.map(comment =>
        <Comment mockPopup={mockPopup} scrollTo={props.scrollTo} mediaFunctions={props.mediaFunctions} commentsData={commentsData} comment={comment}/>))
      }
    }
  },[newMessage])

  useEffect(() => {
    if (!editMessage) {}
    else {
      let shadowCommentsData = commentsData
      let x = findInTree(shadowCommentsData, editMessage.CommentUUID)
      x.Comment = editMessage.Comment
      x.Timestamp = editMessage.Timestamp
      setCommentsData(shadowCommentsData)
      setComments(shadowCommentsData.map(comment =>
      <Comment mockPopup={mockPopup} scrollTo={props.scrollTo} mediaFunctions={props.mediaFunctions} commentsData={commentsData} comment={comment}/>))
    }
  },[editMessage])

  useEffect(() => {
    if (!deleteMessage) {}
    else {
      let shadowCommentsData = commentsData
      let x = findInTree(shadowCommentsData, deleteMessage.CommentUUID)
      x.Deleted = true
      setCommentsData(shadowCommentsData)
      setComments(shadowCommentsData.map(comment =>
      <Comment mockPopup={mockPopup} scrollTo={props.scrollTo} mediaFunctions={props.mediaFunctions} commentsData={commentsData} comment={comment}/>))
    }
  },[deleteMessage])



  const [popup, setPopup] = useState(false)
  const [timer, setTimer] = useState(4000)

  function w() {
      setPopup(false)
  }
  var delay;
  function startDelay(){
  	delay = setTimeout(w, 4000);
  }
  function resetDelay(){
  	clearTimeout(delay);
  }
  function mockPopup(str) {
      setPopup(true)
      const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      resetDelay();
      startDelay();
  }



   return (
     <div>
     {popup ? <PopupBar text="link copied!"/> : null}
     {comments}
     </div>
   )
}

function Comments(props) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [pulse, setPulse] = useState()

  const [comment, setComment] = useState()


  useEffect(() => {
  fetch(`https://react-video-demo-backend.herokuapp.com/comments/${props.DocumentID}`)
    .then(res => res.json())
    .then(
      (result) => {
        setItems(result.results
          .sort((a,b) => a.Posted > b.Posted ? -1 : 1)
        )
          ;
        setIsLoaded(true);
      },
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    )
  },[props.DocumentID])

  return (
    isLoaded ?
    <div>
      <CommentList scrollTo={props.scrollTo} mediaFunctions={props.mediaFunctions} isLoaded={isLoaded} items={items}/>
    </div>
    :
    <div>loading...</div>
  )
}

export default Comments
