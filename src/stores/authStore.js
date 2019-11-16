import { decorate, observable, computed } from "mobx";
import jwt_decode from "jwt-decode";
import axios from "axios";

const instance = axios.create({
  baseURL: "https://the-index-api.herokuapp.com"
});

class AuthStore {
  user = null;

  constructor() {
    this.user = null;
    this.checkForToken();
  }

  setUser = token => {
    if (token) {
      axios.defaults.headers.common.Authorization = `JWT ${token}`;
      const decodedUser = jwt_decode(token);
      this.user = decodedUser;
      localStorage.setItem("myToken", token);
    } else {
      delete axios.defaults.headers.common.Authorization;
      localStorage.removeItem("myToken");
      this.user = null;
    }
  };

  login = async (userData, history) => {
    try {
      const res = await instance.post("/login/", userData);
      const user = res.data;
      this.setUser(user.token);
      history.replace("/");
    } catch (err) {
      console.error(err.response.data);
    }
  };

  logout = () => {
    this.setUser();
  };

  signup = async userData => {
    try {
      const res = await instance.post("/signup/", userData);
      const user = res.data;
      this.setUser(user.token); // gets username + token
    } catch (err) {
      console.error(err.response.data);
    }
  };

  checkForToken = () => {
    const token = localStorage.getItem("myToken");
    if (token) {
      const currentTime = Date.now() / 1000;
      const user = jwt_decode(token);
      if (user.exp >= currentTime) {
        this.setUser(token);
      } else {
        this.logout();
      }
    }
  };
}

decorate(AuthStore, {
  user: observable
});

const authStore = new AuthStore();

export default authStore;
