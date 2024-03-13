// Auth.js

import API from "./API.js";
import Router from "./Router.js"
const Auth = {
    isLoggedIn: false,
    account: null,
    
    postlogin: async (response, user) => {
        if (response.ok) {
            Auth.isLoggedIn = true;
            Auth.account = user;
            Auth.updateStatus();
            Router.go("/account");
        } else {
            alert(response.message);
        }

        if (window.PasswordCredential && user.password) {
            const credentials = new PasswordCredential({
                id: user.email,
                password: user.password,
                name: user.name
            });
            navigator.credentials.store(credentials);
        }
    },
    register: async (event) => {
        event.preventDefault();
        const user = {
            name: document.getElementById("register_name").value,
            email: document.getElementById("register_email").value,
            password: document.getElementById("register_password").value
        };
        
        const response = await API.register(user);
        Auth.postlogin(response, {
            name: user.name,
            email: user.email
        });
    },
    loginFromGoogle:(data)=>{
        console.log(data)
    },
    
    login: async (event) => {
        if (event) event.preventDefault();
        const credentials = {
            email: document.getElementById("login_email").value,
            password: document.getElementById("login_password").value
        };
        
        const response = await API.login(credentials);
        Auth.postlogin(response, {
            ...credentials,
            name: response.name,
        });
    },
    
    logout: async () => {
        Auth.isLoggedIn = false;
        Auth.account = null;
        Auth.updateStatus();
        Router.go("/");
        
        if (window.PasswordCredential) {
            navigator.credentials.preventSilentAccess();
        }
    },
    
    autologin: async () => {
        if (window.PasswordCredential) {
            const credentials = await navigator.credentials.get({ password: true });
            document.getElementById("login_email").value = credentials.id;
            document.getElementById("login_password").value = credentials.password;
            console.log(credentials);
        }
    },
    
    updateStatus() {
        if (Auth.isLoggedIn && Auth.account) {
            document.querySelectorAll(".logged_out").forEach(
                e => e.style.display = "none"
            );
            document.querySelectorAll(".logged_in").forEach(
                e => e.style.display = "block"
            );
            document.querySelectorAll(".account_name").forEach(
                e => e.innerHTML = Auth.account.name
            );
            document.querySelectorAll(".account_username").forEach(
                e => e.innerHTML = Auth.account.email
            );

        } else {
            document.querySelectorAll(".logged_out").forEach(
                e => e.style.display = "block"
            );
            document.querySelectorAll(".logged_in").forEach(
                e => e.style.display = "none"
            );

        }
    },
    
    init: () => {
        Auth.updateStatus();
    },
}

export default Auth;
