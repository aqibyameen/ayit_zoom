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
        calls.map((meeting: Call | CallRecording) => {
          const isRecording = (meeting as CallRecording).filename !== undefined;

          return (
            <MeetingCard
              key={isRecording ? (meeting as CallRecording).id : (meeting as Call).id}
              icon={
                type === 'ended' ? '/icons/previous.svg' :
                  type === 'upcoming' ? '/icons/upcoming.svg' : '/icons/recordings.svg'
              }
              buttonText={type === 'recordings' ? 'Play' : 'Start'}
              title={
                isRecording
                  ? (meeting as CallRecording).filename?.substring(0, 20) || 'No description'
                  : (meeting as Call).state?.custom?.description?.substring(0, 26) || 'No description'
              }
              date={
                isRecording
                  ? new Date((meeting as CallRecording).start_time).toLocaleString()
                  : (meeting as Call).state?.startsAt?.toLocaleString()
              }
              isPreviousMeeting={type === 'ended'}
              buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
              handleClick={type === 'recordings'
                ? () => router.push(`${(meeting as CallRecording)?.url}`)
                : () => router.push(`/meeting/${(meeting as Call).id}`)}
              link={type === 'recordings' ? (meeting as CallRecording)?.url : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`}
            />
          );
        })
      ) : (
        <h1>{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
