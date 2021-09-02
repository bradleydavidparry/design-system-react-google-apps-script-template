import React from 'react';

export default function ViewComponent(props){
    const { Name, data } = props;

    const getCustomComponent = (viewName) => {
        switch(viewName){
            default:
                return null;
        }
    }

    return <>{getCustomComponent(Name)}</>
}