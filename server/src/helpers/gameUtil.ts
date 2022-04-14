export const getQuizIndices = (totalLength: number) => {
  const result: number[] = [];

  while (result.length < 10) {
    const randomIndex = Math.floor(Math.random() * totalLength);
    if (!result.includes(randomIndex)) {
      result.push(randomIndex);
    }
  }

  return result;
};
