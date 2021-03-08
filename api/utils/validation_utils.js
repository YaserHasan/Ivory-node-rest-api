exports.validateString = (string, propertyName, regex, minLength) => {
    if (string == undefined)
        return `the field ${propertyName} is required`;
    if (typeof string !== 'string')
        return `${propertyName} must be a valid string`;
    if (string.trim() == "")
        return `the field ${propertyName} is required`;
    if (minLength && string.trim().length < minLength)
        return `${propertyName} must be at least ${minLength} characters long`;
    if (regex && !string.match(regex))
        return `invalid ${propertyName}`;
}

exports.validateBoolean = (boolean, propertyName) => {
    if (boolean == undefined)
        return `the field ${propertyName} is required`;
    if (typeof boolean !== 'boolean')
        return `${propertyName} must be a valid boolean`;
}

exports.validateNum = (num, propertyName, negative, min, max) => {
    if (num == undefined)
        return `the field ${propertyName} is required`;
    if (typeof num !== 'number')
        return `${propertyName} must be a valid number`;
    if (min && num < min)
            return `${propertyName} must be greater than ${min-1}`;
    if (max && num > max)
            return `${propertyName} must be less than ${max+1}`;
    if (!negative && num < 0)
        return `${propertyName} must be a valid positive number`;
}