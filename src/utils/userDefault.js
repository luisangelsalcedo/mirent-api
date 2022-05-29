export const userDefault = (body) => {
  const { email } = body;
  return {
    name: "Intivated",
    email,
    password: 1234,
    active: false,
  };
};
