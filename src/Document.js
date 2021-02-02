import logo from './logo.svg';
import './App.css';
import Post from './Post'
import Comments from './Comments'
import {useRef, useEffect, useState} from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";
import ReactPlayer from 'react-player'
import useInterval from './useInterval.js'

import commentStyles from './commentStyles.module.css'


function Document() {
  const video = useRef(null);
  const [newPost, setNewPost] = useState([])

  let { id } = useParams();
  let t = window.location.search

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState();

  const [playing, setPlaying] = useState(false)

  const [duration, setDuration] = useState(0)

  const mediaFunctions = {
  timeJump: function timeJump(time) {
    video.current.seekTo(time)
  },
  currentTime: function currentTime() {
    return video.current.getCurrentTime()
  },
  duration: function duration() {
    return video.current.getDuration()
  },
  }

  useEffect(() => {
  fetch("https://react-video-demo-backend.herokuapp.com/documents")
    .then(res => res.json())
    .then(
      (result) => {
        if (result.results.filter(document => document.DocumentID == id).length === 0) {
          setItems(null);
          setIsLoaded(true);
        }
        else {
          setItems(result.results.filter(document => document.DocumentID == id));
          setIsLoaded(true);
        }

      },
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    )
  }, [id])

useEffect(() => {
  if (video.current === null) {}
  else {setDuration(video.current.duration)}
},[items])

useEffect(() => {
  if (video.current && window.location.search) {
    setTimeout(() => {
     video.current.seekTo(t.slice(3))
  },1000)}
},[isLoaded])

//states for comment functions
const [addComment, setAddComment] = useState(false)

  return (
    isLoaded && items === null ?
    <div>404</div>
    :
    isLoaded && items !== null ?
    <>
    <div>{items[0].DocumentName}</div>
    <div Style="width:100%; display:flex; position:relative; margin-top: 1em">

      <div Style="position:sticky; top:0; width:50%; padding-top: 0; height:calc(100vh - 2em); resize: horizontal; background:black; display:flex; justify-content: center; align-items:center">
        <ReactPlayer ref={video} Style="width:100%;height:100%" url={`${items[0].DocumentFileUrl}`} controls/>
      </div>

      <div Style="flex:1;position:relative; padding: 0; padding-top: 0; display:flex; flex-direction:column; border: solid 1px #ddd">
        <div Style="box-shadow: 0 1px 2px -2px rgba(0,0,0,0.2); background:white; width: 100%;position:sticky; align-self: flex-start; top:0; z-index: 9999; padding: .5em 1em; margin-bottom: .25em;  border-bottom: solid 1px #ddd">
          <button onClick={() => addComment ? setAddComment(false) : setAddComment(true)} className={commentStyles.medium_emphasis}>+ comment</button>
          {addComment ?
          <Post mediaFunctions={mediaFunctions} setAddComment={setAddComment} CommentUUID={null} DocumentID={id}/>
          :
          null
          }
        </div>
        <div className="commentBox" Style="flex:1; padding: 0 1em">
          <Comments mediaFunctions={mediaFunctions} video={video} DocumentID={id}/>
        </div>
      </div>

    </div>
    </>
    :
    <div>loading...</div>

  )
}

export default Document
