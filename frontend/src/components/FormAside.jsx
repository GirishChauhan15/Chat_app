import {bg} from '../assets'

function FormAside() {
  return (
    // Image section for Auth form
    <aside className='hidden bg-secondary rounded-tr-lg rounded-br-lg sm:block w-full p-14'>
      <div className="h-full w-full">
        <img className='w-full h-full object-cover object-left-top ' loading='eager' fetchPriority='high' src={bg} alt="A geometrical shape pattern." />
      </div>
    </aside>
  )
}

export default FormAside