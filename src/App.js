import * as React from "react"
import axios from "axios"
import styled from "styled-components"

import cs from "classnames"
import styles from "./App.module.css"

// Custom Hooks
function useSemiPermanentState(key, initialState) {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )

  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])

  return [value, setValue]
}


const StyledContainer = styled.div



// COMPONENTES
export default function App() {
  const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query="
   
  function storiesReducer(state, action) {
    switch(action.type) {
      case "STORIES_FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        }
      case "STORIES_FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        }
      case "STORIES_FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true
        }
      case "REMOVE_STORIES":
        console.log(state)
        return {
          ...state,
          data: state.data.filter(
            (story) => action.payload.objectID !== story.objectID)
          }
      default:
        throw new Error()
    }
  }


  const [searchTerm, setSearchTerm] = useSemiPermanentState("React")
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`)


  const [stories, dispatchStories] = React.useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  )

  // HANDLERS

  function handleSearchInput(event) {
    setSearchTerm(event.target.value)
  }

  function handleSearchSubmit(event) {
    setUrl(`${API_ENDPOINT}${searchTerm}`)

    event.preventDefault()
  }

  const handleFetchStories = React.useCallback(async () => {
    if(!searchTerm) return;

    dispatchStories({ type: "STORIES_FETCH_INIT" })

    try{
      const result = await axios.get(url)

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      })
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" })
    }
  }, [url])
  
  function handleRemoveStory(item) {
    dispatchStories({
      type: "REMOVE_STORIES",
      payload: item,
    })
  }



  React.useEffect(() => {
    handleFetchStories()
  }, [handleFetchStories])



  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My hacker stories</h1>

      <SearchForm
        searchTerm={ searchTerm }
        onSearchInput={ handleSearchInput}
        onSearchSubmit={ handleSearchSubmit }
      />


      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={ stories.data } onRemoveItem={ handleRemoveStory } />
      )}
    </div>
  )
}

function SearchForm({ searchTerm, onSearchInput, onSearchSubmit }) {
  return (
    <form onSubmit={ onSearchSubmit } className={`${styles.searchForm}`}>
      <InputWithLabel
        id="search"
        value={ searchTerm }
        isFocused
        onInputChange={ onSearchInput }
      ><strong>Search: </strong></InputWithLabel>


      <button
        type="submit"
        disabled={!searchTerm}
        className={`${styles.button} ${styles.buttonLarge}`}
      >Submit</button>
    </form>
  )
}

function InputWithLabel({ id, value, onInputChange, type="text", children }) {
  return (
    <>
      <label htmlFor={ id } className={`${styles.label}`}>{ children }</label>
      <input id={ id } className={`${styles.input}`} type={ type } value={ value } onChange={ onInputChange }/>
    </>
  )
}

function List({ list, onRemoveItem }) {
  return (
    <ul>
      {
        list.map((item) => {
          return (<Item item={ item } onRemoveItem={ onRemoveItem } />)
        })
      }
    </ul>
  )
}

function Item({ item, onRemoveItem }) {
  return (
    <li className={styles.item}>
      <span style={{ width: "40%" }}>
        <a href={ item.url }>{ item.title }</a>
      </span>
      <span style={{ width: "10%" }}>
        <button 
          type="button"
          onClick={ onRemoveItem.bind(null, item) }
          className={cs(styles.button, styles.buttonSmall)}
        >
          Dismiss
        </button>
      </span>
    </li>
  )
}
