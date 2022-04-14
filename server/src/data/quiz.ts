type Level = 'easy' | 'difficult';

interface QuizItem {
  id: number;
  answer: string;
  level: Level;
}

/***
  1xxx 쿠키
  2xxx 펫
  3xxx 보물
  4xxx 스킨
  5xxx 맵
  6xxx 아이템/재화
  7xxx 컨텐츠
  9xxx 기타
***/
export const quizItemList: QuizItem[] = [
  { id: 1001, answer: '용감한쿠키', level: 'easy' },
  { id: 1002, answer: '명랑한쿠키', level: 'easy' },
  { id: 1003, answer: '딸기맛쿠키', level: 'easy' },
  { id: 1004, answer: '보더맛쿠키', level: 'easy' },
  { id: 1005, answer: '좀비맛쿠키', level: 'easy' },
  { id: 1006, answer: '공주맛쿠키', level: 'easy' },
  { id: 1007, answer: '파일럿맛쿠키', level: 'easy' },
  { id: 1008, answer: '버블껌맛쿠키', level: 'easy' },
  { id: 1009, answer: '피스타치오맛쿠키', level: 'easy' },
  { id: 1010, answer: '체리맛쿠키', level: 'easy' }
];
