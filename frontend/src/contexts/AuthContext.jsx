import React, { createContext, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Get the BACKEND_URL.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    // const user = null; // Modify me.
    const [user, setUser] = useState(null);

    // When the user is logged in (i.e., localStorage contains a valid token), fetch the user data from /user/me and update the user context state with the returned user object.
    // When the user is not logged in (i.e., localStorage does not contain a token), set the user context state to null.
    // Additionally, ensure that the authentication state persists across hard reloads (e.g., when the user refreshes the page). Hint: useEffect can be useful for checking the stored token and fetching user data when the component mounts.
    // Basically when the page loads, our code will check whether a login token is saved in the browser -> ask backend the user -> stores the returned user in app state so UI knows user is logged in (if invalid token then we clear the login state)
    // And  basically when we hard-refresh page, react loses in-memory state but local storage persists so we can use useEffect to restore the login state after refresh by checking localStorage + validating token with backened 
    useEffect(() => {
        // Complete me, by retriving token from localStorage and make an api call to GET /user/me.
        const token = localStorage.getItem("token"); 
        // If no token -> nobody is logged in 
        if (!token){
            setUser(null); 
            return; 
        }
        // if there's toke, we can call nbackened /user/me and check if token is valid and which user it belongs to, using fetch to make the request 
        fetch(`${BACKEND_URL}/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        }) 
        // do following when backend responds, res.ok is true when status = 200-299(success)
        .then(res =>{
            if(!res.ok) throw new Error("No User fetched")
            return res.json(); 
        })
        // after we get data we store user object in React state so any UI that reads this can show the logged-in view 
        .then(data => setUser(data.user))
        // if we catch any errors -> need to remove token and keep user to null to show logged-out state 
        .catch(() => {
            localStorage.removeItem("token"); 
            setUser(null); 
        }); 
    }, [])

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    // This function does not require making any API calls. Simply remove the token from localStorage, set the user context state to null, then navigate to /.
    const logout = () => {
        // Complete me
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    // so the flow is when user logs in (ofc we have to check if username and password correct) -> frontend can call /login -> backend returns the JWT token -> frontend stores token in browser localStorage + calls /user/me to lad user info into state setUser 
    // react will read user and update the UI 
    /**
     * Login a user with their credentials. Authenticate a user and generate a JWT token. 
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    // Implement the login function using the Fetch API to send a request to /login. If login fails, return the error message from the response. If it succeeds, you need to do three things:
    // Store the received token in localStorage. Please use 'token' as the key, otherwise the autotester will have trouble restoring session state across hard reloads.
    // Update the user context state.
    // Lastly, redirect the user to /profile. 
    const login = async (username, password) => {
        // Complete me, basically send a POST request to /login including username and password 
        const res = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            // lets backend know it's JSON 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const err = await res.json();
            return err.message;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);

        // who is the user that has the token?? then call /user/me and include a bearer (=anyone with this token is trusted) token 
        const userRes = await fetch(`${BACKEND_URL}/user/me`, {
            headers: { Authorization: `Bearer ${data.token}` }
        });

        const userData = await userRes.json();
        // put all that user info in React to make the UI update   
        setUser(userData.user);

        navigate("/profile");
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    // The register function takes an object with four fields, and can be implemented with the /register endpoint Upon success, navigate to /success. Otherwise, return the received error message. 
    // basically when new user signs up, we get their username, first/lastname, password and send to backend via /register -> backend creates a new user -> navigate back to homepage if successful for them to login using the credentials 
    const register = async (userData) => {
        // Complete me
        const res = await fetch(`${BACKEND_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        if (!res.ok) {
            const err = await res.json();
            return err.message;
        }

        navigate("/success");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
