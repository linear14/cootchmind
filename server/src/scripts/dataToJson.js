const fs = require('fs');
const prettier = require('prettier');

const cookies = require('./cookies');
const pets = require('./pets');
const treasures = require('./treasures');
const skins = require('./skins');
const maps = require('./maps');
const items = require('./items');
const contents = require('./contents');
const etc = require('./etc');

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
      level: 'normal'
    })),
    ...treasures.map((data, idx) => ({
      type: 3,
      id: 3001 + idx,
      answer: data,
      level: 'normal'
    })),
    ...skins.map((data, idx) => ({
      type: 4,
      id: 4001 + idx,
      answer: data,
      level: 'hard'
    })),
    ...maps.map((data, idx) => ({
      type: 5,
      id: 5001 + idx,
      answer: data,
      level: 'hard'
    })),
    ...items.map((data, idx) => ({
      type: 6,
      id: 6001 + idx,
      answer: data,
      level: 'easy'
    })),
    ...contents.map((data, idx) => ({
      type: 7,
      id: 7001 + idx,
      answer: data,
      level: 'easy'
    })),
    ...etc.map((data, idx) => ({
      type: 9,
      id: 9001 + idx,
      answer: data,
      level: 'normal'
    }))
  ];

  return JSON.stringify(dataList);
}

function toFormatted(code) {
  return prettier.format(code, { parser: 'typescript' });
}

(async () => {
  const rawQuizFile = `
  type Level = 'easy' | 'normal' | 'hard';

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
