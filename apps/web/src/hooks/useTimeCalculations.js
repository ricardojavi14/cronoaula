export function useTimeCalculations() {
  const calculateTotalTime = (moments) =>
    moments.reduce(
      (total, m) =>
        total +
        m.submoments.reduce((sum, sm) => sum + (parseInt(sm.duration) || 0), 0),
      0,
    );

  const toMinSec = (totalMins) => ({
    min: Math.floor(totalMins),
    sec: Math.round((totalMins % 1) * 60),
  });

  const fromMinSec = (min, sec) => parseInt(min || 0) + parseInt(sec || 0) / 60;

  return {
    calculateTotalTime,
    toMinSec,
    fromMinSec,
  };
}
