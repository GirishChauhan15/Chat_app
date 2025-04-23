import {forwardRef, useId, useState} from "react";
import { Eye, EyeOffIcon, Search } from 'lucide-react'

// Common input designs
function Input({inputId, type='text', placeholderInfo = "", className='', isRequired = false, isLabelVisible=true, ...props}, ref) {
  const [showPassword, setShowPassword] = useState(false)
  const inputIdInfo = useId()
  return (
    <>
    {
      type === 'search' ? 
      <label htmlFor={inputId ? inputId : inputIdInfo} className="flex flex-col text-white">
          <div className="relative">
          <input ref={ref} type={type === 'search' && 'text'} id={inputId ? inputId : inputIdInfo} className={`border-2 text-xs sm:text-sm border-zinc-700 bg-zinc-800 rounded-sm px-5 py-2 focus:ring-2 focus:ring-accent focus:outline-none w-full pl-10 ${className}`} placeholder={placeholderInfo} required={isRequired} {...props} />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 z-50 focus:ring-2 focus:ring-accent focus:outline-none">
             <Search className="size-5 stroke-accent" />
          </span>
          </div>
        </label>
        :
        type !== 'password' ?
        <label htmlFor={inputId ? inputId : inputIdInfo} className="flex flex-col text-white">
          {isLabelVisible && <span className="py-2 text-xs sm:text-sm">{placeholderInfo}</span>}
          <input ref={ref} type={type} id={inputId ? inputId : inputIdInfo} className={`border-2 text-xs sm:text-sm border-zinc-700 bg-zinc-800 rounded-sm px-5 py-2 focus:ring-2 focus:ring-accent focus:outline-none ${className}`} placeholder={placeholderInfo} required={isRequired} {...props} />
        </label> 
        :
        <label htmlFor={inputId ? inputId : inputIdInfo} className="flex flex-col text-white">
          <span className="py-2 text-xs sm:text-sm">{placeholderInfo}</span>
          <div className="relative">
          <input ref={ref} type={!showPassword ? type : 'text'} id={inputId ? inputId : inputIdInfo} className={`border-2 text-xs sm:text-sm border-zinc-700 bg-zinc-800 rounded-sm px-5 py-2 focus:ring-2 focus:ring-accent focus:outline-none w-full pr-10 ${className}`} placeholder={placeholderInfo} required={isRequired} {...props} />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 z-50 focus-visible:ring-2 focus:ring-accent focus:outline-none" tabIndex={0} onKeyDown={(e)=>{
            if(e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              setShowPassword(prev=> !prev)
            }
          }}>
          { !showPassword ? <Eye className="size-5 stroke-accent" onClick={()=> setShowPassword(true)} /> : <EyeOffIcon className="size-5 stroke-accent" onClick={()=> setShowPassword(false)} /> }
          </span>
          </div>
        </label>
      }
    </>
  );
}

export default forwardRef(Input);
