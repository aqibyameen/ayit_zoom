"use client"
import Image from 'next/image'
import { Input } from "@/components/ui/input"

import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from './ui/textarea'
import ReactDatePicker from 'react-datepicker';


const MeetingTypeList = () => {
    const router = useRouter()
    const [meetingState,setMeetingState]= useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>()
    const {user}=useUser();
    const client =useStreamVideoClient();
   const [value,setValues]=useState({
    dateTime: new Date(),
    description:'',
    link:''
   })
   const {toast} =useToast();
   const [callDetails,setCallDetails]= useState<Call>()
    const CreateMeeting=async()=>{
      if(!client || !user) return;
      try {
        if(!value.dateTime){
          toast({
            title:"Please select a date and time",
          })
          return;
        }
        const id=crypto.randomUUID();
        const call=client.call('default',id);
        if(!call) throw new Error("failed to create call")
          const startsAt=value.dateTime.toISOString() || new Date(Date.now()).toISOString();
        const description=value.description || 'instant meeting';
        await call.getOrCreate({data:{
          starts_at:startsAt,
          custom:{
            description:description
          }
          
        }
        
      
      })
       setCallDetails(call)
       if(!value.description){
        router.push(`/meeting/${call.id}`)
       }
       toast({
        title:"Meeting created successfully",
       })
      } catch (err) {
        console.log(err)
        toast({
          title:"failed to create meeting",
        })
        
      }

    }
    const MeetingLink=`${process.env.NEXT_BASE_PUBLIC_URL}/meeting/${callDetails?.id}`;
    return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
  <HomeCard
  img="icons/add-meeting.svg"
  title="New Meeting"
  description="Start an instant meeting"
  handleCLick={()=>setMeetingState("isInstantMeeting")}
    className="bg-orange-1"
  />
   <HomeCard
  img="icons/schedule.svg"
  title="Schedule Meeting"
  description="Plan your meeting"
  handleCLick={()=>setMeetingState("isScheduleMeeting")}
    className="bg-blue-1"

  />
   <HomeCard
  img="icons/recordings.svg"
  title="View Recordings"
  description="Check out your  recordings."
  handleCLick={()=>router.push('/recordings')}
    className="bg-purple-1"

  />
   <HomeCard
  img="icons/join-meeting.svg"
  title="Join Meeting"
  description="Via invitation link "
  handleCLick={()=>setMeetingState("isJoiningMeeting")}
    className="bg-yellow-1"
 
  />
  {!callDetails ?(
      <MeetingModal 
      isOpen={meetingState === 'isScheduleMeeting'}
      onClose={ ()=>setMeetingState(undefined)}
      title="Create Meeting"
      className="text-center"
      handleClick={CreateMeeting}
     >
     <div className="flex flex-col gap-2 5">
      <label className="text-base text-normal">
        Add a description
        </label>
        <Textarea className='border-none bg-dark-3 focus-visible:ring-0 
        focus-visible:ring-offset-0 ' onChange={(e)=>{
          setValues({...value,description:e.target.value})
        }} />
        <div className="flex w-full flex-col gap-2 5">
<label className="text-base text-normal text-sky-2 leading-[22px]">
Select Date and Time
</label>
<ReactDatePicker
selected={value.dateTime}
onChange={(date)=>setValues({...value,dateTime:date!})}
showTimeSelect
timeFormat='HH:mm'
timeIntervals={15}
timeCaption='time'
dateFormat="MMMM d, yyyy h:mm aa"
className='w-full rounded bg-dark-3 p-2 focus:outline-none'
/>
        </div>
      
     </div>
     </MeetingModal>
  )  :(
    <MeetingModal 
    isOpen={meetingState === 'isScheduleMeeting'}
    onClose={ ()=>setMeetingState(undefined)}
    title="Meeting Created"
    className="text-center"
    buttonText="Copy Meeting Link"
    handleClick={()=>{
      navigator.clipboard.writeText(MeetingLink)
      toast({
        title:"Meeting link copied successfully",
      })
    }}
    image="/icons/checked.svg"
    buttonIcon="/icons/copy.svg"
  
  />
  )

}

  <MeetingModal 
  isOpen={meetingState === 'isInstantMeeting'}
  onClose={ ()=>setMeetingState(undefined)}
  title="Start an instant meeting"
  className="text-center"
  buttonText="Start Meeting"
  handleClick={CreateMeeting}


/>
<MeetingModal 
  isOpen={meetingState === 'isJoiningMeeting'}
  onClose={ ()=>setMeetingState(undefined)}
  title="Type the link here"
  className="text-center"
  buttonText="Join Meeting"
  handleClick={()=>router.push(value.link)}

>
<Input placeholder='Meeting link here'
className='border-none bg-dark-3  focus-visible:ring-0 focus-visible:ring-offset-0'
 onChange={(e)=>setValues({...value,link:e.target.value})}
/>
</MeetingModal>

    </section>
  )
}

export default MeetingTypeList
