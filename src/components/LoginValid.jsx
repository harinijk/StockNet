import React from "react";

function Validation(values) {
    let errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}|:"<>?`\-=[\]\\;',./]).{8,}$/;

    if (!values.email) {
        errors.email = "Email is required";
    } else if (!emailPattern.test(values.email)) {
        errors.email = "Email address is invalid";
    }

    if (!values.password) {
        errors.password = "Password is required";
    } else if (!passwordPattern.test(values.password)) {
        errors.password = "Password must be at least 8 characters long and include at least one uppercase letter, lowercase letter, digit, and special character";
    }

    return errors;
}

export default Validation;
