import React, {useContext} from "react";
import {Link, Route, Routes} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthService from "./services/AuthService";
import LoginForm from "./components/Login/LoginForm.jsx";
import Register from "./components/Register/Register.jsx";
import Home from "./components/Feed/Feed.js";
import {Nav, Navbar} from "react-bootstrap";
import "./App.css";
import Four04 from "./components/Errors/Four04.jsx";
import Profile from "./components/Profile/Profile.jsx";
import {AuthContext} from "./context";
import NewPost from "./components/Post/NewPost.jsx";
import PostView from "./components/Feed/PostView.jsx";

const App = () => {
    let user = useContext(AuthContext)

    if (user) {
        user = user.user
    }

    const logOut = () => {
        AuthService.logout();
    }

    return (
        <div>
            <Navbar>
                <Navbar.Brand to="/" as={Link}>
                    IT Forum
                </Navbar.Brand>
                {user ? (
                    <Nav className="ml-auto">
                        <Nav.Link to="/new-post" as={Link}>
                            new post
                        </Nav.Link>
                        <Nav.Link as={Link}
                                  to={"/profile?username=" + user.username}>{user.username}</Nav.Link>
                        <Nav.Link style={{color: '#3993DD'}} to="/login" onClick={logOut} as={Link}>
                            log out
                        </Nav.Link>
                    </Nav>
                ) : (
                    <Nav className="ml-auto">
                        <Nav.Link style={{color: '#3993DD'}} to="/login" as={Link}>
                            log in
                        </Nav.Link>
                        <Nav.Link style={{color: '#3993DD'}} to="/register" as={Link}>
                            sign up
                        </Nav.Link>
                    </Nav>
                )}
            </Navbar>

            <div className="container mt-4 mb-lg-5">
                <Routes>
                    <Route exact path="/" element={<Home/>}/>
                    <Route exact path="/login" element={<LoginForm/>}/>
                    <Route exact path="/register" element={<Register/>}/>
                    <Route exact path="/new-post" element={<NewPost/>}/>
                    <Route exact path="/profile" element={<Profile/>}/>
                    <Route exact path="/posts/:id" element={<PostView user={user}/>}/>
                    <Route path="*" element={<Four04/>}/>
                </Routes>
            </div>

            <footer className="navbar fixed-bottom modal-footer d-flex justify-content-center"
                    style={{height: '4rem'}}>
                <small className="text-secondary">&copy; Ruslan, 2022. All rights reserved.</small>
            </footer>
        </div>
    );
}

export default App;
