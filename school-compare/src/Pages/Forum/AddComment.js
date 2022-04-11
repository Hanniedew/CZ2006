import { Backdrop, CircularProgress } from '@mui/material';
import React, { useState } from 'react'
import { useAuth } from '../../Firebase';

function AddComment(props) {

    const user = useAuth();
    const [text, setText] = useState(props.initialText ? props.initialText : "");
    const onSubmit = (event) => {
        event.preventDefault()
        props.handleSubmit(text, props.postId);
        setText("")
    }
    const onChange = (event) => {
        setText(event.target.value)
    }
    const isTextAreaDisabled = !user ? true : !user.emailVerified ? true : text.length === 0 ? true : false


    return (
        // <div>
        //     {!user ? (
        //         <Backdrop
        //             sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        //             open
        //         >
        //             <CircularProgress color="inherit" />
        //         </Backdrop>) : (
        <form onSubmit={onSubmit}>
            <textarea
                className='comment-form-textarea'
                value={text}
                onChange={onChange}
                placeholder='what are your thoughts?'
                disabled={!user} />

            <button
                className='comment-button'
                disabled={isTextAreaDisabled}>
                {props.submitLabel}
            </button>
            {props.hasCancelButton &&
                <button
                    type="button"
                    className='comment-button comment-cancel-button'
                    onClick={props.handleCancel}>
                    Cancel
                </button>}
            {!user && <p className='comment-warning'>
                Please Login to Comment.
            </p>}
            {(user && !user.emailVerified) && <p className='comment-warning'>
                Please Verify your Email to Comment.
            </p>}

        </form>
        // )}
        // </div>
    )
}

export default AddComment