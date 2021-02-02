import {useState, useEffect, useRef} from 'react'

function PopupBar(props) {

  return (
    <div className="popupBar">
      {props.text}
    </div>
  )
}

export default PopupBar
