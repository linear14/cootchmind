const fs = require('fs');
const prettier = require('prettier');

const cookies = require('./cookies');
const pets = require('./pets');
const treasures = require('./treasures');

function toJson() {
  const dataList = [
    ...cookies.map((data, idx) => ({
      type: 1,
      id: 1001 + idx,
      answer: data,
      level: 'easy'
    })),
    ...pets.map((data, idx) => ({
      type: 2,
      id: 2001 + idx,
      answer: data,
      level: 'medium'
    })),
    ...treasures.map((data, idx) => ({
      type: 3,
      id: 3001 + idx,
      answer: data,
      level: 'medium'
    }))
  ];

  return JSON.stringify(dataList);
}

function toFormatted(code) {
  return prettier.format(code, { parser: 'typescript' });
}

(async () => {
  const rawQuizFile = `
  type Level = 'easy' | 'medium' | 'difficult';

  interface QuizItem {
    type: number;
    id: number;
    answer: string;
    level: Level;
  }

  export const quizItemList: QuizItem[] = ${toJson()};
`;
  fs.writeFileSync('../data/quiz.ts', toFormatted(rawQuizFile), 'utf-8');
})();
