import React from 'react';
import { Input } from '../input';

function DataList(props){
    const { id, hint, label, name, value, onChange, errorMessage, items } = props;
    return (
        <>
            <Input
                id={id}
                hint={hint ? {children: hint} : null}
                label={label}
                name={name}
                type="text"
                value={value}
                onChange={onChange}
                errorMessage={errorMessage}
                list={`${id}list`}
                />
            <datalist id={`${id}list`}>
                {items.map(option => {
                    return <option key={option.value} value={option.value}>{option.children}</option>
                })}
            </datalist>
        </>
    )
}

export { DataList }