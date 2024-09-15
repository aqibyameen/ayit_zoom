//@ts-ignore
"use client"
import { useGetCalls } from '@/hooks/useGetCalls'
import { CallRecording } from '@stream-io/node-sdk'
import { Call } from '@stream-io/video-react-sdk'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import MeetingCard from './MeetingCard'
import Loader from './Loader'
import { useToast } from '@/hooks/use-toast'

interface CallListProps {
  type: 'ended' | 'upcoming' | 'recordings';
}

const CallList = ({ type }: CallListProps) => {
  const { toast } = useToast();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls();
  const router = useRouter();
  const [recording, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case 'ended':
        return endedCalls;
      case 'upcoming':
        return upcomingCalls;
      case 'recordings':
        return recording;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case 'ended':
        return 'No Previous Calls';
      case 'upcoming':
        return 'No Upcoming Calls';
      case 'recordings':
        return 'No Recordings';
      default:
        return '';
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const callData = await Promise.all(callRecordings.map((meeting) => meeting.queryRecordings()));
        const recordingsList = callData
          .filter(call => call.recordings.length > 0)
          .flatMap(call => call.recordings)
          .map(recording => ({
            ...recording,
            end_time: new Date(recording.end_time),  // Convert string to Date
            start_time: new Date(recording.start_time), // Convert start_time to Date
          }));

        setRecordings(recordingsList);  // Set the transformed data
      } catch (error) {
        toast({ title: 'Try again later' });
      }
    };

    if (type === 'recordings') fetchRecordings();
  }, [type, callRecordings, toast]);

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  if (isLoading) return <Loader />;

  return (
    <div className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call).id}
            icon={
              type === 'ended' ? '/icons/previous.svg' :
                type === 'upcoming' ? '/icons/upcoming.svg' : '/icons/recordings.svg'
            }
            buttonText={type === 'recordings' ? 'Play' : 'Start'}
            title={
              (meeting as Call).state?.custom?.description?.substring(0, 26) || 
              (meeting as Call)?.filename?.substring(0, 20) || 'No description'
            }
            date={
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as Call).state?.startedAt?.toLocaleString()
            }
            isPreviousMeeting={type === 'ended'}
            buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
            handleClick={type === 'recordings'
              ? () => router.push(`${meeting?.url}`)
              : () => router.push(`/meeting/${meeting.id}`)}
            link={type === 'recordings' ? meeting?.url : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meeting.id}`}
          />
        ))
      ) : (
        <h1>{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
