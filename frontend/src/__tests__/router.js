import {render as rtlRender, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import App from "../App";
import {BrowserRouter as Router} from 'react-router-dom'

const render = (ui, {route = '/'} = {}) => {
    window.history.pushState({}, 'Test page', route)
    return rtlRender(ui, {wrapper: Router})
}

test('full app rendering and navigation', () => {
    render(<App/>)
    expect(screen.getByText(/IT Forum/i)).toBeInTheDocument()
    expect(screen.getByText(/Ruslan, 2022/i)).toBeInTheDocument()

    userEvent.click(screen.getByText(/IT Forum/i))

    expect(screen.getByText(/IT Forum/i)).toBeInTheDocument()
})

test('404 error should be rendered correctly', () => {
    render(<App/>, {route: '/invalid-route'})

    expect(screen.getByText(/This resource does not exist/i)).toBeInTheDocument()
})


module.exports = {render}