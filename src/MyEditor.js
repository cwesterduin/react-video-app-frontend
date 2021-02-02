import React, { useEffect, useState }   from 'react';
import {Editor, EditorState, ContentState, RichUtils, convertFromHTML} from 'draft-js';
import {stateFromHTML} from 'draft-js-import-html';

const MyEditor = (props) => {


  let blocksFromHTML = convertFromHTML(props.innerHTML)
  const content = ContentState.createFromBlockArray(blocksFromHTML)
    const [editorState, setEditorState] = useState(EditorState.createWithContent(content)
              );
     const editor = React.useRef(null);

    const boldText = (e) => {
        // onMouseDown and e.preventDefault because editor losses focus if you use onClick
        e.preventDefault();
        let nextState = RichUtils.toggleInlineStyle(editorState, 'BOLD');
        setEditorState(nextState);
    }
    const underlineText = (e) => {
        // onMouseDown and e.preventDefault because editor losses focus if you use onClick
        e.preventDefault();
        let nextState = RichUtils.toggleInlineStyle(editorState, 'UNDERLINE');
        setEditorState(nextState);
    }


      const currentStyle = editorState.getCurrentInlineStyle();


    useEffect(() => {
      if (props.replying) {
        editor.current.focus()
        props.prepComment()
      }
      else if (props.editing) {
        editor.current.focus()
      }
      else {}
    },[props.replying, props.editing])

    function func(editorState){
      setEditorState(editorState)
      props.setCommentText(editor.current.editor.innerHTML)
    }

    function prepCommentFocusEditor() {
      editor.current.focus()
      if (props.prepComment) {props.prepComment()}
      else {}
    }

    useEffect(() => {
      editor.current.focus()
    },[])


    return (
        <div onClick={prepCommentFocusEditor} className='MyEditor'>
            <Editor
                ref = {editor}
                editorState = {editorState}
                contentState = {stateFromHTML(props.innerHTML)}
                onChange = {editorState => func(editorState)}
            />
            <div Style="bottom:0;">
            <button Style={currentStyle.has('BOLD') ? "background: green" : null} onMouseDown={boldText}>B</button>
            <button Style={currentStyle.has('UNDERLINE') ? "background: green" : null} onMouseDown={underlineText}>U</button>
            </div>
        </div>
    );
}

export default MyEditor;
