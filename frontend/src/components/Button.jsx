import React, { forwardRef } from 'react'

// Common button design
function Button({children, className=''},ref) {
  return (
    <button ref={ref} className={`bg-accent text-white text-xs sm:text-sm px-3 py-2 rounded-md font-semibold hover:bg-accent/80 focus:bg-accent/80 focus:ring-2 focus:outline-none focus:ring-white ${className}`}>{children}</button>
  )
}

export default forwardRef(Button)