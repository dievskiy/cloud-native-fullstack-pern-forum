import React from "react";
import {Alert} from "react-bootstrap";

/**
 * A generic 404 Error component
 * @returns {JSX.Element}
 * @constructor
 */
const Four04 = () => {

    return (
        <div className="container">
            <div>
                <Alert key='1' variant='danger'>This resource does not exist</Alert>
            </div>
        </div>
    );
}

export default Four04