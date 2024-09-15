import { DeviceSettings, useCall, VideoPreview } from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';

const MeetingSetup = ({setSetupComplete}:{setSetupComplete:(value :boolean)=>void}) => {
  const [isMicCamToggledOn, setIsMicToggledOn] = useState(false);
  const call = useCall();
  console.log("hello")

  useEffect(() => {
    if (!call) {
      console.error("useCall must be used within the StreamCall component");
      return;
    }

    if (isMicCamToggledOn) {
      call.microphone?.disable();
      call.camera?.disable();
    } else {
      call.microphone?.enable();
      call.camera?.enable();
    }
  }, [isMicCamToggledOn, call]);

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-3 text-white'>
      <h1 className='text-2xl font-bold'>Setup</h1>
      {call && <VideoPreview />}
      <div className="flex h-16 items-center justify-center gap-3">
        <label htmlFor="" className="flex items-center justify-center gap-2 font-medium">
        <input type="checkbox" checked={isMicCamToggledOn} onChange={(e)=>setIsMicToggledOn(e.target.checked)} />
        Join with mic and camera off

        </label>
        <DeviceSettings />
      </div>
      <Button className=' rounded-md bg-green-500 px-4 py-2.5' onClick={()=>{
        call?.join()
        setSetupComplete(true)
      }}>Join Meeting

      </Button>
    </div>
  );
};

export default MeetingSetup;
