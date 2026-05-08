export const wordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const charCount = (text) => {
  if (!text) return 0;
  return text.length;
};

export const readingTime = (text) => {
  const words = wordCount(text);
  return Math.ceil(words / 200) + " min read";
};
