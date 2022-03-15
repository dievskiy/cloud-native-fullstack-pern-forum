import React, {useState} from 'react';
import {Alert, Button, Form, Row} from "react-bootstrap";
import AuthService from "../../services/AuthService";
import {useNavigate} from "react-router-dom";
import {REDIRECT_DELAY} from "../../config";

const RegisterForm = () => {
    const [validated, setValidated] = useState(false);
    const [user, setUser] = useState({email: '', password: '', username: ''})
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const register = (e) => {
        const form = e.currentTarget
        e.preventDefault()
        if (form.checkValidity() === false) {
            e.stopPropagation()
            setValidated(true)
            return
        }
        AuthService.register(
            user.username,
            user.email,
            user.password
        ).then(
            response => {
                setUser({email: '', password: '', username: ''})
                setValidated(false)
                setSuccess(true)
                setErrorMessage('')

                setTimeout(() => {
                    navigate('/')
                    window.location.reload();
                }, REDIRECT_DELAY)
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message || error.toString();
                setErrorMessage(`${resMessage}`)
            }
        );
    }

    return (
        <div className="d-flex justify-content-center">
            <div className="mt-4 basic-form">
                <h1 className="mb-4 text-center">Create a new account</h1>
                <div className="container d-flex justify-content-center flex-column">
                    <Form noValidate validated={validated} onSubmit={register}>
                        <Row className="row-cols-1 mt-4">
                            <Form.Group controlId="validationCustom01">
                                <Form.Label>Email</Form.Label>
                                <Form.Control required type="email" value={user.email} onChange={e => {
                                    setUser({...user, email: e.target.value})
                                }}/>
                                <Form.Control.Feedback type="invalid">
                                    Please provide valid email
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="row-cols-1 mt-2">
                            <Form.Group controlId="validationCustom03">
                                <Form.Label>Username</Form.Label>
                                <Form.Control required type="text" value={user.username} onChange={e => {
                                    setUser({...user, username: e.target.value})
                                }}/>
                                <Form.Control.Feedback type="invalid">
                                    Username should contain 0 - 20 characters
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="row-cols-1 mt-2">
                            <Form.Group controlId="validationCustom02">
                                <Form.Label>Password</Form.Label>
                                <Form.Control required type="password" value={user.password} onChange={e => {
                                    setUser({...user, password: e.target.value})
                                }}/>
                                <Form.Control.Feedback type="invalid">
                                    Please provide password
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="row-cols-1 mt-2">
                            {errorMessage && (
                                <Alert key='1' variant='danger'>
                                    {errorMessage}
                                </Alert>
                            )}
                        </Row>
                        <Row className="row-cols-1">
                            {success && (
                                <Alert key='2' variant='success'>
                                    Registration Successful. Redirecting to Home...
                                </Alert>
                            )}
                        </Row>

                        <Row className="row-cols-1 mt-4">
                            <Button variant="primary" type="submit">Create account</Button>
                        </Row>
                        <Row className="row-cols-1 mt-1">
                            <div>
                                <p><span className="text-secondary">Already registered?</span> <span onClick={(e) => {
                                    navigate('/login')
                                }} className="btn-link">Log in</span></p>
                            </div>
                        </Row>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
