import React, {useEffect, useState} from "react";
import {PLACEHOLDER_IMAGE} from "../../config";
import {Alert, Card} from "react-bootstrap";
import AuthService from "../../services/AuthService";
import './Profile.css';
import {useSearchParams} from "react-router-dom";
import ProfileService from "../../services/ProfileService";

/**
 * Component for displaying user's profile. Supports text description and a profile image
 * @returns {JSX.Element}
 * @constructor
 */
const Profile = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    let username = searchParams.get("username")
    const [user, setUser] = useState({})
    const [error, setError] = useState({})
    const [isMyProfile, setMyProfile] = useState(false)
    const [description, setDescription] = useState("")
    const uploadedImage = React.useRef(null)
    const imageUploader = React.useRef(null)

    const handleImageUpload = e => {
        const [file] = e.target.files;
        if (file) {
            const reader = new FileReader();
            const {current} = uploadedImage;
            current.file = file;
            reader.onload = e => {
                current.src = e.target.result;
            }
            reader.readAsDataURL(file);
            const formData = new FormData();
            formData.append("image", file);
            ProfileService.uploadImage(formData)
        }
    };

    useEffect(() => {
        let name = username
        const me = AuthService.getCurrentUser()
        if (me != null && me.user.username === username) {
            setMyProfile(true)
            setDescription(me.user.description)
        }

        ProfileService.getProfileByName(name).then(
            response => {
                setUser(response.data);
                setDescription(response.data.profile.description)
            },
            error => {
                if (error.response) {
                    setError({message: `${error.response.status} ${error.response.data.message}`})
                }
            }
        )
    }, [username]);

    const textChanged = (event) => {
        setDescription(event.target.value)
    }
    const focusChanged = (event) => {
        ProfileService.updateDescription(description).then(r => {
            AuthService.update(r.data.profile)
        });
    }
    return (
        <div className="d-flex justify-content-center">
            {user.profile ? (
                <Card className="shadow-none user-card">
                    <Card.Header>{user.profile.username}</Card.Header>
                    <Card.Body>
                        <section className="mt-lg-3">
                            <div>
                                <div className="row align-items-center flex-row-reverse">
                                    <div className="col-lg-6">
                                        <div className="about-text go-to">
                                            {
                                                user.profile.description ? (
                                                    <>
                                                        <h5 className="">About me</h5>
                                                        <div>
                                                            {
                                                                isMyProfile ? (
                                                                    <textarea className="form-control"
                                                                              rows="5"
                                                                              onBlur={focusChanged}
                                                                              maxLength="100"
                                                                              value={description}
                                                                              onChange={textChanged}
                                                                    />
                                                                ) : (
                                                                    <textarea
                                                                        rows="5"
                                                                        className="not-editable"
                                                                        readOnly="readonly"
                                                                        maxLength="100"
                                                                        value={description}
                                                                    />
                                                                )
                                                            }
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h5 className="">About me</h5>
                                                        {
                                                            isMyProfile ? (
                                                                <textarea className="form-control"
                                                                          rows="5"
                                                                          onBlur={focusChanged}
                                                                          maxLength="100"
                                                                          value={description}
                                                                          onChange={textChanged}
                                                                />
                                                            ) : (
                                                                <div className="text-secondary">There is no
                                                                    description</div>
                                                            )
                                                        }
                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        isMyProfile ? (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    ref={imageUploader}
                                                    style={{
                                                        display: "none"
                                                    }}
                                                />
                                                <div onClick={() => imageUploader.current.click()}
                                                     className="col-lg-6  mb-lg-1">
                                                    <p className="m-0 edit">Edit</p>
                                                    <Card.Img
                                                        className="m-0"
                                                        ref={uploadedImage}
                                                        src={user.profile.image_url}>
                                                    </Card.Img>
                                                </div>
                                            </>
                                        ) : (
                                            <div
                                                className="col-lg-6 d-flex justify-content-center  mb-lg-1">
                                                <Card.Img
                                                    src={user.profile.image_url ? user.profile.image_url : PLACEHOLDER_IMAGE}>
                                                </Card.Img>
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="mt-lg-5 counter">
                                    <div className="row">
                                        <div className="col-6 col-lg-3">
                                            <div className="count-data text-center">
                                                <h6 className="count">{user.statistics.posts_created}</h6>
                                                <p className="m-0px font-w-600">Posts created</p>
                                            </div>
                                        </div>
                                        <div className="col-6 col-lg-3">
                                            <div className="count-data text-center">
                                                <h6 className="count">{user.statistics.comments_added}</h6>
                                                <p className="m-0px font-w-600">Comments added</p>
                                            </div>
                                        </div>
                                        <div className="col-6 col-lg-3">
                                            <div className="count-data text-center">
                                                <h6 className="count">{user.statistics.posts_upvoted}</h6>
                                                <p className="m-0px font-w-600">Posts upvoted</p>
                                            </div>
                                        </div>
                                        <div className="col-6 col-lg-3">
                                            <div className="count-data text-center">
                                                <h6 className="count">{user.statistics.replies}</h6>
                                                <p className="m-0px font-w-600">Replies made</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Card.Body>
                </Card>) : null}

            {
                error.message && (
                    <div>
                        <Alert key='1' variant='danger'>{error.message}</Alert>
                    </div>
                )
            }
        </div>
    );
}

export default Profile