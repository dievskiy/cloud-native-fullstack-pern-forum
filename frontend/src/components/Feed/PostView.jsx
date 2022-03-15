import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Row} from "react-bootstrap";
import {timeDifference} from "../../utils/time";
import './PostView.css';
import CreateCommentForm from "../Comments/CreateCommentForm.jsx";
import PostService from "../../services/PostService";

const PostView = (props) => {
    const params = useParams()
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
    const navigate = useNavigate();

    const fetchPostById = async (id) => {
        PostService.getById(id).then(r => {
                setPost(r.data)
            }
        )
    }

    const fetchComments = async (id) => {
        PostService.getComments(id).then(r => {
                setComments(r.data)
            }
        )
    }

    const updateComments = async (comment) => {
        setComments([comment, ...comments])
    }

    useEffect(() => {
        fetchPostById(params.id)
        fetchComments(params.id)
    }, [])

    return (
        <div className="container">
            <div className="card p-lg-4">
                <Row className="col-12">
                    <div>
                        <h1>{post.title}</h1>
                        <p className="card-subtitle"><span
                            className="card-time">{timeDifference(new Date(), Date.parse(post.created_at))} by </span><span
                            className="author-container"><span
                            onClick={() => navigate(`/profile?username=${post.author_name}`)}
                            className="author">{post.author_name}</span></span>
                        </p>
                        <div className="d-flex">
                            <p className="border border-secondary pl-2 pr-2">{post.section}</p>
                        </div>
                    </div>
                </Row>
                <Row>
                    <div className="col-12">
                        <section>
                            <p>{post.content}</p>
                        </section>
                    </div>
                </Row>
            </div>
            <div className="card p-lg-4">
                <Row className="border-bottom mb-lg-3">
                    <div className="col-12">
                        <h4>
                            Comments
                        </h4>
                    </div>
                </Row>
                {
                    comments.length ? (
                        <>
                            {comments.map(comm =>
                                <Row key={comm.created_at} className="mb-2 col-10">
                                    <div>
                                        <div className="d-flex">
                                            <p className="m-0 pr-2 comment-author">{comm.author_name}</p>
                                            <p className="m-0 comment-time text-secondary">{timeDifference(new Date(), Date.parse(comm.created_at))}</p>
                                        </div>
                                        <p className="comment-content">{comm.content}</p>
                                    </div>
                                </Row>
                            )}
                        </>
                    ) : (
                        <>
                            <Row className="text-secondary">
                                <div className="col-10"> No comments yet
                                </div>
                            </Row>
                        </>
                    )
                }

                {
                    props.user && (
                        <>
                            <Row className="mt-lg-3">
                                <div className="col-8">
                                    <CreateCommentForm user={props.user} postId={params.id}
                                                       updateComments={updateComments}/>
                                </div>
                            </Row>
                        </>
                    )
                }
            </div>
        </div>
    );
};

export default PostView;