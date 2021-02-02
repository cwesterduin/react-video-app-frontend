import {useState, useEffect} from 'react'
import commentStyles from "./commentStyles.module.css"
import MyEditor from './MyEditor'


function EditPost(props) {
  const [commentText, setCommentText] = useState()

  useEffect(() => {
    props.setEditText(commentText)
  },[commentText])

  return (
    <div class="editBox">
    <MyEditor editing={props.editing} innerHTML={props.innerHTML} setCommentText={setCommentText} replying={props.replying} prepComment={null}/>
    </div>
  )
}

export default EditPost
