export const getTimeNow = (): string => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();
  return `${h}:${m}:${s}:${ms}`;
};
