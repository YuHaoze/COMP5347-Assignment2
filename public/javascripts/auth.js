/**
 * Handle client side actions in auth pages
 * */
$(document).ready(function () {
    submitRegisterForm()
    submitLoginForm()
    submitResetForm()
})

/**
 * Validate register form submission
 */
function submitRegisterForm() {
    let form = $('#register-form')
    form.on('submit', function () {
        if (!form.valid()) {
            return false
        }
    })

    form.validate({
        rules: {
            firstname: {
                required: true,
                minlength: 2,
                maxlength: 10,
            },
            lastname: {
                required: true,
                minlength: 2,
                maxlength: 10,
            },
            email: {
                required: true,
                minlength: 5,
                maxlength: 255,
                email: true
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 25,
            },
            password_confirm: {
                required: true,
                equalTo: '#password'
            },
            answer1: {
                required: true,
                minlength: 3,
                maxlength: 20,
            },
            answer2: {
                required: true,
                minlength: 3,
                maxlength: 20,
            },
        },
        messages: {}
    })
}

/**
 * Validate login form submission
 */
function submitLoginForm() {
    let form = $('#login-form')
    form.on('submit', function () {
        if (!form.valid()) {
            return false
        }
    })

    form.validate({
        rules: {
            email: {
                required: true,
                minlength: 6,
                maxlength: 30,
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 25,
            },
        },
        messages: {}
    })
}

/**
 * Validate reset form submission
 */

 function submitResetForm(){
    let form = $('#reset-form')
    form.on('submit', function () {
        if (!form.valid()) {
            return false
        }
    })

    form.validate({
        rules: {
            password: {
                required: true,
                minlength: 6,
                maxlength: 25,
            },
            password_confirm: {
                required: true,
                equalTo: '#password'
            }
        },
        messages: {}
    })
 }
