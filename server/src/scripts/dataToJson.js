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
      level: 1
    })),
    ...pets.map((data, idx) => ({
      type: 2,
      id: 2001 + idx,
      answer: data,
      level: 2
    })),
    ...treasures.map((data, idx) => ({
      type: 3,
      id: 3001 + idx,
      answer: data,
      level: 2
    })),
    ...skins.map((data, idx) => ({
      type: 4,
      id: 4001 + idx,
      answer: data,
      level: 3
    })),
    ...maps.map((data, idx) => ({
      type: 5,
      id: 5001 + idx,
      answer: data,
      level: 3
    })),
    ...items.map((data, idx) => ({
      type: 6,
      id: 6001 + idx,
      answer: data,
      level: 1
    })),
    ...contents.map((data, idx) => ({
      type: 7,
      id: 7001 + idx,
      answer: data,
      level: 1
    })),
    ...etc.map((data, idx) => ({
      type: 9,
      id: 9001 + idx,
      answer: data,
      level: 1
    }))
  ];

  return JSON.stringify(dataList);
}

function toFormatted(code) {
  return prettier.format(code, { parser: 'typescript' });
}

(async () => {
  const rawQuizFile = `
  interface QuizItem {
    type: number;
    id: number;
    answer: string;
    level: number;
  }

  export const quizItemList: QuizItem[] = ${toJson()};
`;
  fs.writeFileSync('../data/quiz.ts', toFormatted(rawQuizFile), 'utf-8');
})();
