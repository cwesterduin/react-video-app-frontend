import './App.css';
import {useRef, useEffect, useState} from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function DocList(props) {
  let docList =  props.items.map(item => <div><Link to={`/document/${item.DocumentID}`}>{item.DocumentName}</Link></div>)
  return (
    <div>{docList}</div>
  )
}


function UserDocuments() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState();


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

  return (
    isLoaded ?
    <>
    <DocList items={items} />
    </>
    :
    <div>loading...</div>

  )
}

export default UserDocuments
