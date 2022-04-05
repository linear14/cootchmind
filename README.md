## 개발에 참고한 자료들

### 이슈 해결

1. 캔버스에서 draw 이벤트를 끝내는 방법은.. 마우스 왼클릭 누르던거를 손에서 떼거나, 캔버스 밖으로 커서를 내보낼 때 발생한다. 그런데, 캔버스 밖으로 나갔다 오면서 다시 그림을 그리면, mouse move 이벤트가 발생하지 않아 그림이 그려지지 않았다. (추가적으로, 마우스에서 손을 떼어도 draw 이벤트가 유지되어 그림이 그려졌다.) 유심히 살펴보니깐, 캔버스가 클릭된 상태에서 이동시 끌고가는 모션이 작동되는 것을 확인할 수 있었다. 따라서, 기본 mouse down 이벤트를 막는 방법을 생각할 수 있었으며 e.preventDefault()를 통해 해결할 수 있었다.

### 구현 아이디어

- [React를 이용한 그림판 그리기](https://www.youtube.com/watch?v=FLESHMJ-bI0)

### 학습

- [요소의 절대좌표 상대좌표 구하기 (getBoundingClientRect, offsetAPI, pageOffset)](https://mommoo.tistory.com/85)
- [반응형 레이아웃 너비를 나누는 기준](https://blogpack.tistory.com/823)
- [forward ref](https://ko.reactjs.org/docs/forwarding-refs.html)
- [tsconfig 옵션](https://geonlee.tistory.com/214)
- [Socket.io-client 문서](https://socket.io/docs/v4/client-installation/)

### 이슈 해결에 도움 준 문서

- [How to disable not-allowed cursor while dragging](https://stackoverflow.com/questions/45534302/jquery-how-to-disable-not-allowed-cursor-while-dragging)
