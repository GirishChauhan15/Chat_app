// Convert Image file into Base64 string ( FileReader )
import { useState } from 'react'

function useImageReader() {

    const [file, setFile] = useState(null)

    const readImageFiles = (fileData) => {
        let reader = new FileReader()
    
        reader.onload = function() {
          let result = reader.result
          setFile(result)
        }
        reader.readAsDataURL(fileData)
      }

  return {readImageFiles, file, setFile}
}

export default useImageReader