export const getLocalStorageUser = () => {
  const name = localStorage.getItem('name');
  return { name };
};

export const setLocalStorageUser = (name: string) => {
  localStorage.setItem('name', name);
};

export const resetLocalStorageUser = () => {
  localStorage.removeItem('name');
};
