// Data validator
const isDataValid = (...fields) => {
    const result = [...fields]?.some(field=> !field?.trim())
    if(!result) {
        return true
    } else {
        return false
    }
}

export default isDataValid