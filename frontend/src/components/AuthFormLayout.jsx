import React from 'react'
import {FormAside, Container} from './index'

function AuthFormLayout({children}) {
  return (
    <Container>
    <section className="text-white min-h-screen w-full h-[500px] grid sm:grid-cols-2 p-2 sm:p-4 md:p-8">
      {/* Form Layout section */}
      <article className="bg-secondary rounded-lg sm:rounded-none sm:rounded-tl-lg sm:rounded-bl-lg">
        <section className="flex flex-col justify-center px-2 sm:px-4 md:px-8 h-full min-[400px]:w-[70%] min-[400px]:mx-auto sm:w-full">
          {children}
        </section>
      </article>
      {/* Image section */}
      <FormAside />
    </section>
  </Container>
  )
}

export default AuthFormLayout