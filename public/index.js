import { jwtDecode } from "./jwt-decode.js";

let accessToken = '';
const api_url = '/api'; // Update this if needed
const divLogin = document.getElementById("div-login");
const formLogin = document.getElementById("form-login");
const buttonGetUsers = document.getElementById("button-get-users");
const buttonRefreshToken = document.getElementById("button-refresh-token");
const buttonDeleteToken = document.getElementById("button-delete-token");
const pStatus = document.getElementById("login-status");


// Google Sign-In callback
window.onload = function() {
  window.google.accounts.id.initialize({
    client_id: "70912245721-40neqr6u551m5eg1vreiml0v2sog9cc5.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });
  window.google.accounts.id.renderButton(
    document.querySelector(".g_id_signin"),
    { theme: "outline", size: "large" }  // Customize button appearance
  );
  window.google.accounts.id.prompt(); // Show the One Tap UI
};

// Initialize Google Sign-In
window.onload = function() {
    window.google.accounts.id.initialize({
        client_id: "70912245721-40neqr6u551m5eg1vreiml0v2sog9cc5.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    window.google.accounts.id.renderButton(
        document.querySelector(".g_id_signin"),
        { theme: "outline", size: "large" }
    );
    window.google.accounts.id.prompt(); // Show the One Tap UI
};

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const idToken = response.credential;
    loginWithGoogle(idToken);
}


        async function loginWithGoogle(idToken) {
            try {
                const res = await fetch(`${api_url}/google/login`, {
                    method: 'POST',
                    credentials: 'include',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idToken })
                });
        
                const loginDetails = await res.json();
        
                if (loginDetails.error) {
                    pStatus.innerText = loginDetails.error;
                    return;
                }
        
                // Log the entire response object, including the payload
                console.log("Login Details:", loginDetails);
                console.log("Google Account Payload:", loginDetails.payload);
        
                // Access the user information from the loginDetails
                const { accessToken, refreshToken, user, payload } = loginDetails;
        
                // Log all payload details for inspection
                console.log("Access Token:", accessToken);
                console.log("Refresh Token:", refreshToken);
                console.log("All Google Account Information:", payload);

                pStatus.innerHTML = `Login Successful! </br> 
                                     Hello ${user.user_name}</br> 
                                     Your ID is ${user.user_id}</br> 
                                     Your email is ${user.user_email}</br>
                                     Your phone is ${user.user_phone}</br>
                                     <img src="${user.user_picture}" alt="User Picture" style="width:50px; height:50px; border-radius:50%;">`;
        
                showLoginPanel(false);
        
            } catch (error) {
                console.error('Error during login process:', error);
                pStatus.innerText = 'An error occurred during login.';
            }
        }
        


formLogin.onsubmit = async e => {
  e.preventDefault();
  const loginDetails = await login({ email: formLogin.email.value, password: formLogin.password.value });
  console.log(loginDetails);
  if (loginDetails.error) {
    pStatus.innerText = loginDetails.error;
    return;
  }
  accessToken = loginDetails.accessToken;
  const jwtDecoded = jwtDecode(accessToken);
  pStatus.innerHTML = `Login Successful! </br> Hello ${jwtDecoded.user_name}</br> Your id is ${jwtDecoded.user_id}</br> Your email is ${jwtDecoded.user_email}`;
  showLoginPanel(false);
}

async function login(data) {
  console.log(JSON.stringify(data));
  const res = await fetch(`${api_url}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}

buttonGetUsers.onclick = async () => {
  const elUserList = document.getElementById("user-list");
  elUserList.innerHTML = "";
  const { users, error } = await fetchUsers(accessToken);
  if (error) {
    pStatus.innerText = error;
    showLoginPanel(true);
    return;
  }
  users.forEach(({ user_name, user_email }) => {
    let el = document.createElement("li");
    el.innerText = `${user_name} - ${user_email}`;
    elUserList.append(el);
  });
}

async function fetchUsers(token) {
  const res = await fetch(`${api_url}/get_users`, {
    headers: {
      'Authorization': 'Bearer ' + token,
    }
  });
  return await res.json();
}

buttonRefreshToken.onclick = async () => {
  const refreshDetails = await fetchRefreshToken();
  if (refreshDetails.error) {
    pStatus.innerText = refreshDetails.error;
    return;
  }
  accessToken = refreshDetails.accessToken;
  const jwtDecoded = jwtDecode(accessToken);
  pStatus.innerHTML = `Login Successful! </br> Hello ${jwtDecoded.user_name}</br> Your id is ${jwtDecoded.user_id}</br> Your email is ${jwtDecoded.user_email}`;
  showLoginPanel(false);
}

async function fetchRefreshToken() {
  const res = await fetch(`${api_url}/auth/refresh_token`, {
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    credentials: 'include'
  });
  const jsonResponse = await res.json();
  return jsonResponse;
}

buttonDeleteToken.onclick = async () => {
  const deleteDetails = await deleteToken();
  if (deleteDetails.error) {
    pStatus.innerText = deleteDetails.error;
    return;
  }
  accessToken = "";
  pStatus.innerText = deleteDetails.message;
  showLoginPanel(true);
}

async function deleteToken() {
  const res = await fetch(`${api_url}/auth/refresh_token`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    credentials: 'include'
  });
  return await res.json();
}

function showLoginPanel(bShow) {
  bShow ? divLogin.style.display = "flex" : divLogin.style.display = "none";
}
