import React from 'react';
import {useNavigate} from 'react-router-dom';
import {timeDifference} from "../../utils/time";
import './PostItem.css';
import {PLACEHOLDER_IMAGE} from "../../config";

/**
 * Component for rendering a single post item
 * @param post post itself
 * @returns {JSX.Element}
 * @constructor
 */
const PostItem = ({post}) => {
    const navigate = useNavigate()

    return (
        <div className="container">
            <div className="card p-lg-0">
                <div className="card-horizontal">
                    <div className="img-square-wrapper">
                        <img className="" src={post.image_url ? post.image_url : PLACEHOLDER_IMAGE}
                             alt=""/>
                    </div>
                    <div className="card-body">
                        <div className="card-title-container" onClick={() => navigate(`/posts/${post.id}`)}><h4
                            className="card-title">{post.title}</h4></div>
                        <p className="card-subtitle"><span className="card-time">{timeDifference(new Date(), Date.parse(post.created_at))} by </span><span
                            className="author-container"><span
                            onClick={() => navigate(`/profile?username=${post.author_name}`)}
                            className="author">{post.author_name}</span></span>
                        </p>
                        <p className="card-text text-secondary">{post.preview_text}</p>
                    </div>
                </div>
            </div>
        </div>
    )
        ;
};

export default PostItem;