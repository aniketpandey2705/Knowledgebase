export const relativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minutes ago`;
  
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  
  return formattedDate(date);
};

export const formattedDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};
