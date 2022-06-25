import { quizItemList } from '../data/quiz';

export const getQuizIndices = (level: number) => {
  const result: number[] = [];

  const candidateIndices = quizItemList.reduce<number[]>((pre, cur, idx) => {
    if (cur.level <= level) {
      pre.push(idx);
    }
    return pre;
  }, []);

  while (result.length < 12) {
    const randomIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    if (!result.includes(randomIndex)) {
      result.push(randomIndex);
    }
  }

  return result;
};
