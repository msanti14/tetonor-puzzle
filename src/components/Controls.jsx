import React from "react"

export default function Controls({resetGame}){

  return(

    <div className="controls">

      <button onClick={resetGame}>
        Reiniciar
      </button>

    </div>

  )

}