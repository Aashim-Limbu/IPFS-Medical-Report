import React, { ReactNode } from 'react'

function UploadLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <h3 className='text-xl tracking-wide font-semibold'> UploadLayout </h3>
            {children}
        </>
    )
}

export default UploadLayout
