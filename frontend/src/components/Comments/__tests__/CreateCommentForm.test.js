import CreateCommentForm from "../CreateCommentForm";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import {render} from '../../../__tests__/router'

test('Show error message when textarea is empty', () => {
    // Act
    render(
        <CreateCommentForm/>
    )
    // Assert
    expect(screen.getByText("Submit")).toBeInTheDOM()

    // Act
    userEvent.type(screen.getByTestId("testtextarea"), "test comment")
    userEvent.click(screen.getByText("Submit"))

    // Assert
    expect(screen.getByText(/Comment should contain 1 - /i)).toHaveStyle("display: block;")

})
