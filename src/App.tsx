import { useEffect, useState } from 'react'

export default function App() {
  const [loading, setLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [characters, setCharacters] = useState<any[]>([])
  const [trimmedPage, setTrimmedPage] = useState<any[]>([])
  const [amountOfPages, setAmountOfPages] = useState<any>([])
  const [amountOfSearchedPages, setAmountOfSearchedPages] = useState<any>([])
  const [searchedCharacters, setSearchedCharacters] = useState<any[]>([])
  const [currentSearchedPage, setCurrentSearchedPage] = useState<number>(1)
  const [trimmedSearch, setTrimmedSearch] = useState<any[]>([])
  const [input, setInput] = useState<string>("")

  const numberPerPage = 10

  const getCharacters = async () => {
    try {
      setLoading(true)
      console.log('loading started')

      let allCharacters:any = []

      for (let i = 1; i < 10; i++) {
        await fetch(`https://swapi.dev/api/people/?page=${i}`)
          .then(res => {
            return res.json()
          })
          .then(data => {
            const newCharacters = data.results.map((char: { name: string, gender: string, birth_year: string }) => {
              return {
                name: char.name,
                gender: char.gender,
                age: char.birth_year
              }
            })
            allCharacters = [...allCharacters, ...newCharacters]
          })
      } 

      const pages = Math.ceil(allCharacters.length / numberPerPage)
      let arrayOfNumbers:any[] = [] 
      for (let i = 1; i <= pages; i++) {
        arrayOfNumbers.push(`${i}`)
      }
      setAmountOfPages(arrayOfNumbers)

      setCharacters(allCharacters)
      setLoading(false)
      console.log('loading finished')
      
      const start = (currentPage - 1) * numberPerPage
      const end = start + numberPerPage
      setTrimmedPage(allCharacters.slice(start, end))

    } catch (error:any) {
      setLoading(false)
      console.log(error.message)
    }
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    const start = (pageNumber - 1) * numberPerPage
    const end = start + numberPerPage
    setTrimmedPage(characters.slice(start, end))
  }

  const searchCharacters = async (income:string) => {
    setInput(income)
    let searchResults:any[] = []
    let pages:number = 0

    try {
      await fetch(`https://swapi.dev/api/people/?search=${income}`)
        .then(res => {
          return res.json()
        })
        .then(data => {
          const calc = data.count
          pages = Math.ceil(calc / numberPerPage)
          return pages
        })
    } catch (error:any) {
      console.log(error.message)
    }

    try {
      for (let i = 1; i <= pages; i++) {
        await fetch(`https://swapi.dev/api/people/?search=${income}&page=${i}`)
        .then(res => {
          return res.json()
        })
        .then (data => {
          const newCharacters = data.results.map((char: { name: string, gender: string, birth_year: string }) => {
            return {
              name: char.name,
              gender: char.gender,
              age: char.birth_year,
            }
          })
          searchResults = [...searchResults, ...newCharacters]
        })
      }
    } catch (error:any) {
      console.log(error.message)
    }

    let arrayOfNumbers:any[] = [] 
    for (let i = 1; i <= pages; i++) {
      arrayOfNumbers.push(`${i}`)
    }
    setAmountOfSearchedPages(arrayOfNumbers)

    const start = (currentPage - 1) * numberPerPage
    const end = start + numberPerPage
    setTrimmedSearch(searchResults.slice(start, end))
    
    setSearchedCharacters(searchResults)
  }

  const handleSearchedPageChange = (pageNumber: number) => {
    setCurrentSearchedPage(pageNumber)
    const start = (pageNumber - 1) * numberPerPage
    const end = start + numberPerPage
    setTrimmedSearch(searchedCharacters.slice(start, end))
  }

  const debounce = (func: (arg0: string) => void, delay: number) => {
    let timerId: any
    return (...args: any) => {
      if (timerId) {
        clearTimeout(timerId)
      }
      timerId = setTimeout(() => {
        func.apply(null, args)
      }, delay)
    }
  }

  const debouncedSearch = debounce(searchCharacters, 400)

  useEffect(() => {
    getCharacters()
  }, [])

  return (
    <div className="App">
      <h1>Starwars Characters</h1>

      {loading && <div className="spinner-loader">Loading</div>}

      {loading == false
      ? <div className="search">
          <input 
            type="text" 
            placeholder="Search"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      : null}

      {loading == false 
      ? <div className='table'>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
              </tr>
            </thead>        
            <tbody>
              {input === "" && trimmedPage.map((char, i) => {
                return (
                  <tr key={i}>
                    <td>{char.name}</td>
                    <td>{char.gender}</td>
                    <td>{char.age}</td>
                  </tr>
                )
              })}
              {input !== "" && trimmedSearch.map((char, i) => {
                return (
                  <tr key={i}>
                    <td>{char.name}</td>
                    <td>{char.gender}</td>
                    <td>{char.age}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      : null}

      {loading == false 
      ? <div className="pagination">
          {input === "" && amountOfPages.map((page: any) => (
            <span 
              onClick={() => handlePageChange(page)}
              className="page-number"
              style={{borderBottom: currentPage == page ? "1px solid black" : "none"}}
            >
              {page}
            </span>
          ))}
          {input !== "" && amountOfSearchedPages.map((page: any) => (
            <span 
              onClick={() => handleSearchedPageChange(page)}
              className="page-number"
              style={{borderBottom: currentSearchedPage == page ? "1px solid black" : "none"}}
            >
              {page}
            </span>
          ))}
        </div>
      : null}
    </div>
  );
}

