var task, formName;

function submitAcymForm(newtask, newformName, submitFunction) {
    task = newtask;
    formName = newformName;
    submitFunction = submitFunction === undefined ? 'acySubmitSubForm' : submitFunction;

    let recaptchaid = 'acym-captcha';
    if (newformName) recaptchaid = newformName + '-captcha';

    let initInvisibleRecaptcha = document.querySelector('#' + recaptchaid + '[class="acyg-recaptcha"][data-size="invisible"]');
    if (initInvisibleRecaptcha) initInvisibleRecaptcha.className = 'g-recaptcha';

    let invisibleRecaptcha = document.querySelector('#' + recaptchaid + '[class="g-recaptcha"][data-size="invisible"]');

    if (!invisibleRecaptcha || typeof grecaptcha != 'object') return window[submitFunction]();

    let grcID = invisibleRecaptcha.getAttribute('grcID');

    if (!grcID) {
        grcID = grecaptcha.render(recaptchaid, {
            'sitekey': invisibleRecaptcha.getAttribute('data-sitekey'),
            'callback': submitFunction,
            'size': 'invisible',
            'expired-callback': 'resetRecaptcha',
        });

        invisibleRecaptcha.setAttribute('grcID', grcID);
    }

    let response = grecaptcha.getResponse(grcID);
    if (response) {
        return window[submitFunction]();
    } else {
        grecaptcha.execute(grcID);
        return false;
    }
}

function resetRecaptcha() {
    let recaptchaid = 'acym-captcha';
    if (formName) recaptchaid = formName + '-captcha';

    let invisibleRecaptcha = document.querySelector('#' + recaptchaid + '[class="g-recaptcha"][data-size="invisible"]');
    if (!invisibleRecaptcha) return;

    let grcID = invisibleRecaptcha.getAttribute('grcID');
    grecaptcha.reset(grcID);
}

function acySubmitSubForm() {
    let varform = document[formName];
    let filterEmail = acymModule['emailRegex'];
    let errorMessages = '';
    let i;

    // I don't understand this code, I guess it's useful
    if (!varform.elements) {
        //Try to get the right form as we may have several ones on the same page with the same ID... :(
        if (varform[0].elements['user[email]'] && varform[0].elements['user[email]'].value && filterEmail.test(varform[0].elements['user[email]'].value)) {
            varform = varform[0];
        } else {
            varform = varform[varform.length - 1];
        }
    }

    // Reset invalid CSS class
    let invalidFields = document.querySelectorAll('#' + formName + ' .invalid');
    if (invalidFields.length != 0) {
        for (i = 0 ; i < invalidFields.length ; i++) {
            invalidFields[i].classList.remove('invalid');
        }
    }

    // Make sure the entered email address is correct
    let emailField = varform.elements['user[email]'];
    if (emailField.value != acymModule['EMAILCAPTION']) emailField.value = emailField.value.replace(/ /g, '');
    if (!emailField || emailField.value == acymModule['EMAILCAPTION'] || !filterEmail.test(emailField.value)) {
        errorMessages = acymModule['VALID_EMAIL'];
        emailField.classList.add('invalid');
    }

    //required fields
    let lastName, checked, required, reg, previousRequired;
    let requiredRadio = document.querySelectorAll('#' + formName + ' [type="radio"][data-required]');
    if (requiredRadio.length > 0) {
        lastName = '';
        checked = 0;
        for (i = 0 ; i < requiredRadio.length ; i++) {
            required = JSON.parse(requiredRadio[i].getAttribute('data-required'));
            if (lastName !== '' && lastName != requiredRadio[i].getAttribute('name') && checked === 0) {
                previousRequired = JSON.parse(requiredRadio[i - 1].getAttribute('data-required'));
                errorMessages += '\r\n' + previousRequired.message;
                acymAddInvalidClass(formName, lastName);
            } else if (lastName !== '' && lastName != requiredRadio[i].getAttribute('name') && checked > 0) {
                checked = 0;
            }
            if (requiredRadio[i].checked) {
                checked++;
            }
            lastName = requiredRadio[i].getAttribute('name');
        }
        if (checked === 0) {
            errorMessages += '\r\n' + required.message;
            acymAddInvalidClass(formName, lastName);
        }
    }

    let requiredCheckbox = document.querySelectorAll('#' + formName + ' [type="checkbox"][data-required]');
    if (requiredCheckbox.length > 0) {
        lastName = '';
        checked = 0;
        for (i = 0 ; i < requiredCheckbox.length ; i++) {
            required = JSON.parse(requiredCheckbox[i].getAttribute('data-required'));
            if (lastName !== '' && lastName != requiredCheckbox[i].getAttribute('name').slice(0, requiredCheckbox[i].getAttribute('name').lastIndexOf('[')) && checked === 0) {
                previousRequired = JSON.parse(requiredCheckbox[i - 1].getAttribute('data-required'));
                errorMessages += '\r\n' + previousRequired.message;
                acymAddInvalidClass(formName, lastName);
            } else if (lastName !== '' && lastName != requiredCheckbox[i].getAttribute('name').slice(0, requiredCheckbox[i].getAttribute('name').lastIndexOf('[')) && checked > 0) {
                checked = 0;
            }
            if (requiredCheckbox[i].checked) {
                checked++;
            }
            lastName = requiredCheckbox[i].getAttribute('name').slice(0, requiredCheckbox[i].getAttribute('name').lastIndexOf('['));
        }
        if (checked === 0) {
            errorMessages += '\r\n' + required.message;
            acymAddInvalidClass(formName, lastName);
        }
    }

    let requiredDate = document.querySelectorAll('#' + formName + ' [acym-field-type="date"][data-required]');
    if (requiredDate.length != 0) {
        lastName = '';
        checked = 0;
        let currentField;
        for (i = 0 ; i < requiredDate.length ; i++) {
            currentField = requiredDate[i];
            required = JSON.parse(currentField.getAttribute('data-required'));
            if (lastName !== '' && lastName != currentField.getAttribute('name').slice(0, currentField.getAttribute('name').lastIndexOf('[')) && checked < 3) {
                checked = 0;
                previousRequired = JSON.parse(requiredDate[i - 1].getAttribute('data-required'));
                errorMessages += '\r\n' + previousRequired.message;
            } else if (lastName !== '' && lastName != currentField.getAttribute('name').slice(0, currentField.getAttribute('name').lastIndexOf('[')) && checked > 0) {
                checked = 0;
            }
            if (currentField.value != '') {
                checked++;
            } else {
                currentField.classList.add('invalid');
            }
            lastName = requiredDate[i].getAttribute('name').slice(0, requiredDate[i].getAttribute('name').lastIndexOf('['));
        }
        if (checked < 3) {
            errorMessages += '\r\n' + required.message;
        }
    }

    let requiredFields = document.querySelectorAll('#' + formName + ' [data-required]:not([type="checkbox"]):not([type="radio"]):not([acym-field-type="date"])');
    if (requiredFields.length > 0) {
        for (i = 0 ; i < requiredFields.length ; i++) {
            required = JSON.parse(requiredFields[i].getAttribute('data-required'));
            if (([
                     'text',
                     'textarea',
                     'single_dropdown',
                     'multiple_dropdown',
                     'phone',
                 ].indexOf(required.type) !== -1) && (requiredFields[i].value === '' || requiredFields[i].value == '0')) {
                errorMessages += '\r\n' + required.message;
                requiredFields[i].classList.add('invalid');
            }

            if (required.type === 'file' && requiredFields[i].files.length === 0) {
                errorMessages += '\r\n' + required.message;
                requiredFields[i].classList.add('invalid');
            }
        }
    }

    let authorizeContent = document.querySelectorAll('#' + formName + ' [data-authorized-content]');
    if (authorizeContent.length > 0) {
        for (i = 0 ; i < authorizeContent.length ; i++) {
            let json = authorizeContent[i].getAttribute('data-authorized-content');
            let authorized;
            let defaultAuthorizeValue = [];
            defaultAuthorizeValue.push(0);

            try {
                let begin = json.indexOf('{');
                let beginBrackets = json.indexOf('[');

                if ((!isNaN(begin) && begin > 0) && (!isNaN(beginBrackets) && beginBrackets > 0)) {
                    json = json.substring(begin);
                }

                if (json !== undefined || json !== '') {
                    authorized = JSON.parse(json);
                } else {
                    authorized = defaultAuthorizeValue;
                }
            } catch (error) {
                authorized = defaultAuthorizeValue;
                console.log(error.stack);
            }

            reg = '';
            if (authorized[0] === 'number') {
                reg = /^[0-9]+$/;
            } else if (authorized[0] === 'letters') {
                reg = /^[a-zA-Z]+$/;
            } else if (authorized[0] === 'numbers_letters') {
                reg = /^[a-zA-Z0-9]+$/;
            } else if (authorized[0] === 'regex') {
                reg = new RegExp(authorized['regex']);
            }

            if (reg !== '' && !reg.test(authorizeContent[i].value)) {
                authorizeContent[i].classList.add('invalid');
                errorMessages += '\r\n' + authorized['message'];
            }
        }
    }

    if (errorMessages.length > 0) {
        alert(errorMessages);
        return false;
    }

    // If there are no hidden lists, it means the user must select at least one list to subscribe/unsubscribe
    if (varform.elements['hiddenlists'].value.length < 1) {
        let listschecked = false;
        let allLists = varform.elements['subscription[]'];
        if (allLists && (typeof allLists.value == 'undefined' || allLists.value.length === 0)) {
            for (b = 0 ; b < allLists.length ; b++) {
                if (allLists[b].checked) listschecked = true;
            }
            if (!listschecked) {
                alert(acymModule['NO_LIST_SELECTED']);
                return false;
            }
        }
    }

    if (task !== 'unsubscribe') {
        let termsandconditions = varform.elements['terms'];
        if (termsandconditions && !termsandconditions.checked) {
            if (typeof acymModule != 'undefined') {
                alert(acymModule['ACCEPT_TERMS']);
            }
            return false;
        }

        if (typeof acymModule != 'undefined' && typeof acymModule['excludeValues' + formName] != 'undefined') {
            for (let fieldName in acymModule['excludeValues' + formName]) {
                if (!acymModule['excludeValues' + formName].hasOwnProperty(fieldName)) continue;
                if (!varform.elements['user[' + fieldName + ']'] || varform.elements['user[' + fieldName + ']'].value != acymModule['excludeValues' + formName][fieldName]) continue;

                varform.elements['user[' + fieldName + ']'].value = '';
            }
        }
    }

    // Handle google analytics
    if (typeof ga != 'undefined') {
        let gaType = task === 'unsubscribe' ? 'unsubscribe' : 'subscribe';
        ga('send', 'pageview', gaType);
    }

    // Set the form's task field to subscribe / unsubscribe
    taskField = varform.task;
    taskField.value = task;

    // If no ajax, submit the form
    if (!varform.elements['ajax'] || !varform.elements['ajax'].value || varform.elements['ajax'].value == '0') {
        varform.submit();
        return false;
    }

    let form = document.getElementById(formName);
    let formData = new FormData(form);
    // Change the acyba form's opacity to show we are doing stuff
    form.className += ' acym_module_loading';
    form.style.filter = 'alpha(opacity=50)';
    form.style.opacity = '0.5';

    // Delete the previous error messages if the user re-submits the form
    let previousErrorMessages = document.querySelectorAll('.responseContainer.acym_module_error.message_' + formName);
    Array.prototype.forEach.call(previousErrorMessages, function (node) {
        node.parentNode.removeChild(node);
    });

    let xhr = new XMLHttpRequest();
    xhr.open('POST', form.action);
    xhr.onload = function () {
        let message = 'Ajax Request Failure';
        let type = 'error';

        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            message = response.message;
            type = response.type;
        }
        acymDisplayAjaxResponse(decodeURIComponent(message), type, formName);
    };
    xhr.send(formData);

    return false;
}

function acymAddInvalidClass(formName, elemName) {
    let elToInvalidate = document.querySelectorAll('#' + formName + ' [name^="' + elemName + '"]');
    for (let i = 0 ; i < elToInvalidate.length ; i++) {
        elToInvalidate[i].classList.add('invalid');
    }
    return true;
}

function acymDisplayAjaxResponse(message, type, formName, replace) {
    //create a new div class=responseContainer as we didn't have one already to display the answer
    let responseContainer = document.createElement('div');
    let fulldiv = document.getElementById('acym_fulldiv_' + formName);

    if (fulldiv.firstChild) {
        fulldiv.insertBefore(responseContainer, fulldiv.firstChild);
    } else {
        fulldiv.appendChild(responseContainer);
    }

    //We reset the class name to responseContainer
    responseContainer.className = 'responseContainer';

    let form = document.getElementById(formName);

    //We can remove the loading class from the form
    let elclass = form.className;
    let rmclass = 'acym_module_loading';
    let res = elclass.replace(' ' + rmclass, '', elclass);
    if (res == elclass) res = elclass.replace(rmclass + ' ', '', elclass);
    if (res == elclass) res = elclass.replace(rmclass, '', elclass);
    form.className = res;

    //We can set the content of responseContainer with the new message
    responseContainer.innerHTML = message;

    //We set the container class
    if (type == 'success') {
        responseContainer.className += ' acym_module_success';
    } else {
        responseContainer.className += ' acym_module_error';
        form.style.opacity = '1';
    }

    if (replace || type == 'success') {
        form.style.display = 'none';
    }
    responseContainer.className += ' message_' + formName;
    responseContainer.className += ' slide_open';
}
