// MeetingDetails.tsx
import React from 'react';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Globe,
  MapPin,
  Video,
  Link as LinkIcon
} from 'lucide-react';
import { getConsistentTimezoneLabel } from "../../../components/chatbotComponents/chatbotBookingComponents/TimezoneSelector";

interface MeetingDetailsProps {
  meeting: any;
  businessTimezone: string;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  activeTab?: string;
}

const MeetingDetails: React.FC<MeetingDetailsProps> = ({
  meeting,
  businessTimezone,
  formatDate,
  formatTime,
  activeTab
}) => {
  return (
    <div className="bg-white border-t border-gray-100 rounded-b-lg mb-2 px-4 py-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
        {/* Date */}
        <div>
          <div className="flex items-center text-gray-500 mb-1 text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Date</span>
          </div>
          <div className="text-sm">{formatDate(meeting.date)}</div>
        </div>
        
        {/* Time */}
        <div>
          <div className="flex items-center text-gray-500 mb-1 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            <span>Time</span>
          </div>
          <div className="text-sm">
            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
          </div>
        </div>
        
        {/* Attendee */}
        <div>
          <div className="flex items-center text-gray-500 mb-1 text-xs">
            <User className="h-3 w-3 mr-1" />
            <span>Attendee</span>
          </div>
          <div className="text-sm">{meeting.name}</div>
        </div>
        
        {/* Email */}
        <div>
          <div className="flex items-center text-gray-500 mb-1 text-xs">
            <Mail className="h-3 w-3 mr-1" />
            <span>Email</span>
          </div>
          <div className="text-sm truncate">{meeting.userId}</div>
        </div>
        
        {/* Location */}
        <div>
          <div className="flex items-center text-gray-500 mb-1 text-xs">
            {meeting.location === 'in_person' ? (
              <MapPin className="h-3 w-3 mr-1" />
            ) : (
              <Video className="h-3 w-3 mr-1" />
            )}
            <span>Location</span>
          </div>
          <div className="text-sm">
            {meeting.location === "google_meet" && "Google Meet"}
            {meeting.location === "zoom" && "Zoom"}
            {meeting.location === "teams" && "Microsoft Teams"}
            {meeting.location === "in_person" && "In-person"}
          </div>
        </div>
        
        {/* Meeting Link - only if applicable */}
        {meeting.location !== "in_person" && meeting.meetingLink && (
          <div>
            <div className="flex items-center text-gray-500 mb-1 text-xs">
              <LinkIcon className="h-3 w-3 mr-1" />
              <span>Meeting Link</span>
            </div>
            <div className="text-sm">
              <a 
                href={meeting.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline text-xs break-all"
              >
                {meeting.meetingLink}
              </a>
            </div>
          </div>
        )}
        
        {/* IMPROVED: Timezone with consistent display */}
        <div>
          <div className="flex items-center text-gray-500 mb-1 text-xs">
            <Globe className="h-3 w-3 mr-1" />
            <span>Timezone</span>
          </div>
          <div className="text-sm">
            {meeting.userTimezone 
              ? getConsistentTimezoneLabel(meeting.userTimezone)
              : getConsistentTimezoneLabel(businessTimezone)
            }
          </div>
        </div>
        
        {/* Session Type */}
        {meeting.sessionType && (
          <div>
            <div className="flex items-center text-gray-500 mb-1 text-xs">
              <span>Session Type</span>
            </div>
            <div className="text-sm">{meeting.sessionType}</div>
          </div>
        )}
        
        {/* Status */}
        <div>
          <div className="flex items-center text-gray-500 mb-1 text-xs">
            <span>Status</span>
          </div>
          <div className="flex items-center">
            {meeting.status === "cancelled" && (
              <>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                  Cancelled
                </span>
                {meeting.updatedAt && (
                  <span className="text-gray-500 ml-2 text-xs">
                    on {new Date(meeting.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </>
            )}
            {meeting.status === "confirmed" && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                {(activeTab === "past") ? "Completed" : "Confirmed"}
              </span>
            )}
          </div>
        </div>
        
        {/* Rescheduled info */}
        {meeting.isRescheduled && meeting.rescheduledFrom && meeting.rescheduledFrom.date && (
          <div className="col-span-2 md:col-span-3 mt-1">
            <div className="bg-orange-50 border border-orange-200 p-2 rounded text-xs">
              <div className="text-orange-800 font-medium">Rescheduled Meeting</div>
              <div className="text-orange-700 mt-1">
                Originally scheduled for: {formatDate(meeting.rescheduledFrom.date)} at {' '}
                {meeting.rescheduledFrom.startTime && formatTime(meeting.rescheduledFrom.startTime)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetails;