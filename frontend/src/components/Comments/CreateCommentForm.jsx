import React, {useState} from 'react';
import {Alert, Button, Form} from "react-bootstrap";
import PostService from "../../services/PostService";

/**
 * Component for creating a new comment
 * @param user author User object
 * @param postId Id of the post to create comment to
 * @param updateComments callback update function
 * @returns {JSX.Element}
 * @constructor
 */
const CreateCommentForm = ({user, postId, updateComments}) => {
    const [commentValidated, setCommentValidated] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [comment, setComment] = useState({comment: ''})

    const createComment = (e) => {
        const form = e.currentTarget
        e.preventDefault()
        if (form.checkValidity() === false) {
            e.stopPropagation()
            setCommentValidated(true)
            return
        }
        PostService.createComment(comment.comment, postId).then(
            response => {
                setCommentValidated(false)
                setErrorMessage('')
                updateComments({
                    content: comment.comment,
                    author_name: user.username,
                    created_at: new Date()
                })
                setComment({comment: ''})
            },
            error => {
                setErrorMessage(error.response.data.message);
            }
        )
    }

    return (
        <div>
            <Form noValidate validated={commentValidated} onSubmit={createComment}>
                <Form.Group controlId="validationCustom01">
                    <Form.Label>Comment:</Form.Label>
                    <textarea data-testid="testtextarea" rows="5" placeholder="Your comment here..." className="form-control"
                              required value={comment.comment} onChange={e => {
                        setComment({...comment, comment: e.target.value})
                    }}/>
                    <Form.Control.Feedback type="invalid">
                        Comment should contain 1 - 400 characters
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="mt-lg-3">
                    {errorMessage && (
                        <Alert key='1' variant='danger'>
                            {errorMessage}
                        </Alert>
                    )}
                </div>
                <Button className="mt-lg-1" variant="primary" type="submit">Submit</Button>
            </Form>
        </div>
    );
};

export default CreateCommentForm;