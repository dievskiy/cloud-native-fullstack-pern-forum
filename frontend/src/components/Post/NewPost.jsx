import React, {useEffect, useState} from 'react';
import {Alert, Button, Card, Form, Row} from "react-bootstrap";
import {REDIRECT_DELAY} from "../../config";
import {useNavigate} from "react-router-dom";
import SectionService from "../../services/SectionService";
import PostService from "../../services/PostService";

const NewPost = () => {
    const [validated, setValidated] = useState(false);
    const [post, setPost] = useState({title: '', content: '', section: ''})
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(null);
    const [sections, setSections] = useState([]);
    const navigate = useNavigate();
    const uploadedImage = React.useRef(null);
    const imageUploader = React.useRef(null);
    let formData;

    useEffect(() => {
        SectionService.getSections().then(
            response => {
                setSections(response.data.sections);
                if (response.data.sections) {
                    setPost({...post, section: response.data.sections[0]})
                } else {
                    setErrorMessage(`There are no section yet`);
                }
            }, error => {
                setErrorMessage(error.response.data.message);
            }
        )
    }, [])

    const create = (e) => {
        const form = e.currentTarget
        e.preventDefault()
        if (form.checkValidity() === false) {
            e.stopPropagation()
            setValidated(true)
            return
        }

        PostService.create(post).then(
            response => {
                setValidated(false)
                setSuccess(true)
                setErrorMessage('')

                let postId = response.data.post.id

                if (formData) {
                    PostService.uploadImage(formData, postId).then(() => redirect(postId))
                } else {
                    redirect(postId)
                }
            }, error => {
                setErrorMessage(error.response.data.message);
            }
        )
    }

    const redirect = (postId) => {
        setTimeout(() => {
            if (postId) {
                navigate(`/posts/${postId}`)
            } else {
                navigate('/')
                window.location.reload()
            }
        }, REDIRECT_DELAY)
    }

    const changeSection = (e) => {
        setPost({...post, section: e.target.value})
    }

    const handleImageUpload = e => {
        const [file] = e.target.files;
        if (file) {
            const reader = new FileReader();
            const {current} = uploadedImage;
            current.file = file;
            reader.onload = e => {
                current.src = e.target.result;
            };
            reader.readAsDataURL(file);
            formData = new FormData();
            formData.append("image", file);
        }
    };

    return (
        <div className="mt-4">
            <h1 className="text-center">New Post</h1>
            <Form noValidate validated={validated} onSubmit={create}>
                <Row className="row-cols-1 mt-4">
                    <Form.Group controlId="validationCustom01">
                        <Form.Label>Title</Form.Label>
                        <Form.Control required type="text" value={post.title} onChange={e => {
                            setPost({...post, title: e.target.value})
                        }}/>
                        <Form.Control.Feedback type="invalid">
                            Title should be 5 - 200 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="row-cols-1 mt-2">
                    <Form.Label>Section</Form.Label>
                    {/*<label htmlFor="sectionSelect">Section</label>*/}
                    <select className="form-control" onChange={changeSection}>
                        {sections.map((section) =>
                            <option key={section}>{section}</option>
                        )
                        }
                    </select>
                </Row>
                <Row className="row-cols-1 mt-2">
                    <Form.Group controlId="validationCustom02">
                        <Form.Label>Post content</Form.Label>
                        <textarea rows="6" className="form-control" required value={post.content} onChange={e => {
                            setPost({...post, content: e.target.value})
                        }}/>
                        <Form.Control.Feedback type="invalid">
                            Title should be 30 - 15000 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>

                <div>
                    <Row className="row-cols-1 mt-2">
                        {errorMessage && (
                            <Alert key='1' variant='danger'>
                                {errorMessage}
                            </Alert>
                        )}
                    </Row>
                </div>
                <Row className="row-cols-1">
                    {success && (
                        <Alert key='2' variant='success'>
                            Post created. Uploading image...
                        </Alert>
                    )}
                </Row>
                <Row className="row-cols-1">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={imageUploader}
                    />
                    <div onClick={() => imageUploader.current.click()}
                         className="col-lg-6  mb-lg-1">
                        <Card.Img
                            ref={uploadedImage} style={{
                            display: "none"
                        }}>
                        </Card.Img>
                    </div>
                </Row>

                <Row className="row-cols-4 mt-4">
                    <Button variant="primary" type="submit">Create Post</Button>
                </Row>
            </Form>
        </div>
    );
};

export default NewPost;