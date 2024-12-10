import React from 'react';

interface EventListProps {
  className?: string;
}

const EventList: React.FC<EventListProps> = ({ className }) => {
  return (
    <div className={className}>
      {/* Event list content */}
      <h2>Upcoming Events</h2>
    </div>
  );
};

export default EventList;
