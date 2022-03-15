/**
 * Abstraction over localstorage for manipulating with local objects
 */
export default class StorageController {
    static saveUser(data) {
        localStorage.setItem("user", JSON.stringify(data));
    }

    static removeUser() {
        localStorage.removeItem("user");
    }

    static updateUser(data) {
        let accessToken = JSON.parse(localStorage.getItem('user')).accessToken;
        localStorage.setItem("user", JSON.stringify({user: {...data}, accessToken}));
    }
}