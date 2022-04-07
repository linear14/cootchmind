export const countLog = (socketsSize: number, usersSize: number, usersInRoomSize: number) => {
  console.log(
    `Connected Sockets: ${socketsSize}\nLoggedIn Users: ${usersSize}\nUsers In Room: ${usersInRoomSize}\n==========================`
  );
};
