import React from 'react';
import './Autocomplete.css';

// Simple debouncing function that allows us to not hit the API unless the user
// stops writing after `delay` milliseconds.
let debounceId;
function debounce(f, delay) {
  // Cancels the setTimeout method execution
  clearTimeout(debounceId)
  debounceId = setTimeout(f, delay)
}

class Autocomplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      loading: false,
      value: '',
      search: '',
      selectedIndex: 0,
    }
    this.handleChange = this.handleChange.bind(this);
    this.setValue = this.setValue.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.fetchResults = this.fetchResults.bind(this);
  }

  handleChange(event) {
    const searchText = event.target.value

    this.setValue(searchText)

    // If the searched text is empty, then don't make the async call, simply
    // set the results back to an empty array to clear them.
    if (searchText.length == 0) {
      return this.setState({results: [], search: ''})
    }

    this.setState({loading: true, search: searchText})

    // Only trigger the fetch one second after the user stops writing to avoid unnecessary fetches.
    debounce(() => {
      this.fetchResults(searchText).then((filteredResults) => {
        this.setState({results: filteredResults, loading: false})
      })
    }, 500)
  }

  handleKeyUp(event) {
    const keyCode = event.keyCode;
    if (keyCode === 40 && this.state.selectedIndex < this.state.results.length - 1) { // key down
      this.setState((prev) => ({
        selectedIndex: prev.selectedIndex + 1,
        value: prev.results[prev.selectedIndex + 1]
      }))
    }
    if (keyCode === 38 && this.state.selectedIndex > 0) { // key up
      this.setState((prev) => ({
        selectedIndex: prev.selectedIndex - 1,
        value: prev.results[prev.selectedIndex - 1]
      }))
    }
    if (keyCode === 13) { // enter
      this.setState((prev) => ({
        value: prev.results[prev.selectedIndex],
        results: [],
      }))
    }
  }

  // Auxiliary function that acts as an API fetch.
  async fetchResults (searchText, delay = 1) {
    // Make case insensitive searches
    const searchRegex = new RegExp(searchText.replace(/[\\\.\+\*\?\^\$\[\]\(\)\{\}\/\'\#\:\!\=\|]/ig, "\\$&"), 'gi')
    let delayedResults = new Promise((resolve, reject) => {
      setTimeout(() => resolve(
        ['Max Casal', 'Alex Bouaziz', 'Martin Mochetti'].filter((value) => value.match(searchRegex))
      ), delay)
    });
    return await delayedResults;
  }

  highlight(value, resultIdx) {
    const searchText = this.state.search
    const regex = new RegExp(searchText.replace(/[\\\.\+\*\?\^\$\[\]\(\)\{\}\/\'\#\:\!\=\|]/ig, "\\$&"), 'gi')
    const matches = value.matchAll(regex)
    const splits = value.split(regex)

    // Get all indexes in which a match is found.
    let indexes = []
    for (const match of matches) {
      indexes.push(match.index)
    }

    // Small auxiliary function to render the highlighted content at a given index.
    const renderHighlightAfter = (index) => {
      const highlightIdx = indexes[index]
      if (highlightIdx !== undefined) {
        return (<span className="highlighted">{value.slice(highlightIdx, highlightIdx + searchText.length)}</span>)
      }
    }

    const performAutocomplete = () => {
      this.setValue(value)
      this.setState({results: []})
    }

    let className = 'result'
    if (resultIdx === this.state.selectedIndex) {
      className += ' selected'
    }

    return (
      <div key={value} className={className} onClick={performAutocomplete}>
        {splits.map((split, idx) => (
          <span key={`${split}${idx}`}>
            {split}
            {renderHighlightAfter(idx)}
          </span>
        ))}
      </div>
    );
  }

  loadingIndicator () {
    return (<div className="loading"> Loading... </div>)
  }

  setValue (value) {
    this.setState({value})
  }

  render () {
    return (
      <div className="autocomplete">
        <input type="text" onChange={this.handleChange} value={this.state.value} onKeyUp={this.handleKeyUp}/>
        <div className="results">
          {this.state.loading ?  this.loadingIndicator() : this.state.results.map((result, resultIdx) => this.highlight(result, resultIdx))}
        </div>
      </div>
    );
  }
}

export default Autocomplete;
