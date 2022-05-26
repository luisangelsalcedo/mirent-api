import axios from "axios";

export const authorization = (token) => ({
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${token}`,
  },
});

export const verifyUserOrRegister = async (user) => {
  try {
    // verificar si exite
    const { data: login } = await axios.post(`/auth/local/login`, user);
    const { data: token } = login;

    const { data: validate } = await axios.get(`/auth/local/validate/${token}`);
    const { data: payload } = validate;

    Object.assign(user, { _id: payload.id });

    return { token, user };
  } catch (error) {
    // registrar nuevo
    const { data: register } = await axios.post(`/auth/local/register`, user);
    const { data: newUser } = register;

    const { data: login } = await axios.post(`/auth/local/login`, user);
    const { data: token } = login;

    return { token, user: newUser };
  }
};
