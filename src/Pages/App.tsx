import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 onClick={()=>{
        setCount(count+1)
      }} className="text-3xl font-bold text-cyan-400">EcoPointsRD Admin {count}</h1>
    </> 
  )
}

export default App
