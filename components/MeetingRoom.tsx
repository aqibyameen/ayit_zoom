import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CallControls, CallingState, CallLeaveOptions, CallParticipantsList, CallStats, CallStatsButton, PaginatedGridLayout, SpeakerLayout, useCallStateHooks } from '@stream-io/video-react-sdk'
import React, { useState } from 'react'
import { LayoutList, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import EndCall from './EndCall';
import Loader from './Loader';
type CallLayoutType='grid'| 'speaker-left'| 'speaker-right';

const MeetingRoom = () => {
  const router = useRouter()
 const{useCallCallingState} =useCallStateHooks()
 const callingState=useCallCallingState();
  const searchParams=useSearchParams();
 const isPersonalRoom=!!searchParams.get('personal') 
  const [showParticipants,setShowParticipants]=useState(false)
  const [layout,setLayout] =useState<CallLayoutType>('speaker-left')
  const CallLayout=()=>{
    switch(layout){
      case 'grid':
        return<PaginatedGridLayout/>
      case'speaker-left':
        return <SpeakerLayout participantsBarPosition="right"/>
      default:
        return <SpeakerLayout participantsBarPosition="left" />
    }
  }
  if (callingState!==CallingState.JOINED) return <Loader />;
  return (
    <section className='h-screen relative w-full overflow-hidden pt-4 text-white'>
      <div className="relative flex size-full items-center justify-center">
<div className="flex size-full items-center max-w-[1000px]">
<CallLayout />
</div>
<div className={cn("h-[calc(100vh-86px)] hidden",{'block':showParticipants})}>
  <CallParticipantsList onClose={()=>setShowParticipants(false)} />
</div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
        <CallControls onLeave={()=>{
  router.push('/')
}}  />
        <DropdownMenu>
          <div className="flex items-center">
          <DropdownMenuTrigger className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
            <LayoutList size={20} className='text-white'/>
          </DropdownMenuTrigger>

          </div>
         <DropdownMenuContent className='border-dark-1 bg-dark-1 text-white'>
          
          {['Grid', 'Speaker-left', 'Speaker-right'].map((item,index)=>(
             <div key={index}>
             <DropdownMenuItem  onClick={()=>setLayout(item.toLowerCase() as CallLayoutType )}>
              {item}
            </DropdownMenuItem >
          <DropdownMenuSeparator className='border-dark-1' />

            </div>
          ))}
         
         </DropdownMenuContent>
       </DropdownMenu>
       <CallStatsButton />
       <button onClick={()=>setShowParticipants((prev=>!prev))} className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
      <User size={20} className='text-white' />
       </button>
     {!isPersonalRoom && <EndCall />}
      </div>
      
    </section>
  )
}

export default MeetingRoom
