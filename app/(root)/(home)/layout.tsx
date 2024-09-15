import Navbar from '@/components/ui/Navbar'
import Sidebar from '@/components/ui/Sidebar'
import React, { ReactNode } from 'react'
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: "Ayit",
  description: "Video calling app",
  icons:{
    icon: "/icons/logo.svg",
  }
};
const RootLayout = ({children}:{children:ReactNode}) => {
  return (
    <main>
        
        <Navbar />
     <div className="flex">
        <Sidebar /> 
        <section className='flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14'>
            <div className="w-full">
                {children}
            </div>

        </section>
     </div>
    
    </main>
  )
}

export default RootLayout
