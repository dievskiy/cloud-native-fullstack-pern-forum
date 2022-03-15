import React from 'react';

/**
 * Component that displays filtering options
 * @param options list of valid options
 * @param defaultValue string for the default option value
 * @param value value for binding
 * @param onChange callback function
 * @returns {JSX.Element}
 * @constructor
 */
const PostFilterSelect = ({options, defaultValue, value, onChange}) => {
    return (
        <div>
            <select
                className="selectfilter"
                value={value}
                onChange={event => onChange(event.target.value)}
            >
                <option disabled value="">{defaultValue}</option>
                {options.map(option =>
                    <option key={option.value} value={option.value}>
                        {option.name}
                    </option>
                )}
            </select>
        </div>
    );
};

export default PostFilterSelect;
