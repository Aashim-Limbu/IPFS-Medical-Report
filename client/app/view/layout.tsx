import React, { ReactNode } from 'react'

function ViewLayout({children}:{children:ReactNode}) {
  return (
    <>
    <div>View Layout</div>
    {children}
    </>
  )
}

export default ViewLayout
